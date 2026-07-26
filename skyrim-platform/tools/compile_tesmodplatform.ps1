# Compiles src/platform_se/psc/*.psc -> src/platform_se/pex/*.pex
# Uses Bethesda PapyrusCompiler from russo-2025/papyrus-compiler release when CK is missing.

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$psc = Join-Path $root 'src\platform_se\psc'
$pex = Join-Path $root 'src\platform_se\pex'
$flags = Join-Path (Split-Path $root -Parent) 'cmake\TESV_Papyrus_Flags.flg'
$tools = Join-Path $PSScriptRoot 'papyrus-compiler'
$compiler = Join-Path $tools 'papyrus-compiler\Original Compiler\PapyrusCompiler.exe'
$zipUrl = 'https://github.com/russo-2025/papyrus-compiler/releases/download/2026.03.15/papyrus-compiler-windows.zip'

if (-not (Test-Path -LiteralPath $compiler)) {
  New-Item -ItemType Directory -Force -Path $tools | Out-Null
  $zip = Join-Path $tools 'papyrus-compiler-windows.zip'
  Write-Host "Downloading Papyrus compiler..."
  curl.exe -L -o $zip $zipUrl
  Expand-Archive -Path $zip -DestinationPath $tools -Force
}

if (-not (Test-Path -LiteralPath $compiler)) {
  throw "PapyrusCompiler not found at $compiler"
}

New-Item -ItemType Directory -Force -Path $pex | Out-Null
& $compiler $psc "-flags=$flags" "-output=$pex" "-import=$psc" -all
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$out = Join-Path $pex 'TESModPlatform.pex'
Write-Host "OK: $out ($((Get-Item -LiteralPath $out).Length) bytes)"
