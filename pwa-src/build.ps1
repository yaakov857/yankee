# Builds the installable app (PWA) into ..\pwa from ..\store.html.
# Run again after every change to store.html:  powershell -ExecutionPolicy Bypass -File pwa-src\build.ps1
$ErrorActionPreference = 'Stop'
$src  = $PSScriptRoot
$root = Split-Path $src -Parent
$out  = Join-Path $root 'pwa'
New-Item -ItemType Directory -Force $out | Out-Null

$store  = Get-Content -Raw -Encoding utf8 (Join-Path $root 'store.html')
$head   = Get-Content -Raw -Encoding utf8 (Join-Path $src 'head.html')
$extras = Get-Content -Raw -Encoding utf8 (Join-Path $src 'app-extras.html')

# store.html = <title>, fonts and <style> first, then the page. Split after the first </style>.
$cut = $store.IndexOf('</style>')
if ($cut -lt 0) { throw 'store.html has no </style>' }
$cut += '</style>'.Length
$storeHead = $store.Substring(0, $cut) -replace '<meta name="claude:viewport-fit-sides"[^>]*>\s*', ''
$storeBody = $store.Substring($cut)

$html = $head + $storeHead + "`n</head>`n<body>`n" + $storeBody + "`n" + $extras + "</body>`n</html>`n"
$utf8 = New-Object System.Text.UTF8Encoding $false
[IO.File]::WriteAllText((Join-Path $out 'index.html'), $html, $utf8)

# Product list, settings and product photos travel next to index.html
foreach ($name in 'settings.js','products.js') {
  $p = Join-Path $root $name
  if (-not (Test-Path $p)) { throw "$name is missing next to store.html" }
  Copy-Item $p (Join-Path $out $name) -Force
}
$imgOut = Join-Path $out 'images'
if (Test-Path $imgOut) { Remove-Item $imgOut -Recurse -Force }
$imgSrc = Join-Path $root 'images'
if (Test-Path $imgSrc) { Copy-Item $imgSrc $imgOut -Recurse -Force }

# Warn about photo paths in products.js that do not exist
$prodText = (Get-Content -Encoding utf8 (Join-Path $root 'products.js') | Where-Object { $_ -notmatch '^\s*//' }) -join "`n"
foreach ($m in [regex]::Matches($prodText, "['""](images/[^'""]+)['""]")) {
  if (-not (Test-Path (Join-Path $root $m.Groups[1].Value))) { Write-Warning "Missing photo: $($m.Groups[1].Value)" }
}

$build = Get-Date -Format 'yyyyMMddHHmmss'
$sw = (Get-Content -Raw -Encoding utf8 (Join-Path $src 'sw.js')).Replace('__BUILD__', $build)
[IO.File]::WriteAllText((Join-Path $out 'sw.js'), $sw, $utf8)

if (-not (Test-Path (Join-Path $out 'icons\icon-512.png'))) { & (Join-Path $src 'make-icons.ps1') -OutDir (Join-Path $out 'icons') }
Write-Host "Built pwa\ (version $build)"
