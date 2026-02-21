$root = "c:\Users\Massi\Documents\Webnovis_kiro - backup"
$indexHtml = Get-Content "$root\index.html" -Raw
$chiSiamoHtml = Get-Content "$root\chi-siamo.html" -Raw
$contattiHtml = Get-Content "$root\contatti.html" -Raw

function Check-Pattern($content, $pattern, $label) {
    $found = [regex]::IsMatch($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $status = if ($found) { "SI" } else { "NO" }
    Write-Host "$status | $label"
}

Write-Host "=== INDEX.HTML ==="
Check-Pattern $indexHtml "P\.IVA|partita iva" "P.IVA nel footer"
Check-Pattern $indexHtml "2025.*2026|2026" "Anno fondazione/copyright"
Check-Pattern $indexHtml "Trustindex|elfsight|widget.*review" "Widget recensioni esterno"
Check-Pattern $indexHtml "counter|count-up|odometer" "Counter animati JS"
Check-Pattern $indexHtml "clienti soddisfatti" "Testo clienti soddisfatti"
Check-Pattern $indexHtml "\+\d+.*clienti|\d+.*progetti" "Numeri concreti (clienti/progetti)"
Check-Pattern $indexHtml "newsletter" "Form newsletter"
Check-Pattern $indexHtml "lead.magnet|checklist|guida.gratuita|scarica.*pdf" "Lead magnet"
Check-Pattern $indexHtml "da remoto|tutta Italia" "Geo remoto in footer"
Check-Pattern $indexHtml "Rho.*Milano|Milano.*Rho" "NAP geo multiplo"
Check-Pattern $indexHtml "aggregateRating" "Schema AggregateRating"
Check-Pattern $indexHtml "reviewCount" "Schema reviewCount"
Check-Pattern $indexHtml "GA4|G-[A-Z0-9]+" "Google Analytics 4"
Check-Pattern $indexHtml "gtag" "gtag presente"
Check-Pattern $indexHtml "clarity" "Microsoft Clarity"
Check-Pattern $indexHtml "fbq|meta.pixel" "Meta Pixel"
Check-Pattern $indexHtml "preventivo" "Pagina preventivo"

Write-Host ""
Write-Host "=== CHI-SIAMO.HTML ==="
Check-Pattern $chiSiamoHtml "anni di esperienza|\d+.*anni" "Anni esperienza"
Check-Pattern $chiSiamoHtml "\d+.*clienti|\d+.*progett" "Numeri clienti/progetti"
Check-Pattern $chiSiamoHtml "storia|nato|fondata nel|dal 20" "Storia dell'agenzia"
Check-Pattern $chiSiamoHtml "certificaz|laurea|formazione|corso" "Credenziali/formazione"
Check-Pattern $chiSiamoHtml "curiosit|personale|hobbies|fuori dal lavoro" "Sezione personalita"
Check-Pattern $chiSiamoHtml "foto.*team|team.*foto|nostra.foto|chi.*foto" "Foto del team"

Write-Host ""
Write-Host "=== CONTATTI.HTML ==="
Check-Pattern $contattiHtml "Rho|Milano|Hinterland|Lombardia" "Geo cities nel testo"
Check-Pattern $contattiHtml "da remoto|tutta Italia" "Geo remoto"
Check-Pattern $contattiHtml "serviamo clienti|operiamo" "Area di servizio esplicita"

Write-Host ""
Write-Host "=== PAGINE SPECIALI ==="
$pages = @("come-lavoriamo.html", "processo.html", "preventivo.html", "grazie.html", "lista-attesa.html", "recensioni.html")
foreach ($p in $pages) {
    $exists = Test-Path "$root\$p"
    $status = if ($exists) { "SI" } else { "NO" }
    Write-Host "$status | Pagina /$p"
}

Write-Host ""
Write-Host "=== TITOLI PAGINE SERVIZI ==="
$servizi = Get-ChildItem "$root\servizi\*.html"
foreach ($f in $servizi) {
    $c = Get-Content $f.FullName -Raw
    $titleMatch = [regex]::Match($c, '<title>([^<]+)</title>')
    if ($titleMatch.Success) {
        $title = $titleMatch.Groups[1].Value
        $hasGeo = [regex]::IsMatch($title, "Milano|Rho|Lombardia|Italia", "IgnoreCase")
        $geoStatus = if ($hasGeo) { "GEO-OK" } else { "NO-GEO" }
        Write-Host "$geoStatus | $($f.Name): $title"
    }
}

Write-Host ""
Write-Host "=== TITOLI PAGINE PRINCIPALI ==="
$mainPages = @("index.html", "chi-siamo.html", "contatti.html", "portfolio.html")
foreach ($p in $mainPages) {
    $c = Get-Content "$root\$p" -Raw
    $titleMatch = [regex]::Match($c, '<title>([^<]+)</title>')
    if ($titleMatch.Success) { Write-Host ($p + ": " + $titleMatch.Groups[1].Value) }
}

Write-Host ""
Write-Host "=== BLOG CATEGORIES ==="
$blogFiles = Get-ChildItem "$root\blog\*.html" | Where-Object { $_.Name -ne "index.html" }
Write-Host "Articoli blog: $($blogFiles.Count)"
$categories = @()
foreach ($f in $blogFiles) {
    $c = Get-Content $f.FullName -Raw
    $catMatch = [regex]::Match($c, '"articleSection"\s*:\s*"([^"]+)"')
    if ($catMatch.Success) { $categories += $catMatch.Groups[1].Value }
}
$categories | Group-Object | Sort-Object Count -Descending | ForEach-Object { Write-Host "  $($_.Count)x $($_.Name)" }

Write-Host ""
Write-Host "=== LINK INTERNI BLOG (campione) ==="
$sampleBlog = Get-Content "$root\blog\seo-per-piccole-imprese.html" -Raw
$internalLinks = [regex]::Matches($sampleBlog, 'href="(/[^"]+\.html|https://www\.webnovis[^"]+)"')
Write-Host "Link interni trovati in seo-per-piccole-imprese.html: $($internalLinks.Count)"
