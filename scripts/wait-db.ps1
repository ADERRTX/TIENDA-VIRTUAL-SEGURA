$ErrorActionPreference = 'Stop'
$deadline = (Get-Date).AddMinutes(2)
while ($true) {
  $pgIsReady = Get-Command pg_isready -ErrorAction SilentlyContinue
  if (-not $pgIsReady) {
    Start-Sleep -Seconds 2
    continue
  }
  $result = & pg_isready -h localhost -p 5433 -U $env:POSTGRES_USER -d $env:POSTGRES_DB -t 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host 'PostgreSQL listo en localhost:5433'
    exit 0
  }
  if ((Get-Date) -gt $deadline) {
    Write-Host 'PostgreSQL no estuvo listo en 2 minutos'
    exit 1
  }
  Start-Sleep -Seconds 2
}