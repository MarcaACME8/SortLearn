$projectRoot = Split-Path $PSScriptRoot -Parent
& 'C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe' -D (Join-Path $projectRoot '.local/postgres') -m fast -w stop
