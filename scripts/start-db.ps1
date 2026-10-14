$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$pgBin = 'C:/Program Files/PostgreSQL/18/bin'
$dataPath = Join-Path $projectRoot '.local/postgres'
New-Item -ItemType Directory -Path (Join-Path $projectRoot '.local') -Force | Out-Null
if (-not (Test-Path (Join-Path $dataPath 'PG_VERSION'))) {
  & "$pgBin/initdb.exe" -D $dataPath -U sortlearn -A trust --encoding=UTF8 --locale=C
  if ($LASTEXITCODE -ne 0) { throw 'No fue posible inicializar PostgreSQL.' }
}
& "$pgBin/pg_ctl.exe" -D $dataPath status
if ($LASTEXITCODE -ne 0) {
  & "$pgBin/pg_ctl.exe" -D $dataPath -l (Join-Path $projectRoot '.local/postgres.log') -o "-h 127.0.0.1 -p 55432" -w start
  if ($LASTEXITCODE -ne 0) { throw 'No fue posible iniciar PostgreSQL en el puerto 55432.' }
}
$exists = & "$pgBin/psql.exe" -h 127.0.0.1 -p 55432 -U sortlearn -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='sortlearn'"
if ($LASTEXITCODE -ne 0) { throw 'No fue posible consultar PostgreSQL.' }
if ($exists -ne '1') {
  & "$pgBin/createdb.exe" -h 127.0.0.1 -p 55432 -U sortlearn sortlearn
  if ($LASTEXITCODE -ne 0) { throw 'No fue posible crear la base sortlearn.' }
}
Write-Output 'PostgreSQL local listo en 127.0.0.1:55432. Solo para desarrollo local.'
