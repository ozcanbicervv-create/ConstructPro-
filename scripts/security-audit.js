#!/usr/bin/env node

/**
 * Security audit script for ConstructPro
 * Performs comprehensive security checks and generates reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSubsection(title) {
  log(`\n${'-'.repeat(40)}`, 'blue');
  log(`${title}`, 'blue');
  log(`${'-'.repeat(40)}`, 'blue');
}

async function runCommand(command, description) {
  try {
    log(`\n🔍 ${description}...`, 'yellow');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

async function checkDependencyVulnerabilities() {
  logSubsection('Dependency Vulnerability Scan');
  
  const auditResult = await runCommand('npm audit --json', 'Running npm audit');
  
  if (auditResult.success) {
    try {
      const auditData = JSON.parse(auditResult.output);
      const vulnerabilities = auditData.metadata?.vulnerabilities || {};
      
      log(`\n📊 Vulnerability Summary:`, 'white');
      log(`   Critical: ${vulnerabilities.critical || 0}`, vulnerabilities.critical > 0 ? 'red' : 'green');
      log(`   High: ${vulnerabilities.high || 0}`, vulnerabilities.high > 0 ? 'red' : 'yellow');
      log(`   Moderate: ${vulnerabilities.moderate || 0}`, vulnerabilities.moderate > 0 ? 'yellow' : 'green');
      log(`   Low: ${vulnerabilities.low || 0}`, 'green');
      log(`   Info: ${vulnerabilities.info || 0}`, 'green');
      
      if (vulnerabilities.critical > 0 || vulnerabilities.high > 0) {
        log(`\n⚠️  Action required: Update packages with critical/high vulnerabilities`, 'red');
        return false;
      }
      
      return true;
    } catch (error) {
      log(`Failed to parse audit results: ${error.message}`, 'red');
      return false;
    }
  }
  
  return false;
}

async function checkOutdatedDependencies() {
  logSubsection('Outdated Dependencies Check');
  
  const outdatedResult = await runCommand('npm outdated --json', 'Checking for outdated packages');
  
  if (outdatedResult.output) {
    try {
      const outdatedData = JSON.parse(outdatedResult.output);
      const outdatedCount = Object.keys(outdatedData).length;
      
      if (outdatedCount > 0) {
        log(`\n📦 Found ${outdatedCount} outdated packages:`, 'yellow');
        Object.entries(outdatedData).forEach(([pkg, info]) => {
          log(`   ${pkg}: ${info.current} → ${info.latest}`, 'yellow');
        });
        log(`\n💡 Run 'npm update' to update packages`, 'blue');
      } else {
        log(`\n✅ All packages are up to date`, 'green');
      }
      
      return outdatedCount === 0;
    } catch (error) {
      log(`No outdated packages found`, 'green');
      return true;
    }
  }
  
  return true;
}

async function checkSecurityHeaders() {
  logSubsection('Security Headers Check');
  
  // Check if security headers are properly configured
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  
  let headersConfigured = false;
  
  if (fs.existsSync(middlewarePath)) {
    const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
    if (middlewareContent.includes('applySecurityHeaders')) {
      log(`✅ Security headers configured in middleware`, 'green');
      headersConfigured = true;
    }
  }
  
  if (fs.existsSync(nextConfigPath)) {
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    if (nextConfigContent.includes('headers()')) {
      log(`✅ Security headers configured in Next.js config`, 'green');
      headersConfigured = true;
    }
  }
  
  if (!headersConfigured) {
    log(`❌ Security headers not properly configured`, 'red');
    return false;
  }
  
  return true;
}

async function checkEnvironmentVariables() {
  logSubsection('Environment Variables Check');
  
  // Load environment variables from .env.local if it exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value.replace(/"/g, '');
      }
    });
  }
  
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ];
  
  const optionalEnvVars = [
    'NEXTAUTH_URL',
    'ALLOWED_ORIGINS',
  ];
  
  let allRequired = true;
  
  log(`\n🔐 Required environment variables:`, 'white');
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`   ✅ ${envVar}`, 'green');
    } else {
      log(`   ❌ ${envVar} (missing)`, 'red');
      allRequired = false;
    }
  });
  
  log(`\n🔧 Optional environment variables:`, 'white');
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log(`   ✅ ${envVar}`, 'green');
    } else {
      log(`   ⚠️  ${envVar} (not set)`, 'yellow');
    }
  });
  
  return allRequired;
}

async function checkFilePermissions() {
  logSubsection('File Permissions Check');
  
  const sensitiveFiles = [
    '.env',
    '.env.local',
    'package.json',
    'next.config.ts',
  ];
  
  let allSecure = true;
  
  sensitiveFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        const mode = (stats.mode & parseInt('777', 8)).toString(8);
        
        if (file.startsWith('.env') && mode !== '600') {
          log(`   ⚠️  ${file}: permissions ${mode} (should be 600)`, 'yellow');
        } else {
          log(`   ✅ ${file}: permissions ${mode}`, 'green');
        }
      } catch (error) {
        log(`   ❌ ${file}: cannot check permissions`, 'red');
        allSecure = false;
      }
    } else {
      log(`   ℹ️  ${file}: not found`, 'blue');
    }
  });
  
  return allSecure;
}

async function checkCodeQuality() {
  logSubsection('Code Quality Check');
  
  // Run ESLint security rules
  const eslintResult = await runCommand(
    'npx eslint . --ext .ts,.tsx --config eslint.config.mjs --format json',
    'Running ESLint security checks'
  );
  
  if (eslintResult.success) {
    try {
      const eslintData = JSON.parse(eslintResult.output);
      const totalErrors = eslintData.reduce((sum, file) => sum + file.errorCount, 0);
      const totalWarnings = eslintData.reduce((sum, file) => sum + file.warningCount, 0);
      
      log(`\n📝 ESLint Results:`, 'white');
      log(`   Errors: ${totalErrors}`, totalErrors > 0 ? 'red' : 'green');
      log(`   Warnings: ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green');
      
      return totalErrors === 0;
    } catch (error) {
      log(`ESLint completed with no issues`, 'green');
      return true;
    }
  }
  
  return false;
}

async function checkTypeScript() {
  logSubsection('TypeScript Check');
  
  const tscResult = await runCommand('npx tsc --noEmit', 'Running TypeScript compiler check');
  return tscResult.success;
}

async function generateSecurityReport() {
  logSubsection('Generating Security Report');
  
  const reportPath = path.join(process.cwd(), 'security-audit-report.md');
  const timestamp = new Date().toISOString();
  
  let report = `# ConstructPro Security Audit Report\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `## Summary\n\n`;
  
  // Run all checks and collect results
  const results = {
    dependencies: await checkDependencyVulnerabilities(),
    outdated: await checkOutdatedDependencies(),
    headers: await checkSecurityHeaders(),
    environment: await checkEnvironmentVariables(),
    permissions: await checkFilePermissions(),
    codeQuality: await checkCodeQuality(),
    typescript: await checkTypeScript(),
  };
  
  const passedChecks = Object.values(results).filter(Boolean).length;
  const totalChecks = Object.keys(results).length;
  
  report += `**Overall Score:** ${passedChecks}/${totalChecks} checks passed\n\n`;
  
  report += `## Check Results\n\n`;
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const checkName = check.charAt(0).toUpperCase() + check.slice(1);
    report += `- **${checkName}:** ${status}\n`;
  });
  
  report += `\n## Recommendations\n\n`;
  
  if (!results.dependencies) {
    report += `- Update packages with critical/high vulnerabilities immediately\n`;
  }
  
  if (!results.headers) {
    report += `- Configure security headers in middleware or Next.js config\n`;
  }
  
  if (!results.environment) {
    report += `- Set all required environment variables\n`;
  }
  
  if (!results.codeQuality) {
    report += `- Fix ESLint errors and warnings\n`;
  }
  
  if (!results.typescript) {
    report += `- Fix TypeScript compilation errors\n`;
  }
  
  report += `\n## Next Steps\n\n`;
  report += `1. Address any failed checks listed above\n`;
  report += `2. Run security audit regularly (weekly recommended)\n`;
  report += `3. Keep dependencies updated\n`;
  report += `4. Monitor security advisories for used packages\n`;
  report += `5. Review and update security policies as needed\n`;
  
  fs.writeFileSync(reportPath, report, 'utf8');
  log(`\n📄 Security report saved to: ${reportPath}`, 'green');
  
  return passedChecks === totalChecks;
}

async function main() {
  log(`🔒 ConstructPro Security Audit`, 'magenta');
  log(`Starting comprehensive security check...`, 'white');
  
  const startTime = Date.now();
  
  try {
    logSection('SECURITY AUDIT');
    
    const allPassed = await generateSecurityReport();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logSection('AUDIT COMPLETE');
    
    if (allPassed) {
      log(`\n🎉 All security checks passed! (${duration}s)`, 'green');
      process.exit(0);
    } else {
      log(`\n⚠️  Some security checks failed. Review the report for details. (${duration}s)`, 'yellow');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n💥 Security audit failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  checkDependencyVulnerabilities,
  checkOutdatedDependencies,
  checkSecurityHeaders,
  checkEnvironmentVariables,
  checkFilePermissions,
  checkCodeQuality,
  checkTypeScript,
  generateSecurityReport,
};