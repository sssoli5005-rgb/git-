param(
    [switch]$ResetLogin,
    [switch]$SetProviderKeys,
    [switch]$SetScannerKeys,
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

# Existing unprefixed settings are read once as a migration aid, then written as chat-only keys.
$chatGroqKey = Read-ExistingSetting "CHAT_GROQ_API_KEY"
if (-not $chatGroqKey) { $chatGroqKey = Read-ExistingSetting "GROQ_API_KEY" }
$chatGeminiKey = Read-ExistingSetting "CHAT_GEMINI_API_KEY"
if (-not $chatGeminiKey) { $chatGeminiKey = Read-ExistingSetting "GEMINI_API_KEY" }
if ($SetProviderKeys) {
    $groqSecure = Read-Host "Enter CHAT_GROQ_API_KEY (chat only)" -AsSecureString
    $groqPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($groqSecure)
    try { $chatGroqKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($groqPtr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($groqPtr) }
    $geminiSecure = Read-Host "Enter CHAT_GEMINI_API_KEY (chat only)" -AsSecureString
    $geminiPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($geminiSecure)
    try { $chatGeminiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($geminiPtr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($geminiPtr) }
}
$scannerGroqKey = Read-ExistingSetting "SCANNER_GROQ_API_KEY"
$scannerGeminiKey = Read-ExistingSetting "SCANNER_GEMINI_API_KEY"
$scannerOpenRouterKey = Read-ExistingSetting "SCANNER_OPENROUTER_API_KEY"
if ($SetScannerKeys) {
    $scannerGroqSecure = Read-Host "Enter SCANNER_GROQ_API_KEY (scanner only)" -AsSecureString
    $scannerGroqPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($scannerGroqSecure)
    try { $scannerGroqKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($scannerGroqPtr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($scannerGroqPtr) }
    $scannerGeminiSecure = Read-Host "Enter SCANNER_GEMINI_API_KEY (scanner only)" -AsSecureString
    $scannerGeminiPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($scannerGeminiSecure)
    try { $scannerGeminiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($scannerGeminiPtr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($scannerGeminiPtr) }
    $openRouterSecure = Read-Host "Enter SCANNER_OPENROUTER_API_KEY (scanner only)" -AsSecureString
    $openRouterPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($openRouterSecure)
    try { $scannerOpenRouterKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($openRouterPtr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($openRouterPtr) }
}
$chatGroqModel = Read-ExistingSetting "CHAT_GROQ_MODEL"
$chatGeminiModel = Read-ExistingSetting "CHAT_GEMINI_MODEL"
if (-not $chatGroqModel) { $chatGroqModel = "qwen/qwen3.8-27b" }
if (-not $chatGeminiModel) { $chatGeminiModel = "gemini-3.8-flash" }

$content = @(
    "APP_USERNAME=$username"
    "ADMIN_PASSWORD=$adminPassword"
    "APP_SESSION_SECRET=$sessionSecret"
    "CHAT_GROQ_API_KEY=$chatGroqKey"
    "CHAT_GROQ_MODEL=$chatGroqModel"
    "CHAT_GEMINI_API_KEY=$chatGeminiKey"
    "CHAT_GEMINI_MODEL=$chatGeminiModel"
    "CHAT_OLLAMA_BASE_URL=http://127.0.0.1:11434"
    "CHAT_OLLAMA_MODEL=qwen2.5:14b"
    "SCANNER_GROQ_API_KEY=$scannerGroqKey"
    "SCANNER_GEMINI_API_KEY=$scannerGeminiKey"
    "SCANNER_OPENROUTER_API_KEY=$scannerOpenRouterKey"
    "SCANNER_OLLAMA_BASE_URL=http://127.0.0.1:11434"
    "SCANNER_OLLAMA_VISION_MODEL=gemma3:4b"
    "SCANNER_QWEN_VISION_MODEL=qwen2.5vl:7b"
    "SCANNER_INTERNVL_VISION_MODEL=internvl3:8b"
    "SCANNER_GROQ_VISION_MODEL=qwen/qwen3.8-27b"
    "SCANNER_GEMINI_VISION_MODEL=gemini-3.8-flash"
)

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($envPath, (($content -join "`r`n") + "`r`n"), $utf8)

Write-Host "Local environment configured at $envPath" -ForegroundColor Green
Write-Host "This file is ignored by Git." -ForegroundColor Green
if ($generatedPassword) {
    Write-Host "Temporary login username: $username" -ForegroundColor Yellow
    Write-Host "Temporary login password: $adminPassword" -ForegroundColor Yellow
}
if (-not $chatGroqKey -or -not $chatGeminiKey) {
    Write-Host "Add CHAT_GROQ_API_KEY and CHAT_GEMINI_API_KEY for hosted chat." -ForegroundColor Yellow
}
if (-not $scannerGroqKey -and -not $scannerGeminiKey -and -not $scannerOpenRouterKey) {
    Write-Host "Scanner will use Cloudflare Workers AI and the free public-catalog fallback until scanner-only keys are added." -ForegroundColor Yellow
}
