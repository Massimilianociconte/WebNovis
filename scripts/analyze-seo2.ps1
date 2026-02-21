$root = "c:\Users\Massi\Documents\Webnovis_kiro - backup"

Write-Host "=== META PIXEL CHECK ==="
$indexHtml = Get-Content "$root\index.html" -Raw
$hasFbq = [regex]::IsMatch($indexHtml, 'fbq\(|fbevents\.js|connect\.facebook\.net')
Write-Host "Meta Pixel (fbq): $(if ($hasFbq) { 'SI' } else { 'NO' })"

Write-Host ""
Write-Host "=== FOOTER CONTENT ==="
$footerMatch = [regex]::Match($indexHtml, '(?i)<footer[^>]*>(.*?)</footer>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($footerMatch.Success) {
    $footerText = [regex]::Replace($footerMatch.Groups[1].Value, '<[^>]+>', ' ')
    $footerText = [regex]::Replace($footerText, '\s+', ' ').Trim()
    Write-Host $footerText.Substring(0, [Math]::Min(800, $footerText.Length))
} else {
    Write-Host "Footer non trovato come tag <footer>"
}

Write-Host ""
Write-Host "=== NEWSLETTER FORM TYPE ==="
$newsletterMatch = [regex]::Match($indexHtml, '(?i)(newsletter|iscrivi|subscribe).{0,500}')
if ($newsletterMatch.Success) {
    $txt = [regex]::Replace($newsletterMatch.Value, '<[^>]+>', ' ')
    $txt = [regex]::Replace($txt, '\s+', ' ').Trim()
    Write-Host $txt.Substring(0, [Math]::Min(300, $txt.Length))
}

Write-Host ""
Write-Host "=== CHI SIAMO - BODY TEXT (E-E-A-T) ==="
$chiHtml = Get-Content "$root\chi-siamo.html" -Raw
$mainMatch = [regex]::Match($chiHtml, '(?i)<main[^>]*>(.*?)</main>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($mainMatch.Success) {
    $txt = [regex]::Replace($mainMatch.Groups[1].Value, '<[^>]+>', ' ')
    $txt = [regex]::Replace($txt, '\s+', ' ').Trim()
    Write-Host $txt.Substring(0, [Math]::Min(1000, $txt.Length))
}

Write-Host ""
Write-Host "=== BLOG INTERNAL LINKS (tutti gli articoli) ==="
$blogFiles = Get-ChildItem "$root\blog\*.html" | Where-Object { $_.Name -ne "index.html" }
$totalLinks = 0
$lowLinkArticles = @()
foreach ($f in $blogFiles) {
    $c = Get-Content $f.FullName -Raw
    $links = [regex]::Matches($c, 'href="(https://www\.webnovis|/[^"#]+\.html)')
    $count = $links.Count
    $totalLinks += $count
    if ($count -lt 3) { $lowLinkArticles += ($f.Name + " (" + $count + " link)") }
}
Write-Host "Media link interni per articolo: $([Math]::Round($totalLinks / $blogFiles.Count, 1))"
Write-Host "Articoli con meno di 3 link interni: $($lowLinkArticles.Count)"
$lowLinkArticles | ForEach-Object { Write-Host "  - $_" }

Write-Host ""
Write-Host "=== ALT TEXT IMMAGINI (index.html) ==="
$imgs = [regex]::Matches($indexHtml, '<img[^>]+>')
$noAlt = 0; $withCity = 0
foreach ($img in $imgs) {
    $altMatch = [regex]::Match($img.Value, 'alt="([^"]*)"')
    if (-not $altMatch.Success -or $altMatch.Groups[1].Value -eq "") { $noAlt++ }
    elseif ([regex]::IsMatch($altMatch.Groups[1].Value, 'Milano|Rho|Lombardia', 'IgnoreCase')) { $withCity++ }
}
Write-Host "Immagini totali: $($imgs.Count) | Senza alt: $noAlt | Con geo in alt: $withCity"

Write-Host ""
Write-Host "=== CONTATTI PAGE - BODY TEXT ==="
$contHtml = Get-Content "$root\contatti.html" -Raw
$contMain = [regex]::Match($contHtml, '(?i)<main[^>]*>(.*?)</main>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
if ($contMain.Success) {
    $txt = [regex]::Replace($contMain.Groups[1].Value, '<[^>]+>', ' ')
    $txt = [regex]::Replace($txt, '\s+', ' ').Trim()
    Write-Host $txt.Substring(0, [Math]::Min(600, $txt.Length))
}

Write-Host ""
Write-Host "=== LOCAL LANDING PAGES ==="
$localPages = Get-ChildItem "$root\*.html" | Where-Object { $_.Name -match "agenzia|siti-web|web-agency" }
$localPages | ForEach-Object { Write-Host $_.Name }
$serviceFolderLocal = Get-ChildItem "$root\servizi\*.html" | Where-Object { $_.Name -match "varese|saronno|monza|hinterland|locale" }
if ($serviceFolderLocal) { $serviceFolderLocal | ForEach-Object { Write-Host "servizi/" + $_.Name } }
else { Write-Host "Nessuna pagina geo in /servizi/" }
