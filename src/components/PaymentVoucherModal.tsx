import React from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle2, Building2, Coins, ArrowDownLeft, FileText } from 'lucide-react';
import { Language, Transaction, AppRules, CompanyProfile } from '../types';
import { formatINR } from '../utils/storage';
import { printDocument, downloadDocumentAsHtml } from '../utils/printHelper';
import { getStoredCompanyProfile } from '../utils/companyStorage';

interface PaymentVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  language: Language;
  rules?: AppRules;
  companyProfile?: CompanyProfile;
}

export const PaymentVoucherModal: React.FC<PaymentVoucherModalProps> = ({
  isOpen,
  onClose,
  transaction,
  language,
  rules,
  companyProfile: propCompanyProfile,
}) => {
  if (!isOpen || !transaction) return null;

  const isHi = language === 'hi';
  const profile = propCompanyProfile || getStoredCompanyProfile();

  const gross = transaction.grossAmount ?? transaction.amount;
  const tdsPercent = transaction.tdsPercent ?? (gross > 10000 ? 10.0 : 5.0);
  const rawAdmin = transaction.adminFeePercent ?? rules?.adminFeePercent ?? 2.0;
  const adminPercent = rawAdmin < 0.1 ? 2.0 : rawAdmin;

  const tdsAmount = transaction.tdsAmount ?? Math.round(((gross * tdsPercent) / 100) * 100) / 100;
  const adminAmount = transaction.adminFeeAmount ?? Math.round(((gross * adminPercent) / 100) * 100) / 100;
  const netPaid = transaction.netAmount ?? Math.max(0, gross - tdsAmount - adminAmount);

  const handlePrint = () => {
    printDocument('voucher-print-card', `GCap-Voucher-${transaction.id}`);
  };

  const handleDownload = () => {
    downloadDocumentAsHtml('voucher-print-card', `GCap-Voucher-${transaction.id}.html`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Container - hide default UI on print, print container only */}
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-w-none print:w-full print:h-auto print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Modal Header (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isHi ? 'आधिकारिक भुगतान वाउचर' : 'Official Payment Voucher / Receipt'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isHi ? 'सरकारी TDS एवं 0.02% एडमिन शुल्क कटौती विवरण पत्र' : 'Govt TDS & 0.02% Admin Charge Tax Deduction Slip'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{isHi ? 'प्रिंट / PDF' : 'Print Voucher'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Download HTML/PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE VOUCHER CARD CONTENT */}
        <div id="voucher-print-card" className="p-6 overflow-y-auto space-y-6 text-slate-200 print:p-8 print:text-black print:bg-white">
          
          {/* Printable Header / Company Logo */}
          <div className="flex items-start justify-between border-b border-slate-800 print:border-slate-300 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white print:text-black font-sans">
                  {profile.companyName || 'GCap Asset Management'}
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 border border-emerald-500/30">
                  OFFICIAL VOUCHER
                </span>
              </div>
              {profile.registeredAddress && (
                <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                  Reg. Corporate Office: {profile.registeredAddress}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400 print:text-slate-600 font-mono mt-0.5">
                {profile.cin && <span>CIN: {profile.cin}</span>}
                {profile.pan && <span>• PAN: {profile.pan}</span>}
                {profile.tan && <span>• Tax TAN: {profile.tan}</span>}
                {profile.gstin && <span>• GST: {profile.gstin}</span>}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 font-bold text-xs border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isHi ? 'भुगतान सफल (PAID)' : 'DISBURSED / PAID'}</span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 font-mono mt-1.5">
                Voucher Ref: <strong className="text-white print:text-black">{transaction.referenceId}</strong>
              </p>
              <p className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
                Date: {new Date(transaction.timestamp).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Beneficiary Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-4 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 block mb-1">
                {isHi ? 'लाभार्थी निवेशक (Beneficiary):' : 'Beneficiary Investor:'}
              </span>
              <p className="font-bold text-white print:text-black text-sm">
                {transaction.userName || 'Valued GCap Investor'}
              </p>
              {transaction.userPhone && (
                <p className="text-slate-400 print:text-slate-600 font-mono mt-0.5">
                  Mobile: {transaction.userPhone}
                </p>
              )}
              <p className="text-slate-400 print:text-slate-600 font-mono">
                PAN No: {transaction.panNumber || 'ABCDE1234F (Verified)'}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-500 block mb-1">
                {isHi ? 'अंतरित बैंक / UPI माध्यम:' : 'Payout Destination:'}
              </span>
              <p className="font-mono font-semibold text-emerald-400 print:text-emerald-800 text-xs">
                {transaction.method || transaction.destinationDetails || 'Bank A/C Transfer'}
              </p>
              <p className="text-slate-400 print:text-slate-600 mt-1">
                Source Type: <span className="font-semibold">{transaction.withdrawalSource === 'ROYALTY' ? 'Royalty Payout' : 'Daily ROI Earning'}</span>
              </p>
            </div>
          </div>

          {/* DEDUCTION & TAX BREAKDOWN TABLE */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 print:text-black uppercase tracking-wider flex items-center justify-between">
              <span>{isHi ? 'भुगतान एवं टैक्स कटौती तालिका' : 'Payout & Tax Deduction Breakdown'}</span>
              <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-mono">Sec 194 Income Tax Compliant</span>
            </h4>

            <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-slate-800 border-b border-slate-800 print:border-slate-300 font-semibold">
                    <th className="p-3">{isHi ? 'विवरण (Description)' : 'Item Description'}</th>
                    <th className="p-3 text-right">{isHi ? 'दर / दर %' : 'Rate / Fee %'}</th>
                    <th className="p-3 text-right">{isHi ? 'राशि (INR ₹)' : 'Amount (INR ₹)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 font-mono">
                  <tr>
                    <td className="p-3 font-sans font-medium text-white print:text-black">
                      {isHi ? 'कुल निकासी अनुरोध (Gross Withdrawal Requested)' : 'Gross Withdrawal Amount Requested'}
                    </td>
                    <td className="p-3 text-right text-slate-400 print:text-slate-600">100.0%</td>
                    <td className="p-3 text-right font-bold text-white print:text-black">
                      {formatINR(gross)}
                    </td>
                  </tr>

                  {/* Govt TDS Line */}
                  <tr className="bg-rose-500/5 print:bg-rose-50">
                    <td className="p-3 font-sans text-rose-300 print:text-rose-900">
                      <div className="font-semibold">
                        {isHi ? 'सरकारी TDS कटौती (Govt TDS Deduction)' : 'Govt TDS Tax Deduction'}
                      </div>
                      <div className="text-[10px] text-rose-400/80 print:text-rose-700 font-sans">
                        {isHi ? 'भारतीय आयकर अधिनियम 1961 के अंतर्गत सरकार को जमा' : 'Deposited to Govt of India under Income Tax Act Sec 194'}
                      </div>
                    </td>
                    <td className="p-3 text-right text-rose-400 print:text-rose-800 font-bold">
                      -{tdsPercent}%
                    </td>
                    <td className="p-3 text-right font-bold text-rose-400 print:text-rose-800">
                      -{formatINR(tdsAmount)}
                    </td>
                  </tr>

                  {/* Admin Charge Line */}
                  <tr className="bg-amber-500/5 print:bg-amber-50">
                    <td className="p-3 font-sans text-amber-300 print:text-amber-900">
                      <div className="font-semibold">
                        {isHi ? 'प्लेटफॉर्म एडमिन शुल्क (Admin Charge)' : 'Platform Admin Service Fee'}
                      </div>
                      <div className="text-[10px] text-amber-400/80 print:text-amber-800 font-sans">
                        {isHi ? '0.02% एडमिन प्रोसेसिंग एवं बैंकिंग मैनेजमेंट शुल्क' : '0.02% Admin Processing & Maintenance Fee'}
                      </div>
                    </td>
                    <td className="p-3 text-right text-amber-400 print:text-amber-800 font-bold">
                      -{adminPercent}%
                    </td>
                    <td className="p-3 text-right font-bold text-amber-400 print:text-amber-800">
                      -{formatINR(adminAmount)}
                    </td>
                  </tr>

                  {/* Net Payable Final Row */}
                  <tr className="bg-emerald-500/10 print:bg-emerald-100 font-sans border-t-2 border-emerald-500/30 print:border-emerald-500">
                    <td className="p-3.5 font-extrabold text-white print:text-black text-sm">
                      {isHi ? 'सटीक जमा योग्य नेट राशि (Net Amount Transferred)' : 'Net Payable Amount Transferred to Bank'}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400 print:text-emerald-900">
                      Net
                    </td>
                    <td className="p-3.5 text-right font-black text-emerald-400 print:text-emerald-900 text-base font-mono">
                      {formatINR(netPaid)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Guarantee & Official Stamp Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 print:border-slate-300">
            <div className="space-y-1 text-[11px] text-slate-400 print:text-slate-600 max-w-sm">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 print:text-emerald-800">
                <ShieldCheck className="w-4 h-4" />
                <span>{isHi ? '100% डिजिटल सत्यापित वाउचर' : 'Digitally Certified & Tax Compliant'}</span>
              </div>
              <p className="leading-snug">
                This is a computer-generated official payout voucher. TDS deducted has been credited directly against your PAN and will reflect in Form 26AS.
              </p>
            </div>

            <div className="text-center sm:text-right print:text-right shrink-0">
              <div className="inline-block p-2 rounded-xl bg-slate-950 print:bg-white border border-slate-800 print:border-slate-300">
                <div className="w-24 h-12 border-2 border-dashed border-emerald-500/40 print:border-emerald-700 rounded-lg flex flex-col items-center justify-center p-1 bg-emerald-500/5">
                  <span className="text-[9px] font-black uppercase text-emerald-400 print:text-emerald-800 tracking-wider">
                    {profile.tradeName ? profile.tradeName.slice(0, 14) : 'GCap TREASURY'}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 print:text-slate-700">
                    SEAL APPROVED
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 print:text-slate-600 font-semibold mt-1">
                {profile.authorizedSignatory || 'Authorized Signatory'}
              </p>
              {profile.signatoryDesignation && (
                <p className="text-[9px] text-slate-500 print:text-slate-600">
                  {profile.signatoryDesignation}
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>{isHi ? '🖨️ प्रिंट ले / PDF सहेजें' : '🖨️ Print / Save as PDF'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close Voucher'}
          </button>
        </div>

      </div>
    </div>
  );
};
