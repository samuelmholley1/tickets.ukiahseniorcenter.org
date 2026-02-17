# Fix mojibake across source files
# These are UTF-8 emoji bytes that got decoded as Windows-1252

$files = @(
    "src\app\internal\lunch\page.tsx",
    "src\app\internal\page.tsx",
    "src\app\ticket\page.tsx"
)

# Read each file as raw bytes, then decode as UTF-8 to see what's actually there
foreach ($file in $files) {
    $fullPath = Join-Path $PWD $file
    if (-not (Test-Path $fullPath)) {
        Write-Host "SKIP: $file not found"
        continue
    }
    
    $content = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    $original = $content
    
    # Each mojibake pattern: the broken string -> correct emoji
    # These are the literal UTF-8 decoded strings
    $replacements = @{
        # Emoji mojibake (UTF-8 bytes read as Latin-1)
        [char]0x00f0 + [char]0x0178 + [char]0x00a7 + [char]0x0160 = [char]0xD83E + [char]0xDDCA  # ice cube
        [char]0x00f0 + [char]0x0178 + [char]0x201c + [char]0x00a4 = [char]0xD83D + [char]0xDCE4  # outbox tray
        [char]0x00f0 + [char]0x0178 + [char]0x0178 + [char]0x00b4 = ""  # placeholder - will handle differently
    }
    
    Write-Host "Processing $file..."
    Write-Host "  Length: $($content.Length) chars"
    
    # Count mojibake occurrences
    $mojibakeCount = ([regex]::Matches($content, [char]0x00f0 + [char]0x0178)).Count
    Write-Host "  Mojibake sequences found: $mojibakeCount"
    
    # Show first few
    $idx = $content.IndexOf([string]([char]0x00f0) + [string]([char]0x0178))
    if ($idx -ge 0) {
        $snippet = $content.Substring([Math]::Max(0, $idx - 5), [Math]::Min(20, $content.Length - [Math]::Max(0, $idx - 5)))
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($snippet)
        Write-Host "  First occurrence at index $idx"
        Write-Host "  Hex bytes: $($bytes | ForEach-Object { '{0:X2}' -f $_ } | Join-String -Separator ' ')"
    }
}
