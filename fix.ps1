$c = [System.IO.File]::ReadAllText("index.html", [System.Text.Encoding]::UTF8)
$startMarker = '<div class="hero-slide is-active">'
$endMarker = '</div>'
$start = $c.IndexOf($startMarker)
if ($start -eq -1) {
  Write-Host "marker not found"
  exit
}
$rest = $c.Substring($start)
$relEnd = $rest.IndexOf($endMarker, [System.StringComparison]::Ordinal)
if ($relEnd -eq -1) {
  Write-Host "end marker not found"
  exit
}
$end = $start + $relEnd + $endMarker.Length
$replace = $c.Remove($start, $end - $start)
[System.IO.File]::WriteAllText("index.html", $replace, [System.Text.Encoding]::UTF8)
Write-Host "removed " + ($end - $start) + " chars"
