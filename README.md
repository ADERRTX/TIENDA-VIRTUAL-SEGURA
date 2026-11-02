# Tienda Virtual Segura

## Instalación de herramientas de seguridad (Windows)

### Prerequisitos
- Docker Desktop
- Node.js 20.11.0 (usar .nvmrc)
- pnpm 9.4.0
- Git

### Herramientas de seguridad opcionales

Estas herramientas se ejecutan con `pnpm security:scan` y son opcionales. Si no están instaladas, el script mostrará un mensaje de aviso pero no fallará.

#### Gitleaks
```powershell
# Scoop (recomendado)
scoop install gitleaks

# Chocolatey
choco install gitleaks

# Descarga directa desde https://github.com/gitleaks/gitleaks/releases
```

#### Semgrep
```powershell
pip install semgrep
```

#### OSV-Scanner
```powershell
# Scoop
scoop install osv-scanner

# Chocolatey
choco install osv-scanner
```

#### Trivy
```powershell
# Scoop
scoop install trivy

# Chocolatey
choco install trivy
```

#### Hadolint
```powershell
# Scoop
scoop install hadolint

# Chocolatey
choco install hadolint

# PowerShell
Invoke-WebRequest -Uri "https://github.com/hadolint/hadolint/releases/download/v2.12.0/hadolint-Windows-x86_64.exe" -OutFile "$env:USERPROFILE\bin\hadolint.exe"
```

### Uso
```powershell
# Instalar dependencias
pnpm install

# Ejecutar verificación local (lint + types + tests)
pnpm verify

# Ejecutar escaneo de seguridad
pnpm security:scan

# Servicios de apoyo (BD, storage, mailpit)
docker compose up -d db storage mailpit

# Ver estado de los servicios
docker compose ps

# Ver logs
docker compose logs -f
```