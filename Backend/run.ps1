$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (Test-Path -LiteralPath '.env.local') {
    foreach ($line in Get-Content -LiteralPath '.env.local') {
        if ($line -match '^\s*([A-Z][A-Z0-9_]*)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim(), 'Process')
        }
    }
}
if (-not $env:JWT_SECRET -or [Text.Encoding]::UTF8.GetByteCount($env:JWT_SECRET) -lt 32) {
    throw 'Configura JWT_SECRET con al menos 32 bytes en Backend/.env.local o en el entorno.'
}
if (-not $env:JAVA_HOME) { throw 'Configura JAVA_HOME con la ruta de tu JDK 21.' }
& ./mvnw.cmd spring-boot:run
exit $LASTEXITCODE
