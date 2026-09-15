const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexes = [
  { rx: /(const handleWithdrawSuccess = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return;' },
  { rx: /(const handleInvestSuccess = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return;' },
  { rx: /(const handleClaimReturns = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return;' },
  { rx: /(const adminApproveDeposit = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return;' },
  { rx: /(const adminRejectDeposit = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return;' },
  { rx: /(const adminApproveWithdrawal = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return;' },
  { rx: /(const adminRejectWithdrawal = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return;' },
  { rx: /(const executeGpTransfer = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return false;' },
  { rx: /(const handleSimulateMaturity = \([\s\S]*?\) => \{)/, rep: '$1\n    if (!wallet) return;' },
  { rx: /(const processMidnightAutoBackupAndSystemChecks = async \(\) => \{)/, rep: '$1\n    if (!wallet) return;' }
];

for (const rule of regexes) {
  code = code.replace(rule.rx, rule.rep);
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched successfully');
