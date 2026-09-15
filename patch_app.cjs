const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const functionsToPatch = [
  'const handleDepositSuccess = (amount: number, method: string, referenceId: string) => {',
  'const handleSwapSuccess = (swapAmount: number, gpEarned?: number) => {',
  'const handleWithdrawSuccess = (amount: number, destination: string, referenceId: string, withdrawalSource: WithdrawalSource, voucherDetails?: Partial<Transaction>) => {',
  'const handleInvestSuccess = (plan: InvestmentPlan, amount: number, autoSwappedCash?: number) => {',
  'const handleClaimReturns = (investmentId: string) => {',
  'const handleClaimAllReturns = () => {',
  'const adminApproveDeposit = (txn: Transaction) => {',
  'const adminRejectDeposit = (txn: Transaction, rejectReason: string, rejectReasonHi: string) => {',
  'const adminApproveWithdrawal = (txnId: string, referenceId: string) => {',
  'const adminRejectWithdrawal = (txnId: string, rejectReason: string, rejectReasonHi: string) => {',
  'const executeGpTransfer = (recipientLoginId: string, amount: number): boolean => {',
  'const handleSimulateComplete24hLock = (investmentId: string) => {',
  'const handleSimulateMaturity = (investmentId: string) => {',
  'const handleSimulateComplete6hCycle = (investmentId: string) => {'
];

for (const fn of functionsToPatch) {
  if (code.includes(fn)) {
    code = code.replace(fn, fn + '\n    if (!wallet) return;' + (fn.includes(': boolean') ? ' false;' : ''));
  } else {
    console.log('Could not find:', fn);
  }
}

// Special case for processInvestmentsMidnight which is not an arrow function
code = code.replace('const processInvestmentsMidnight = () => {', 'const processInvestmentsMidnight = () => {\n    if (!wallet) return;');

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched successfully');
