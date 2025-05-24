# PowerShell script to start Chrome in remote debugging mode

$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $ChromePath)) {
    $ChromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
}

# Create a temporary user data directory
$TempDir = Join-Path $env:TEMP "chrome-debug-$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Set up Chrome flags for debugging
$Args = @(
    "--remote-debugging-port=9222",
    "--user-data-dir=`"$TempDir`"",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-default-apps",
    "--disable-popup-blocking",
    "--disable-translate",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-extensions",
    "--window-size=1200,800",
    "--window-position=100,100",
    "about:blank"
)

try {
    Write-Host "Starting Chrome in debug mode..."
    Write-Host "Debug URL: http://localhost:9222/json/version"
    Start-Process -FilePath $ChromePath -ArgumentList $Args

    # Keep PowerShell window open
    Write-Host "Press Ctrl+C to exit and cleanup..."
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup on exit
    Write-Host "`nCleaning up..."
    Get-Process | Where-Object { $_.Path -eq $ChromePath } | Stop-Process -Force
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}