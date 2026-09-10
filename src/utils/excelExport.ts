import * as XLSX from 'xlsx';
import { BackupDataPayload, BackupRecord } from '../types';

/**
 * Utility to export all application data into a beautifully structured Excel (.xlsx) workbook.
 * Contains sheets:
 * 1. Summary (Executive Dashboard)
 * 2. Users (Accounts & KYC Status)
 * 3. Active Investments (Holdings & ROI)
 * 4. Transactions (Ledger)
 * 5. Investment Plans (Catalog)
 * 6. Treasury Ledger (Company Reserve Logs)
 * 7. Platform Rules (System Policies)
 */
export function exportAllDataToExcel(
  data: BackupDataPayload,
  filenamePrefix = 'GCap_All_Data_Export'
): { success: boolean; filename: string; error?: string } {
  try {
    const wb = XLSX.utils.book_new();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${filenamePrefix}_${timestamp}.xlsx`;

    // 1. Executive Summary Sheet
    const summaryData = [
      { Parameter: 'Report Generated At', Value: new Date().toLocaleString('en-IN') },
      { Parameter: 'Platform Name', Value: data.rules.platformName || 'GCap Smart Investments' },
      { Parameter: 'Company Treasury Main Balance', Value: `₹${data.treasury.balance.toLocaleString('en-IN')}` },
      { Parameter: 'Total Capital Injected into Treasury', Value: `₹${data.treasury.totalInjected.toLocaleString('en-IN')}` },
      { Parameter: 'Total Capital Deducted from Treasury', Value: `₹${data.treasury.totalDeducted.toLocaleString('en-IN')}` },
      { Parameter: 'Treasury Transferred to Users', Value: `₹${data.treasury.totalTransferredToUsers.toLocaleString('en-IN')}` },
      { Parameter: 'Investor Wallet Available Cash', Value: `₹${data.wallet.cashBalance.toLocaleString('en-IN')}` },
      { Parameter: 'Investor Total Active Invested', Value: `₹${data.wallet.totalInvested.toLocaleString('en-IN')}` },
      { Parameter: 'Investor Total Returns Earned', Value: `₹${data.wallet.totalEarned.toLocaleString('en-IN')}` },
      { Parameter: 'Total Registered Users', Value: data.users.length },
      { Parameter: 'Total Active Investments Count', Value: data.investments.length },
      { Parameter: 'Total Transactions Logged', Value: data.transactions.length },
      { Parameter: 'Active Investment Plans Count', Value: data.plans.length },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 38 }, { wch: 32 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

    // 2. Users Sheet
    const usersData = data.users.map((u, idx) => ({
      'S.No': idx + 1,
      'User ID': u.id,
      'Full Name': u.name,
      'Login ID': u.loginId,
      'Role': u.role,
      'Phone Number': u.phone,
      'Email': u.email || 'N/A',
      'Referral Code': u.referralCode || 'N/A',
      'Referred By': u.referredBy || 'Direct',
      'Account Status': u.status,
      'Joined Date': u.joinedDate,
    }));
    const wsUsers = XLSX.utils.json_to_sheet(usersData);
    wsUsers['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 26 },
      { wch: 16 },
      { wch: 10 },
      { wch: 18 },
      { wch: 24 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Users & Accounts');

    // 3. Active Investments Sheet
    const investmentsData = data.investments.map((inv, idx) => ({
      'S.No': idx + 1,
      'Investment ID': inv.id,
      'Plan Name': inv.planName,
      'Invested Amount (INR)': inv.investedAmount,
      'Daily ROI (%)': `${inv.dailyRoiPercent}%`,
      'Daily Payout (INR)': inv.dailyReturnAmount,
      'Expected Total Return (INR)': inv.totalExpectedReturn,
      'Earned So Far (INR)': inv.earnedSoFar,
      'Claimed (INR)': inv.claimedSoFar,
      'Unclaimed (INR)': inv.unclaimedEarnings,
      'Days Elapsed': `${inv.daysCompleted} / ${inv.durationDays} Days`,
      'Status': inv.status,
      'Start Date': inv.startDate,
      'Maturity Date': inv.endDate,
      'Auto Reinvest': inv.autoReinvest ? 'YES' : 'NO',
    }));
    const wsInvestments = XLSX.utils.json_to_sheet(investmentsData);
    wsInvestments['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 26 },
      { wch: 20 },
      { wch: 14 },
      { wch: 18 },
      { wch: 24 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, wsInvestments, 'Active Investments');

    // 4. Transactions Sheet
    const txnsData = data.transactions.map((t, idx) => ({
      'S.No': idx + 1,
      'Transaction ID': t.id,
      'Date & Time': new Date(t.timestamp || t.date).toLocaleString('en-IN'),
      'Type': t.type,
      'Amount (INR)': t.amount,
      'Status': t.status,
      'Payment Method': t.method || 'System Internal',
      'Reference ID': t.referenceId,
      'Note (English)': t.note,
      'Note (Hindi)': t.noteHi,
    }));
    const wsTxns = XLSX.utils.json_to_sheet(txnsData);
    wsTxns['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 22 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 20 },
      { wch: 18 },
      { wch: 35 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTxns, 'Transactions Ledger');

    // 5. Investment Plans Sheet
    const plansData = data.plans.map((p, idx) => ({
      'S.No': idx + 1,
      'Plan ID': p.id,
      'Plan Name': p.name,
      'Hindi Name': p.nameHi,
      'Daily ROI (%)': `${p.dailyRoiPercent}%`,
      'Duration (Days)': p.durationDays,
      'Total ROI (%)': `${(p.dailyRoiPercent * p.durationDays).toFixed(1)}%`,
      'Min Amount (INR)': p.minAmount,
      'Max Amount (INR)': p.maxAmount,
      'Payout Frequency': p.payoutFrequency,
      'Risk Level': p.risk,
      'Tag': p.tag,
    }));
    const wsPlans = XLSX.utils.json_to_sheet(plansData);
    wsPlans['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 24 },
      { wch: 24 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsPlans, 'Investment Plans');

    // 6. Treasury Ledger Sheet
    const treasuryData = data.treasuryLogs.map((log, idx) => ({
      'S.No': idx + 1,
      'Log ID': log.id,
      'Date & Time': new Date(log.timestamp || log.date).toLocaleString('en-IN'),
      'Action Type': log.type,
      'Amount (INR)': log.amount,
      'Balance Before (INR)': log.balanceBefore,
      'Balance After (INR)': log.balanceAfter,
      'Initiated By': log.actor,
      'Reference ID': log.referenceId || 'N/A',
      'Reason (English)': log.reason,
      'Reason (Hindi)': log.reasonHi,
    }));
    const wsTreasury = XLSX.utils.json_to_sheet(treasuryData);
    wsTreasury['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 16 },
      { wch: 20 },
      { wch: 20 },
      { wch: 22 },
      { wch: 18 },
      { wch: 40 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTreasury, 'Treasury Reserve Ledger');

    // 7. Platform Rules & Configuration Sheet
    const rulesData = [
      { Rule: 'Platform Name', Value: data.rules.platformName },
      { Rule: 'Minimum Deposit (INR)', Value: `₹${data.rules.minDeposit.toLocaleString('en-IN')}` },
      { Rule: 'Maximum Deposit (INR)', Value: `₹${data.rules.maxDeposit.toLocaleString('en-IN')}` },
      { Rule: 'Minimum Withdrawal (INR)', Value: `₹${data.rules.minWithdrawal.toLocaleString('en-IN')}` },
      { Rule: 'Maximum Withdrawal Per Day (INR)', Value: `₹${data.rules.maxWithdrawalPerDay.toLocaleString('en-IN')}` },
      { Rule: 'Withdrawal Fee (%)', Value: `${data.rules.withdrawalFeePercent}%` },
      { Rule: 'Withdrawal Timing', Value: data.rules.withdrawalTiming },
      { Rule: 'Daily Payout Cycle', Value: data.rules.dailyPayoutCycle },
      { Rule: 'Capital Return Policy', Value: data.rules.capitalReturnPolicyLabel },
      { Rule: 'Referral Bonus Level 1 (%)', Value: `${data.rules.referralL1Percent}%` },
      { Rule: 'Referral Bonus Level 2 (%)', Value: `${data.rules.referralL2Percent}%` },
      { Rule: 'TDS Rate (%)', Value: `${data.rules.tdsPercent}%` },
      { Rule: 'Support Email', Value: data.rules.supportEmail },
      { Rule: 'Support Phone', Value: data.rules.supportPhone },
    ];
    const wsRules = XLSX.utils.json_to_sheet(rulesData);
    wsRules['!cols'] = [{ wch: 32 }, { wch: 38 }];
    XLSX.utils.book_append_sheet(wb, wsRules, 'Platform Rules');

    // Write file
    try {
      XLSX.writeFile(wb, filename);
    } catch {
      // Fallback for isolated web views
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return { success: true, filename };
  } catch (err: any) {
    console.error('Failed to export data to Excel:', err);
    return { success: false, filename: '', error: err?.message || 'Excel export failed' };
  }
}

/**
 * Export a specific past backup record directly to Excel (.xlsx)
 */
export function exportBackupRecordToExcel(backup: BackupRecord): { success: boolean; filename: string; error?: string } {
  return exportAllDataToExcel(backup.payload, `GCap_Backup_${backup.backupDate}_${backup.triggerType}`);
}
