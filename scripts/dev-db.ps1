Param(
  [switch]$NoSeed
)

function Ensure-DockerRunning {
  try {
    $null = docker version --format '{{.Server.Version}}' 2>$null
    if ($LASTEXITCODE -ne 0) { return $false }
    return $true
  } catch { return $false }
}

if (-not (Ensure-DockerRunning)) {
  Write-Host "Docker Desktop tidak berjalan. Jalankan Docker Desktop terlebih dahulu lalu ulangi: docker compose up -d" -ForegroundColor Yellow
  exit 1
}

Write-Host "Menyalakan Postgres container (docker compose up -d)" -ForegroundColor Cyan
docker compose up -d db | Out-Null

# Tunggu sampai sehat
Write-Host "Menunggu database siap (health=healthy)..." -ForegroundColor Cyan
$maxTries = 24
for ($i = 0; $i -lt $maxTries; $i++) {
  $status = docker inspect --format '{{.State.Health.Status}}' searchengine-postgres 2>$null
  if ($status -eq 'healthy') { break }
  Start-Sleep -Seconds 5
}

if ($status -ne 'healthy') {
  Write-Host "Database belum healthy. Cek logs: docker logs searchengine-postgres" -ForegroundColor Red
  exit 1
}

Write-Host "Menjalankan prisma migrate..." -ForegroundColor Cyan
npm run db:migrate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $NoSeed) {
  Write-Host "Menjalankan prisma seed..." -ForegroundColor Cyan
  npm run db:seed
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Selesai. Jalankan: npm run dev" -ForegroundColor Green

