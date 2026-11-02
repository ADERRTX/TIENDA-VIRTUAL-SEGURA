#!/usr/bin/env node
/**
 * security-scan.mjs
 * Ejecuta herramientas de seguridad locales: gitleaks, pnpm audit, Semgrep,
 * OSV-Scanner, Trivy y Hadolint. Solo los ejecuta si están instalados.
 * Si no, avisa "omitido: no instalado" sin fallar.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();

function run(cmd, name) {
  console.log(`\n--- ${name} ---`);
  try {
    const out = execSync(cmd, { stdio: 'inherit', cwd: root, shell: process.platform === 'win32' ? 'powershell' : 'bash' });
    console.log(`${name}: OK`);
  } catch (e) {
    console.error(`${name}: ERROR`);
    process.exit(1);
  }
}

function check(cmd, name) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore', shell: process.platform === 'win32' ? 'powershell' : 'bash' });
    return true;
  } catch {
    return false;
  }
}

const isWindows = process.platform === 'win32';

// Gitleaks
if (check('gitleaks', 'gitleaks')) {
  run('gitleaks detect --no-banner', 'gitleaks');
} else {
  console.log('gitleaks: omitido (no instalado)');
}

// pnpm audit
run('pnpm audit', 'pnpm audit');

// Semgrep
if (check('semgrep', 'semgrep')) {
  run('semgrep scan --config=auto --quiet', 'semgrep');
} else {
  console.log('semgrep: omitido (no instalado)');
}

// OSV-Scanner
if (check('osv-scanner', 'osv-scanner')) {
  run('osv-scanner --scan=lockfile', 'osv-scanner');
} else {
  console.log('osv-scanner: omitido (no instalado)');
}

// Trivy
if (check('trivy', 'trivy') || check('trivy', 'trivy')) {
  run('trivy fs --skip-db-update --exit-code 0', 'trivy');
} else {
  console.log('trivy: omitido (no instalado)');
}

// Hadolint
if (check('hadolint', 'hadolint')) {
  const dockerfiles = ['Dockerfile.backend', 'Dockerfile.frontend'];
  for (const df of dockerfiles) {
    const path = join(root, 'infrastructure', 'docker', df);
    if (existsSync(path)) {
      run(`hadolint ${path}`, `hadolint ${df}`);
    }
  }
} else {
  console.log('hadolint: omitido (no instalado)');
}

console.log('\nSecurity scan completado.');