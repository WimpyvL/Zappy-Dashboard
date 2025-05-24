# Start Chrome with remote debugging enabled
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    # Try alternative Chrome paths
    $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    if (-not (Test-Path $chromePath)) {
        Write-Host "Chrome not found in standard locations. Please modify the script with the correct path to chrome.exe"
        exit
    }
}

$userDataDir = "$env:TEMP\chrome-debug-profile"
if (-not (Test-Path $userDataDir)) {
    New-Item -ItemType Directory -Path $userDataDir | Out-Null
}

Write-Host "Starting Chrome with remote debugging enabled on port 9222..."
Write-Host "Data directory: $userDataDir"
& $chromePath --remote-debugging-port=9222 --user-data-dir="$userDataDir"
