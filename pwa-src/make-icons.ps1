param([string]$OutDir)
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force $OutDir | Out-Null

function New-Icon([int]$size, [string]$path, [double]$boxRatio) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.TextRenderingHint = 'AntiAliasGridFit'
  $ink   = [System.Drawing.Color]::FromArgb(22,33,58)
  $kraft = [System.Drawing.Color]::FromArgb(201,154,91)
  $dark  = [System.Drawing.Color]::FromArgb(42,29,12)
  $g.Clear($ink)

  # parcel box, centered
  $b = [int]($size * $boxRatio); $x = [int](($size - $b) / 2); $y = $x
  $r = [int]($b * 0.14)
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $gp.AddArc($x, $y, $r*2, $r*2, 180, 90); $gp.AddArc($x+$b-$r*2, $y, $r*2, $r*2, 270, 90)
  $gp.AddArc($x+$b-$r*2, $y+$b-$r*2, $r*2, $r*2, 0, 90); $gp.AddArc($x, $y+$b-$r*2, $r*2, $r*2, 90, 90); $gp.CloseFigure()
  $g.FillPath((New-Object System.Drawing.SolidBrush $kraft), $gp)

  # packing tape across the middle
  $tape = [System.Drawing.Color]::FromArgb(90, 42, 29, 12)
  $g.SetClip($gp)
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $tape), $x, [int]($y + $b*0.47), $b, [int]($b*0.07))
  $g.ResetClip()

  # Store initial (matches the "Y" logo mark in store.html)
  $font = New-Object System.Drawing.Font 'Arial', ([float]($b * 0.62)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat; $sf.Alignment = 'Center'; $sf.LineAlignment = 'Center'
  $rect = New-Object System.Drawing.RectangleF $x, ([float]($y + $b*0.02)), $b, $b
  $g.DrawString('Y', $font, (New-Object System.Drawing.SolidBrush $dark), $rect, $sf)

  $g.Dispose(); $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}

New-Icon 192 (Join-Path $OutDir 'icon-192.png') 0.70
New-Icon 512 (Join-Path $OutDir 'icon-512.png') 0.70
New-Icon 512 (Join-Path $OutDir 'icon-maskable-512.png') 0.52   # content inside the 80% safe zone
New-Icon 180 (Join-Path $OutDir 'apple-touch-icon.png') 0.70
New-Icon 32  (Join-Path $OutDir 'favicon-32.png') 0.80
