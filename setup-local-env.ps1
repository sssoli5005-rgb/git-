param(
    [switch]$ResetLogin,
    [switch]$SetProviderKeys,
    [string]$Username,
    [string]$Password
)

$ErrorActionPreference = "Stop"
$envPath = Join-Path $PSScriptRoot ".env.local"

function Read-ExistingSetting([string]$name) {
    if (-not (Test-Path -LiteralPath $envPath)) { return "" }
    $line = Get-Content -LiteralPath $envPath |
        Where-Object { $_ -match '^' + [regex]::Escape($name) + '=' } |
        Select-Object -Last 1
    if (-not $line) { return "" }
    return ($line -replace '^' + [regex]::Escape($name) + '=\s*', '').Trim().Trim('"', "'")
}

function Random-Token([int]$bytes) {
    $random = New-Object byte[] $bytes
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($random)
    } finally {
        $rng.Dispose()
    }
    return (($random | ForEach-Object { $_.ToString("x2") }) -join "")
}

$username = Read-ExistingSetting "APP_USERNAME"
if ($Username) { $username = $Username.Trim() }
elseif ($ResetLogin -or -not $username) { $username = "admin" }

$adminPassword = Read-ExistingSetting "ADMIN_PASSWORD"
$sessionSecret = Read-ExistingSetting "APP_SESSION_SECRET"
$generatedPassword = $false
$generatedSessionSecret = $false

if ($Password) {
    $adminPassword = $Password.Trim()
    $generatedPassword = $true
}
elseif ($ResetLogin -or -not $adminPassword) {
    $adminPassword = Random-Token 12
    $generatedPassword = $true
}
if (-not $sessionSecret) {
    $sessionSecret = Random-Token 32
    $generatedSessionSecret = $true
}

$groqKey = Read-ExistingSetting "GROQ_API_KEY"
$geminiKey = Read-ExistingSetting "GEMINI_API_KEY"
if ($SetProviderKeys) {
    $groqSecure = Read-Host "Enter GROQ_API_KEY" -AsSecureString
    $groqPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($groqSecure)
    try { $groqKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($groqPtr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($groqPtr) }
    $geminiSecure = Read-Host "Enter GEMINI_API_KEY" -AsSecureString
    $geminiPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($geminiSecure)
    try { $geminiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($geminiPtr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($geminiPtr) }
}
$groqModel = Read-ExistingSetting "GROQ_MODEL"
$geminiModel = Read-ExistingSetting "GEMINI_MODEL"
if (-not $groqModel) { $groqModel = "qwen/qwen3.8-27b" }
if (-not $geminiModel) { $geminiModel = "gemini-2.5-flash" }

$content = @(
    "APP_USERNAME=$username"
    "ADMIN_PASSWORD=$adminPassword"
    "APP_SESSION_SECRET=$sessionSecret"
    "GROQ_API_KEY=$groqKey"
    "GROQ_MODEL=$groqModel"
    "GEMINI_API_KEY=$geminiKey"
    "GEMINI_MODEL=$geminiModel"
    "OLLAMA_BASE_URL=http://127.0.0.1:11434"
    "OLLAMA_MODEL=qwen2.5:14b"
    "OLLAMA_VISION_MODEL=gemma3:4b"
    "QWEN_VISION_MODEL=qwen2.5vl:7b"
    "INTERNVL_VISION_MODEL=internvl3:8b"
)

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($envPath, (($content -join "`r`n") + "`r`n"), $utf8)

Write-Host "Local environment configured at $envPath" -ForegroundColor Green
Write-Host "This file is ignored by Git." -ForegroundColor Green
if ($generatedPassword) {
    Write-Host "Temporary login username: $username" -ForegroundColor Yellow
    Write-Host "Temporary login password: $adminPassword" -ForegroundColor Yellow
}
if (-not $groqKey -or -not $geminiKey) {
    Write-Host "Add GROQ_API_KEY and GEMINI_API_KEY to .env.local, then restart npm run dev." -ForegroundColor Yellow
}
