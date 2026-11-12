# Starts the Vite dev server with the repo-local portable Node.js.
# Usage: .\scripts\start-arg.ps1

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

. (Join-Path $PSScriptRoot "use-node.ps1")

Push-Location $root
try {
    & npm.cmd start
}
finally {
    Pop-Location
}
