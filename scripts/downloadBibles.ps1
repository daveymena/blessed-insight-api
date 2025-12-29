# Script para descargar Biblias en español desde bolls.life
# Versiones: NVI, RV1960, NTV, PDT, LBLA, BTX3

$headers = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
$baseUrl = "https://bolls.life"

# Lista de libros de la Biblia (66 libros)
$books = @(
    @{id=1; abbrev="gn"; name="Genesis"},
    @{id=2; abbrev="ex"; name="Exodus"},
    @{id=3; abbrev="lv"; name="Leviticus"},
    @{id=4; abbrev="nm"; name="Numbers"},
    @{id=5; abbrev="dt"; name="Deuteronomy"},
    @{id=6; abbrev="js"; name="Joshua"},
    @{id=7; abbrev="jg"; name="Judges"},
    @{id=8; abbrev="rt"; name="Ruth"},
    @{id=9; abbrev="1sm"; name="1 Samuel"},
    @{id=10; abbrev="2sm"; name="2 Samuel"},
    @{id=11; abbrev="1kgs"; name="1 Kings"},
    @{id=12; abbrev="2kgs"; name="2 Kings"},
    @{id=13; abbrev="1ch"; name="1 Chronicles"},
    @{id=14; abbrev="2ch"; name="2 Chronicles"},
    @{id=15; abbrev="ezr"; name="Ezra"},
    @{id=16; abbrev="ne"; name="Nehemiah"},
    @{id=17; abbrev="et"; name="Esther"},
    @{id=18; abbrev="job"; name="Job"},
    @{id=19; abbrev="ps"; name="Psalms"},
    @{id=20; abbrev="prv"; name="Proverbs"},
    @{id=21; abbrev="ec"; name="Ecclesiastes"},
    @{id=22; abbrev="so"; name="Song of Solomon"},
    @{id=23; abbrev="is"; name="Isaiah"},
    @{id=24; abbrev="jr"; name="Jeremiah"},
    @{id=25; abbrev="lm"; name="Lamentations"},
    @{id=26; abbrev="ez"; name="Ezekiel"},
    @{id=27; abbrev="dn"; name="Daniel"},
    @{id=28; abbrev="ho"; name="Hosea"},
    @{id=29; abbrev="jl"; name="Joel"},
    @{id=30; abbrev="am"; name="Amos"},
    @{id=31; abbrev="ob"; name="Obadiah"},
    @{id=32; abbrev="jn"; name="Jonah"},
    @{id=33; abbrev="mi"; name="Micah"},
    @{id=34; abbrev="na"; name="Nahum"},
    @{id=35; abbrev="hk"; name="Habakkuk"},
    @{id=36; abbrev="zp"; name="Zephaniah"},
    @{id=37; abbrev="hg"; name="Haggai"},
    @{id=38; abbrev="zc"; name="Zechariah"},
    @{id=39; abbrev="ml"; name="Malachi"},
    @{id=40; abbrev="mt"; name="Matthew"},
    @{id=41; abbrev="mk"; name="Mark"},
    @{id=42; abbrev="lk"; name="Luke"},
    @{id=43; abbrev="jn"; name="John"},
    @{id=44; abbrev="act"; name="Acts"},
    @{id=45; abbrev="rm"; name="Romans"},
    @{id=46; abbrev="1co"; name="1 Corinthians"},
    @{id=47; abbrev="2co"; name="2 Corinthians"},
    @{id=48; abbrev="gl"; name="Galatians"},
    @{id=49; abbrev="eph"; name="Ephesians"},
    @{id=50; abbrev="ph"; name="Philippians"},
    @{id=51; abbrev="cl"; name="Colossians"},
    @{id=52; abbrev="1ts"; name="1 Thessalonians"},
    @{id=53; abbrev="2ts"; name="2 Thessalonians"},
    @{id=54; abbrev="1tm"; name="1 Timothy"},
    @{id=55; abbrev="2tm"; name="2 Timothy"},
    @{id=56; abbrev="tt"; name="Titus"},
    @{id=57; abbrev="phm"; name="Philemon"},
    @{id=58; abbrev="hb"; name="Hebrews"},
    @{id=59; abbrev="jm"; name="James"},
    @{id=60; abbrev="1pe"; name="1 Peter"},
    @{id=61; abbrev="2pe"; name="2 Peter"},
    @{id=62; abbrev="1jn"; name="1 John"},
    @{id=63; abbrev="2jn"; name="2 John"},
    @{id=64; abbrev="3jn"; name="3 John"},
    @{id=65; abbrev="jd"; name="Jude"},
    @{id=66; abbrev="rv"; name="Revelation"}
)

function Download-Bible {
    param (
        [string]$version,
        [string]$outputFile
    )
    
    Write-Host "Descargando $version..." -ForegroundColor Cyan
    $bible = @()
    
    foreach ($book in $books) {
        Write-Host "  Libro $($book.id)/66: $($book.name)" -NoNewline
        
        try {
            $url = "$baseUrl/get-text/$version/$($book.id)/"
            $response = Invoke-WebRequest -Uri $url -Headers $headers -TimeoutSec 30
            $chapters = $response.Content | ConvertFrom-Json
            
            # Agrupar por capítulo
            $chaptersGrouped = $chapters | Group-Object { [math]::Floor(($_.pk - $chapters[0].pk) / 1000) + 1 }
            
            # Obtener capítulos reales
            $bookUrl = "$baseUrl/get-book/$version/$($book.id)/"
            $bookInfo = (Invoke-WebRequest -Uri $bookUrl -Headers $headers).Content | ConvertFrom-Json
            
            $bookData = @{
                abbrev = $book.abbrev
                name = $book.name
                chapters = @()
            }
            
            foreach ($chapter in $bookInfo) {
                $chapterVerses = @()
                foreach ($verse in $chapter) {
                    $text = $verse.text -replace '<br>', ' ' -replace '\[\d+\]', ''
                    $chapterVerses += $text
                }
                $bookData.chapters += ,$chapterVerses
            }
            
            $bible += $bookData
            Write-Host " OK" -ForegroundColor Green
        }
        catch {
            Write-Host " ERROR: $_" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 200
    }
    
    $bible | ConvertTo-Json -Depth 10 -Compress | Out-File $outputFile -Encoding UTF8
    Write-Host "Guardado en $outputFile" -ForegroundColor Green
}

# Descargar versiones
Download-Bible -version "NVI" -outputFile "src/data/bible_es_nvi.json"
