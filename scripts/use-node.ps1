# Adds the repo-local portable Node.js to PATH for the current PowerShell session.
# Usage: . .\scripts\use-node.ps1

$nodeDir = (Resolve-Path (Join-Path $PSScriptRoot "..\.tools\node-v22.23.4-win-x64")).Path
$nodeExe = Join-Path $nodeDir "node.exe"
$npmCmd = Join-Path $nodeDir "npm.cmd"

if (-not (Test-Path $nodeExe)) {
    Write-Error "Portable Node.js was not found at $nodeDir"
    return
}

$env:PATH = "$nodeDir;$env:PATH"

Write-Host "Node $(& $nodeExe -v) / npm $(& $npmCmd -v)"
Write-Host "Portable Node: $nodeDir"
