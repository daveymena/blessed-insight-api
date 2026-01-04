# Script para descargar Comentarios Bíblicos (Biblias de Estudio) desde bolls.life
# Versiones: MHC (Matthew Henry Concise)

$headers = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
$baseUrl = "https://bolls.life"

# Lista de libros (Mismo ID mapping)
$books = @(
    @{id=1; name="Genesis"}, @{id=2; name="Exodus"}, @{id=3; name="Leviticus"},
    @{id=4; name="Numbers"}, @{id=5; name="Deuteronomy"}, @{id=6; name="Joshua"},
    @{id=7; name="Judges"}, @{id=8; name="Ruth"}, @{id=9; name="1 Samuel"},
    @{id=10; name="2 Samuel"}, @{id=11; name="1 Kings"}, @{id=12; name="2 Kings"},
    @{id=13; name="1 Chronicles"}, @{id=14; name="2 Chronicles"}, @{id=15; name="Ezra"},
    @{id=16; name="Nehemiah"}, @{id=17; name="Esther"}, @{id=18; name="Job"},
    @{id=19; name="Psalms"}, @{id=20; name="Proverbs"}, @{id=21; name="Ecclesiastes"},
    @{id=22; name="Song of Solomon"}, @{id=23; name="Isaiah"}, @{id=24; name="Jeremiah"},
    @{id=25; name="Lamentations"}, @{id=26; name="Ezekiel"}, @{id=27; name="Daniel"},
    @{id=28; name="Hosea"}, @{id=29; name="Joel"}, @{id=30; name="Amos"},
    @{id=31; name="Obadiah"}, @{id=32; name="Jonah"}, @{id=33; name="Micah"},
    @{id=34; name="Nahum"}, @{id=35; name="Habakkuk"}, @{id=36; name="Zephaniah"},
    @{id=37; name="Haggai"}, @{id=38; name="Zechariah"}, @{id=39; name="Malachi"},
    @{id=40; name="Matthew"}, @{id=41; name="Mark"}, @{id=42; name="Luke"},
    @{id=43; name="John"}, @{id=44; name="Acts"}, @{id=45; name="Romans"},
    @{id=46; name="1 Corinthians"}, @{id=47; name="2 Corinthians"}, @{id=48; name="Galatians"},
    @{id=49; name="Ephesians"}, @{id=50; name="Philippians"}, @{id=51; name="Colossians"},
    @{id=52; name="1 Thessalonians"}, @{id=53; name="2 Thessalonians"}, @{id=54; name="1 Timothy"},
    @{id=55; name="2 Timothy"}, @{id=56; name="Titus"}, @{id=57; name="Philemon"},
    @{id=58; name="Hebrews"}, @{id=59; name="James"}, @{id=60; name="1 Peter"},
    @{id=61; name="2 Peter"}, @{id=62; name="1 John"}, @{id=63; name="2 John"},
    @{id=64; name="3 John"}, @{id=65; name="Jude"}, @{id=66; name="Revelation"}
)

function Download-Commentary {
    param (
        [string]$version, # e.g. "MHC"
        [string]$outputFile
    )
    
    Write-Host "Descargando Comentario $version..." -ForegroundColor Cyan
    $commentary = @()
    
    foreach ($book in $books) {
        Write-Host "  Libro $($book.id): $($book.name)" -NoNewline
        try {
            # Bolls API: /get-text/VERSION/BOOKID/
            $url = "$baseUrl/get-text/$version/$($book.id)/"
            $response = Invoke-WebRequest -Uri $url -Headers $headers -TimeoutSec 30
            $content = $response.Content | ConvertFrom-Json
            
            # Simple structure: Book -> Chapter -> Verses (Commentary text)
            $bookData = @{
                id = $book.id
                name = $book.name
                comments = $content # Guardamos raw array {pk, verse, text}
            }
            
            $commentary += $bookData
            Write-Host " OK" -ForegroundColor Green
        }
        catch {
            Write-Host " ERROR: $_" -ForegroundColor Red
        }
        Start-Sleep -Milliseconds 100
    }
    
    # Ensure dir exists
    $dir = Split-Path $outputFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

    $commentary | ConvertTo-Json -Depth 5 -Compress | Out-File $outputFile -Encoding UTF8
    Write-Host "Comentario guardado en $outputFile" -ForegroundColor Green
}

# Ejecutar descarga
Download-Commentary -version "MHC" -outputFile "src/data/commentary_mhc.json"
