$ErrorActionPreference = "Stop"

$appRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$tailscaleCandidates = @(
  (Get-Command tailscale.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue),
  (Join-Path $env:ProgramFiles "Tailscale IPN\tailscale.exe"),
  (Join-Path $env:ProgramFiles "Tailscale\tailscale.exe")
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

if (-not $tailscaleCandidates) {
  throw "Tailscale is not installed. Install it on Windows, sign in, then run this script again."
}

$tailscale = $tailscaleCandidates[0]
$tailStatusText = & $tailscale status --json
if ($LASTEXITCODE -ne 0) {
  throw "Tailscale is not connected. Open Tailscale, sign in, and connect this PC to your tailnet."
}

$tailStatus = $tailStatusText | ConvertFrom-Json
if (-not $tailStatus.Self.DNSName -or $tailStatus.BackendState -ne "Running") {
  throw "Tailscale is installed but not connected. Sign in and connect this PC to your tailnet."
}

$ollamaModel = $env:OLLAMA_MODEL
if ([string]::IsNullOrWhiteSpace($ollamaModel)) {
  $envFile = Join-Path $appRoot ".env.local"
  if (Test-Path $envFile) {
    $modelLine = Get-Content -LiteralPath $envFile |
      Where-Object { $_ -match '^\s*OLLAMA_MODEL\s*=' } |
      Select-Object -Last 1
    if ($modelLine) {
      $ollamaModel = $modelLine -replace '^\s*OLLAMA_MODEL\s*=\s*', ""
      $ollamaModel = $ollamaModel.Trim()
      if ($ollamaModel.StartsWith('"')) {
        $ollamaModel = $ollamaModel.Trim([char]'"')
      } elseif ($ollamaModel.StartsWith("'")) {
        $ollamaModel = $ollamaModel.Trim([char]"'")
      } else {
        $ollamaModel = ($ollamaModel -split '\s+#|#', 2)[0].Trim()
      }
    }
  }
}
if ([string]::IsNullOrWhiteSpace($ollamaModel)) {
  $ollamaModel = "qwen2.5:14b"
}
$env:OLLAMA_MODEL = $ollamaModel
$env:OLLAMA_BASE_URL = "http://127.0.0.1:11434"
try {
  $ollamaModels = (Invoke-RestMethod -Uri "$env:OLLAMA_BASE_URL/api/tags" -TimeoutSec 5).models
} catch {
  throw "Ollama is not reachable at 127.0.0.1:11434. Start Ollama, then run this script again."
}

if (-not ($ollamaModels | Where-Object { $_.name -eq $ollamaModel })) {
  throw "Configured Ollama model '$ollamaModel' is not installed. Run 'ollama run $ollamaModel' locally, then run this script again."
}

$listeners = @(Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue)
$nonLoopbackListeners = @($listeners | Where-Object { $_.LocalAddress -notin @("127.0.0.1", "::1") })
if ($nonLoopbackListeners.Count -gt 0) {
  $addresses = ($nonLoopbackListeners | Select-Object -ExpandProperty LocalAddress -Unique) -join ", "
  throw "Port 8080 is currently exposed on $addresses. Stop the existing app server (Ctrl+C in its terminal) before using this private launcher. It will not stop another process for you."
}

$appUrl = "http://127.0.0.1:8080/"
$appReady = $false
if ($listeners.Count -gt 0) {
  try {
    $appResponse = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 5
    $appReady = $appResponse.StatusCode -ge 200 -and $appResponse.StatusCode -lt 400
  } catch {
    throw "Port 8080 is occupied by a process that did not return the app. Stop that process, then retry."
  }
}

if (-not $appReady) {
  $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if (-not $npm) {
    throw "npm.cmd was not found. Install Node.js, reopen PowerShell, then retry."
  }

  $stdoutPath = Join-Path $env:TEMP "ekhtaberha-private-app.out.log"
  $stderrPath = Join-Path $env:TEMP "ekhtaberha-private-app.err.log"
  Start-Process `
    -FilePath $npm.Source `
    -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "8080", "--strictPort") `
    -WorkingDirectory $appRoot `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -WindowStyle Minimized | Out-Null

  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try {
      $appResponse = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
      if ($appResponse.StatusCode -ge 200 -and $appResponse.StatusCode -lt 400) {
        $appReady = $true
        break
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  if (-not $appReady) {
    throw "The app did not start on 127.0.0.1:8080. Check $stderrPath for the startup error."
  }
}

$serveOutput = & $tailscale serve --bg $appUrl 2>&1
if ($LASTEXITCODE -ne 0) {
  throw "Tailscale Serve could not be configured: $serveOutput"
}

$hostname = $tailStatus.Self.DNSName.TrimEnd(".")
$privateUrl = "https://$hostname"
$serveStatus = & $tailscale serve status 2>&1
if ($LASTEXITCODE -ne 0) {
  throw "Could not verify Tailscale Serve status: $serveStatus"
}

try {
  $privateResponse = Invoke-WebRequest -Uri $privateUrl -UseBasicParsing -TimeoutSec 20
  if ($privateResponse.StatusCode -lt 200 -or $privateResponse.StatusCode -ge 400) {
    throw "Unexpected HTTP status $($privateResponse.StatusCode)."
  }
  Write-Host "Private app URL (verified): $privateUrl" -ForegroundColor Green
} catch {
  Write-Host "Tailscale Serve is configured for the tailnet URL: $privateUrl" -ForegroundColor Yellow
  Write-Warning "The HTTPS URL did not verify from this PC yet. Keep Tailscale connected and check its Serve status; do not share the URL outside your tailnet."
}

Write-Host "The app and Ollama stay on this PC. Tailnet-only Serve forwards to 127.0.0.1; Ollama is not exposed to the network."
Write-Host "Keep the minimized npm window open while using the app. Press Ctrl+C in that window to stop the app server."