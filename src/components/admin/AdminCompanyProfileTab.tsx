import React, { useState } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Eye,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  CreditCard,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  Printer,
  Share2,
  Copy,
} from 'lucide-react';
import { CompanyProfile, Language } from '../../types';
import {
  DEFAULT_COMPANY_PROFILE,
  getStoredCompanyProfile,
  saveStoredCompanyProfile,
  resetStoredCompanyProfile,
} from '../../utils/companyStorage';
import { StartupIndiaCertificateModal } from '../StartupIndiaCertificateModal';

interface AdminCompanyProfileTabProps {
  language: Language;
  companyProfile?: CompanyProfile;
  onSaveProfile?: (profile: CompanyProfile) => void;
  onResetProfile?: () => void;
}

export const AdminCompanyProfileTab: React.FC<AdminCompanyProfileTabProps> = ({
  language,
  companyProfile: propCompanyProfile,
  onSaveProfile,
  onResetProfile,
}) => {
  const isHi = language === 'hi';
  const initialProfile = propCompanyProfile || getStoredCompanyProfile();
  const [formData, setFormData] = useState<CompanyProfile>({ ...initialProfile });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activePreview, setActivePreview] = useState<'LETTERHEAD' | 'LEGAL_BLOCK' | 'SEAL'>('LETTERHEAD');
  const [showStartupCertModal, setShowStartupCertModal] = useState(false);
  const isDirtyRef = React.useRef(false);



  // Keep formData synchronized with propCompanyProfile when user is not actively editing
  React.useEffect(() => {
    if (propCompanyProfile && !isDirtyRef.current) {
      setFormData({ ...propCompanyProfile });
    }
  }, [propCompanyProfile]);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    isDirtyRef.current = true;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    isDirtyRef.current = false;
    const payloadToSave: CompanyProfile = {
      ...formData,
      lastUpdated: new Date().toISOString(),
    };
    if (onSaveProfile) {
      onSaveProfile(payloadToSave);
    } else {
      saveStoredCompanyProfile(payloadToSave);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        isHi
          ? 'क्या आप वास्तव में सभी कंपनी विवरण डिफ़ॉल्ट मानों पर रीसेट करना चाहते हैं?'
          : 'Are you sure you want to reset all company details to default values?'
      )
    ) {
      if (onResetProfile) {
        onResetProfile();
      } else {
        resetStoredCompanyProfile();
      }
      setFormData({ ...DEFAULT_COMPANY_PROFILE });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Helper to count filled fields
  const allKeys = Object.keys(formData) as (keyof CompanyProfile)[];
  const filledCount = allKeys.filter((k) => typeof formData[k] === 'string' && (formData[k] as string).trim().length > 0).length;
  const totalCount = allKeys.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0 shadow-lg shadow-amber-500/10">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {isHi ? '🏢 GCap कंपनी प्रोफ़ाइल व कॉर्पोरेट विवरण' : '🏢 GCap Corporate Profile & Company Master'}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PVT. LTD. MASTER
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {filledCount}/{totalCount} {isHi ? 'फील्ड्स भरे' : 'Fields Active'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {isHi
                  ? 'यहाँ प्राइवेट लिमिटेड कंपनी का हर तरह का विवरण एडिट करें। जो विवरण भरा होगा वही रसीद, अनुबंध व प्रमाण पत्र में प्रिंट होगा; खाली विवरण प्रिंट नहीं होगा।'
                  : 'Manage complete Private Limited Company corporate data. Only filled fields will print on Agreements, Vouchers & Certificates; unfilled fields are hidden automatically.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title={isHi ? 'डिफ़ॉल्ट रीसेट करें' : 'Reset to Default'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHi ? 'डिफ़ॉल्ट रीसेट' : 'Reset Default'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isHi ? '💾 कंपनी प्रोफ़ाइल सेव करें' : '💾 Save Company Profile'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isHi
                ? '✅ कंपनी प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई है! सभी प्रिंट दस्तावेजों (अनुबंध, वाउचर, प्रमाण पत्र) में नए नियम तुरंत लागू हो चुके हैं।'
                : '✅ Company Profile successfully saved! All print documents (Agreements, Vouchers, Certificates) are updated live.'}
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Form Left, Live Print Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORM COLUMN (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: Company Identity */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-amber-400">
              <Building2 className="w-5 h-5" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '1. कंपनी मूल पहचान एवं नाम' : '1. Company Legal Identity'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'कंपनी का पूर्ण कानूनी नाम (English):' : 'Official Legal Company Name (English):'}
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="e.g. GCAP ASSET MANAGEMENT (INDIA) PVT. LTD."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'कंपनी का नाम (हिन्दी / Devnagari):' : 'Company Name (Hindi / Devnagari):'}
                </label>
                <input
                  type="text"
                  value={formData.companyNameHi || ''}
                  onChange={(e) => handleChange('companyNameHi', e.target.value)}
                  placeholder="e.g. जीकैप एसेट मैनेजमेंट (इंडिया) प्राइवेट लिमिटेड"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'ट्रेड / ब्रांड नाम:' : 'Brand / Trade Name:'}
                  </label>
                  <input
                    type="text"
                    value={formData.tradeName || ''}
                    onChange={(e) => handleChange('tradeName', e.target.value)}
                    placeholder="e.g. GCap Trust"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'कंपनी प्रकार (Company Type):' : 'Company Type / Category:'}
                  </label>
                  <input
                    type="text"
                    value={formData.companyType || ''}
                    onChange={(e) => handleChange('companyType', e.target.value)}
                    placeholder="e.g. Private Limited Company (Non-Govt)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'पंजीकरण / स्थापना तिथि (Inc. Date):' : 'Incorporation Date:'}
                  </label>
                  <input
                    type="date"
                    value={formData.incorporationDate || ''}
                    onChange={(e) => handleChange('incorporationDate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'कंपनी टैगलाइन / स्लोगन:' : 'Company Tagline / Slogan:'}
                  </label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="e.g. 100% Principal Security & Guaranteed Returns"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Statutory & Tax Identifiers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-emerald-400">
              <Briefcase className="w-5 h-5" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '2. कानूनी व कर पहचान संख्या (CIN, PAN, TAN, GSTIN)' : '2. Statutory & Tax Registrations'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'कॉर्पोरेट पहचान संख्या (CIN Number):' : 'Corporate Identification Number (CIN):'}
                </label>
                <input
                  type="text"
                  value={formData.cin || ''}
                  onChange={(e) => handleChange('cin', e.target.value)}
                  placeholder="e.g. U66190BR2026OPC088307"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'कंपनी पैन कार्ड नंबर (Company PAN):' : 'Company PAN Number:'}
                </label>
                <input
                  type="text"
                  value={formData.pan || ''}
                  onChange={(e) => handleChange('pan', e.target.value)}
                  placeholder="e.g. AANCG4365Q"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'टैक्स कटौती नंबर (Tax TAN):' : 'Tax Deduction TAN Number:'}
                </label>
                <input
                  type="text"
                  value={formData.tan || ''}
                  onChange={(e) => handleChange('tan', e.target.value)}
                  placeholder="e.g. PTNG16977C"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'जीएसटी नंबर (GSTIN):' : 'GST Identification Number (GSTIN):'}
                </label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={(e) => handleChange('gstin', e.target.value)}
                  placeholder="e.g. 10AANCG4365Q1Z5"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'आरओसी क्षेत्राधिकार (ROC Jurisdiction):' : 'ROC Jurisdiction:'}
                </label>
                <input
                  type="text"
                  value={formData.rocJurisdiction || ''}
                  onChange={(e) => handleChange('rocJurisdiction', e.target.value)}
                  placeholder="e.g. ROC Mumbai, Maharashtra"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'अधिकृत शेयर पूंजी (Auth Capital):' : 'Authorized Capital:'}
                </label>
                <input
                  type="text"
                  value={formData.authorizedCapital || ''}
                  onChange={(e) => handleChange('authorizedCapital', e.target.value)}
                  placeholder="e.g. ₹5,00,00,000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Startup India Recognition Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-950/30 via-slate-950 to-blue-950/30 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{isHi ? 'भारत सरकार स्टार्टअप इंडिया मान्यता' : 'DPIIT #startupindia Recognition'}</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded border border-emerald-500/40">
                        {formData.dippNumber || 'DIPP285976'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {isHi ? 'वाणिज्य एवं उद्योग मंत्रालय (DPIIT) द्वारा 10 वर्षों के लिए मान्यता प्राप्त' : 'Govt of India DPIIT Recognized Startup for 10 Years'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowStartupCertModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isHi ? 'प्रमाण पत्र देखें / प्रिंट' : 'View Certificate'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'DPIIT सर्टिफिकेट नंबर:' : 'DPIIT Certificate No:'}
                  </label>
                  <input
                    type="text"
                    value={formData.dippNumber || 'DIPP285976'}
                    onChange={(e) => handleChange('dippNumber', e.target.value)}
                    placeholder="DIPP285976"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'जारी तिथि (Date of Issue):' : 'Date of Issue:'}
                  </label>
                  <input
                    type="text"
                    value={formData.startupIndiaCertIssueDate || '30-09-2026'}
                    onChange={(e) => handleChange('startupIndiaCertIssueDate', e.target.value)}
                    placeholder="30-09-2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'वैधता (Valid Upto):' : 'Valid Upto:'}
                  </label>
                  <input
                    type="text"
                    value={formData.startupIndiaCertValidUpto || '22-09-2036'}
                    onChange={(e) => handleChange('startupIndiaCertValidUpto', e.target.value)}
                    placeholder="22-09-2036"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'उद्योग (Industry):' : 'Industry:'}
                  </label>
                  <input
                    type="text"
                    value={formData.industry || 'Finance Technology'}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    placeholder="Finance Technology"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isHi ? 'क्षेत्र (Sector):' : 'Sector:'}
                  </label>
                  <input
                    type="text"
                    value={formData.sector || 'Business Finance'}
                    onChange={(e) => handleChange('sector', e.target.value)}
                    placeholder="Business Finance"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Office Addresses */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-cyan-400">
              <MapPin className="w-5 h-5" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '3. पंजीकृत एवं कॉर्पोरेट कार्यालय पता' : '3. Registered & Corporate Addresses'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'पंजीकृत कार्यालय पता (Registered Office Address):' : 'Official Registered Office Address:'}
                </label>
                <textarea
                  rows={2}
                  value={formData.registeredAddress || ''}
                  onChange={(e) => handleChange('registeredAddress', e.target.value)}
                  placeholder="e.g. Khari, Babhangawa, Shree Nagur, Near RRP School of Nursing Sasaram, Bihar - 821113"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'कॉर्पोरेट / शाखा कार्यालय पता (यदि अलग हो):' : 'Corporate / Branch Office Address (if different):'}
                </label>
                <input
                  type="text"
                  value={formData.corporateAddress || ''}
                  onChange={(e) => handleChange('corporateAddress', e.target.value)}
                  placeholder="e.g. Corporate Office: Main Road, Sasaram, Bihar - 821115"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isHi ? 'शहर (City):' : 'City:'}</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Mumbai"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isHi ? 'राज्य (State):' : 'State:'}</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">{isHi ? 'पिनकोड (PIN):' : 'PIN Code:'}</label>
                  <input
                    type="text"
                    value={formData.pincode || ''}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    placeholder="400051"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Contact & Digital */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-blue-400">
              <Phone className="w-5 h-5" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '4. आधिकारिक संपर्क, ईमेल व वेबसाइट' : '4. Official Contact & Web Communication'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'सपोर्ट ईमेल (Support Email):' : 'Official Support Email:'}
                </label>
                <input
                  type="email"
                  value={formData.supportEmail || ''}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  placeholder="support@gcapopc.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'कानूनी / अनुपालन ईमेल (Legal Email):' : 'Legal & Compliance Email:'}
                </label>
                <input
                  type="email"
                  value={formData.legalEmail || ''}
                  onChange={(e) => handleChange('legalEmail', e.target.value)}
                  placeholder="support@gcapopc.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'हेल्पलाइन नंबर (Support Phone):' : 'Official Support Phone:'}
                </label>
                <input
                  type="text"
                  value={formData.supportPhone || ''}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                  placeholder="+91 8503504808"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-emerald-400 font-black mb-1 flex items-center gap-1.5">
                  <span>📲 {isHi ? 'एडमिन WhatsApp अलर्ट नंबर (Admin WhatsApp):' : 'Admin Alert WhatsApp Number:'}</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    {isHi ? 'पेमेंट अलर्ट यहीं आएंगे' : 'Payment Alerts Target'}
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.adminWhatsAppNumber || ''}
                  onChange={(e) => handleChange('adminWhatsAppNumber', e.target.value)}
                  placeholder="+91 8603504808"
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-3.5 py-2 text-emerald-300 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {isHi ? '💡 जब भी कोई यूजर डिपॉजिट या विथड्रॉल करेगा, इसी नंबर के WhatsApp पर सूचना आएगी।' : '💡 Instant payment and withdrawal alert messages will be sent to this WhatsApp number.'}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'वेबसाइट यूआरएल (Website):' : 'Official Website URL:'}
                </label>
                <input
                  type="text"
                  value={formData.websiteUrl || ''}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  placeholder="https://www.gcapopc.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-red-400 font-bold mb-1">
                  {isHi ? 'फीचर्ड यूट्यूब वीडियो यूआरएल:' : 'Featured YouTube Video URL:'}
                </label>
                <input
                  type="url"
                  value={formData.featuredVideoUrl || ''}
                  onChange={(e) => handleChange('featuredVideoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Signatory & Seal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-yellow-400">
              <Award className="w-5 h-5" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '5. अधिकृत हस्ताक्षरकर्ता एवं कॉर्पोरेट मुहर' : '5. Authorized Signatory & Seal Master'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'अधिकृत प्रतिनिधि नाम (Signatory Name):' : 'Authorized Signatory / Director Name:'}
                </label>
                <input
                  type="text"
                  value={formData.authorizedSignatory || ''}
                  onChange={(e) => handleChange('authorizedSignatory', e.target.value)}
                  placeholder="e.g. Amit Kumar"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'पदनाम (Designation):' : 'Signatory Designation:'}
                </label>
                <input
                  type="text"
                  value={formData.signatoryDesignation || ''}
                  onChange={(e) => handleChange('signatoryDesignation', e.target.value)}
                  placeholder="e.g. Managing Director & CEO"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'निदेशक पहचान संख्या (DIN):' : 'Director Identification Number (DIN):'}
                </label>
                <input
                  type="text"
                  value={formData.signatoryDin || ''}
                  onChange={(e) => handleChange('signatoryDin', e.target.value)}
                  placeholder="e.g. DIN: 08924192"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'मुहर का शहर (Seal City):' : 'Corporate Seal City:'}
                </label>
                <input
                  type="text"
                  value={formData.sealCity || ''}
                  onChange={(e) => handleChange('sealCity', e.target.value)}
                  placeholder="e.g. MUMBAI"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-bold uppercase focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Corporate Banking Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-purple-400">
              <CreditCard className="w-5 h-5" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {isHi ? '6. कंपनी का आधिकारिक बैंक खाता' : '6. Official Corporate Bank Account'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'खाता धारक का नाम (Account Holder / Beneficiary Name):' : 'Account Holder / Beneficiary Name:'}
                </label>
                <input
                  type="text"
                  value={formData.companyBankAccountHolder || ''}
                  onChange={(e) => handleChange('companyBankAccountHolder', e.target.value)}
                  placeholder="e.g. GCAP AUTHORIZED PERSON या GCap OPC Private Limited"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {isHi ? '💡 यह नाम यूज़र्स को पैसे जमा (Deposit) करते समय और बैंक ट्रांसफर में "खाता धारक" के रूप में दिखाई देगा।' : '💡 This name appears to users as the Account Holder Name during deposit & bank transfer.'}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'बैंक का नाम (Bank Name):' : 'Bank Name:'}
                </label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  placeholder="e.g. Axis Bank Ltd."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'बैंक खाता संख्या (A/c No):' : 'Bank Account Number:'}
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber || ''}
                  onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                  placeholder="e.g. 50200084920194"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'आईएफएससी कोड (IFSC Code):' : 'IFSC Code:'}
                </label>
                <input
                  type="text"
                  value={formData.bankIfsc || ''}
                  onChange={(e) => handleChange('bankIfsc', e.target.value)}
                  placeholder="e.g. HDFC0000240"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'कंपनी यूपीआई आईडी (Company UPI ID):' : 'Company Official UPI ID:'}
                </label>
                <input
                  type="text"
                  value={formData.companyUpiId || ''}
                  onChange={(e) => handleChange('companyUpiId', e.target.value)}
                  placeholder="e.g. 8603504808@axisbank"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isHi ? 'बैंक शाखा (Branch):' : 'Branch Name:'}
                </label>
                <input
                  type="text"
                  value={formData.bankBranch || ''}
                  onChange={(e) => handleChange('bankBranch', e.target.value)}
                  placeholder="e.g. BKC Mumbai Branch"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: Official Social Media Channels & Visibility Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-rose-400">
                <Globe className="w-5 h-5" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {isHi ? '7. आधिकारिक सोशल मीडिया चैनल्स व डिस्प्ले ऑन/ऑफ कंट्रोल' : '7. Social Media Links & Visibility Control'}
                </h3>
              </div>
              <p className="text-[11px] text-amber-400 font-medium">
                💡 {isHi ? 'बटन दबाकर किसी भी सोशल लिंक को ऑन या ऑफ करें' : 'Tap button to turn any social link ON or OFF'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-red-400 font-bold flex items-center gap-1.5">
                    YouTube Channel URL
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('showYoutube', formData.showYoutube === false ? true : false)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-sm ${
                      formData.showYoutube !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {formData.showYoutube !== false ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.youtubeUrl || ''}
                  onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                  placeholder="https://www.youtube.com/@GCapOfficial"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sky-400 font-bold flex items-center gap-1.5">
                    Telegram Channel URL
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('showTelegram', !formData.showTelegram)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-sm ${
                      formData.showTelegram === true
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {formData.showTelegram === true ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.telegramUrl || ''}
                  onChange={(e) => handleChange('telegramUrl', e.target.value)}
                  placeholder="https://t.me/gcapofficial"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-emerald-400 font-bold flex items-center gap-1.5">
                    WhatsApp Group / Community URL
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('showWhatsapp', !formData.showWhatsapp)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-sm ${
                      formData.showWhatsapp === true
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {formData.showWhatsapp === true ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.whatsappGroupUrl || ''}
                  onChange={(e) => handleChange('whatsappGroupUrl', e.target.value)}
                  placeholder="https://chat.whatsapp.com/GCapOfficialCommunity"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-blue-400 font-bold flex items-center gap-1.5">
                    Facebook Page URL
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('showFacebook', !formData.showFacebook)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-sm ${
                      formData.showFacebook === true
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {formData.showFacebook === true ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => handleChange('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/gcapofficial"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-pink-400 font-bold flex items-center gap-1.5">
                    Instagram Profile URL
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('showInstagram', !formData.showInstagram)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-sm ${
                      formData.showInstagram === true
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {formData.showInstagram === true ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => handleChange('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/gcapofficial"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    Twitter / X Profile URL
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('showTwitter', !formData.showTwitter)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-sm ${
                      formData.showTwitter === true
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {formData.showTwitter === true ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.twitterUrl || ''}
                  onChange={(e) => handleChange('twitterUrl', e.target.value)}
                  placeholder="https://twitter.com/gcapofficial"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="sm:col-span-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-cyan-400 font-bold flex items-center gap-1.5">
                    LinkedIn Corporate Page URL
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('showLinkedin', !formData.showLinkedin)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shadow-sm ${
                      formData.showLinkedin === true
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    {formData.showLinkedin === true ? '🟢 चालू (ON)' : '🔴 बंद (OFF)'}
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/company/gcapofficial"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 8: Social Media Bio Generator */}
          <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/50 rounded-2xl p-5 shadow-xl shadow-purple-950/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/30 flex-wrap gap-2">
              <div className="flex items-center gap-2.5 text-purple-400">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/40">
                  <Share2 className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>{isHi ? '8. सोशल मीडिया बायो जनरेटर' : '8. Social Media Bio Generator'}</span>
                    <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full font-bold">
                      INSTA • FB • YT • LINKEDIN
                    </span>
                  </h3>
                  <p className="text-xs text-purple-300/80 font-medium">
                    {isHi
                      ? 'अपने सभी सोशल मीडिया प्रोफाइल (Instagram, Facebook, LinkedIn, YouTube) में यह बायो पेस्ट करें।'
                      : 'Copy this ready-made bio to paste into your Instagram, Facebook, LinkedIn, and YouTube profiles.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Bio Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>{isHi ? '📋 संपूर्ण कंपनी बायो (Facebook, LinkedIn, YouTube के लिए):' : '📋 Full Bio (For Facebook, LinkedIn, YouTube):'}</span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click Copy</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 font-mono text-xs text-purple-100 whitespace-pre-wrap leading-relaxed shadow-inner">
{`🏢 ${formData.companyName}
✨ ${formData.tagline || 'Guaranteed Returns & Financial Growth'}
🏛️ CIN: ${formData.cin || 'U66190BR2026OPC088307'} | DPIIT: ${formData.dippNumber || 'DIPP285976'}
📍 ${formData.registeredAddress || 'Registered Office, India'}
📞 Support: ${formData.supportPhone || '+91 8503504808'}
🌐 Website: ${formData.websiteUrl || 'https://www.gcapopc.com'}`}
              </div>
              <button
                type="button"
                onClick={() => {
                  const bio = `🏢 ${formData.companyName}\n✨ ${formData.tagline || 'Guaranteed Returns & Financial Growth'}\n🏛️ CIN: ${formData.cin || 'U66190BR2026OPC088307'} | DPIIT: ${formData.dippNumber || 'DIPP285976'}\n📍 ${formData.registeredAddress || 'Registered Office, India'}\n📞 Support: ${formData.supportPhone || '+91 8503504808'}\n🌐 Website: ${formData.websiteUrl || 'https://www.gcapopc.com'}`;
                  navigator.clipboard.writeText(bio);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 3500);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                <Copy className="w-4 h-4" />
                <span>{isHi ? '📋 संपूर्ण बायो कॉपी करें (Copy Full Bio)' : '📋 Copy Full Bio'}</span>
              </button>
            </div>

            {/* Short Bio Card for Instagram / Twitter */}
            <div className="space-y-2 pt-2 border-t border-purple-500/20">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>{isHi ? '⚡ संक्षिप्त बायो (Instagram / X / Twitter 150 अक्षर सीमा के लिए):' : '⚡ Short Bio (For Instagram & X / Twitter 150-char limit):'}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap">
{`${formData.companyName} | ${formData.tagline || 'Secure Assets & Guaranteed Returns'}
📍 ${formData.city || 'India'} • 📞 ${formData.supportPhone || ''}
🌐 ${formData.websiteUrl || ''}`}
              </div>
              <button
                type="button"
                onClick={() => {
                  const shortBio = `${formData.companyName} | ${formData.tagline || 'Secure Assets & Guaranteed Returns'}\n📍 ${formData.city || 'India'} • 📞 ${formData.supportPhone || ''}\n🌐 ${formData.websiteUrl || ''}`;
                  navigator.clipboard.writeText(shortBio);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 3500);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isHi ? '⚡ संक्षिप्त बायो कॉपी करें (Copy Short Bio)' : '⚡ Copy Short Bio'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="space-y-3 pt-2">
            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  {isHi
                    ? '✅ कंपनी प्रोफ़ाइल व बैंक विवरण सेव हो गए! अब सभी यूज़र्स को डिपॉजिट करते समय यही नया बैंक खाता व UPI दिखेगा।'
                    : '✅ Company Profile & Bank Saved! Users will now see this updated bank account & UPI during deposits.'}
                </span>
              </div>
            )}
            {copySuccess && (
              <div className="p-3.5 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-500/10">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                <span>
                  {isHi
                    ? '✅ बायो कॉपी हो गया!'
                    : '✅ Bio Copied!'}
                </span>
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/30 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isHi ? 'कंपनी प्रोफ़ाइल सुरक्षित करें (Save Profile)' : 'Save Company Profile'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* LIVE PRINT PREVIEW COLUMN (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl sticky top-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Printer className="w-4 h-4" />
                <span>{isHi ? 'लाइव प्रिंट प्रिव्यू (Live Output Preview)' : 'Live Document Print Preview'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                DYNAMIC
              </span>
            </div>

            {/* Preview Mode Selector */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActivePreview('LETTERHEAD')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activePreview === 'LETTERHEAD'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'लेटरहेड' : 'Letterhead'}
              </button>
              <button
                type="button"
                onClick={() => setActivePreview('LEGAL_BLOCK')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activePreview === 'LEGAL_BLOCK'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'प्रथम पक्ष ब्लॉक' : 'Entity Block'}
              </button>
              <button
                type="button"
                onClick={() => setActivePreview('SEAL')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activePreview === 'SEAL'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHi ? 'मुहर व साइन' : 'Seal & Sign'}
              </button>
            </div>

            {/* Simulated Paper Document Sheet */}
            <div className="bg-white text-slate-900 rounded-xl p-5 shadow-2xl border border-slate-200 min-h-[300px] text-xs space-y-4">
              
              {/* Preview 1: Official Letterhead */}
              {activePreview === 'LETTERHEAD' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="border-b-2 border-amber-600 pb-3 flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg shrink-0">
                      G
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-black text-sm text-slate-950 tracking-tight uppercase leading-tight truncate">
                        {formData.companyName || 'GCap OPC Private Limited'}
                      </h4>
                      {formData.companyNameHi && (
                        <p className="text-[11px] text-slate-700 font-medium">{formData.companyNameHi}</p>
                      )}
                      {formData.registeredAddress && (
                        <p className="text-[10px] text-slate-600 leading-tight">
                          Regd Office: {formData.registeredAddress}
                        </p>
                      )}
                      
                      {/* Only render filled tags */}
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-slate-600 font-mono pt-1">
                        {formData.cin && <span>CIN: <b>{formData.cin}</b></span>}
                        {formData.pan && <span>• PAN: <b>{formData.pan}</b></span>}
                        {formData.tan && <span>• TAN: <b>{formData.tan}</b></span>}
                        {formData.gstin && <span>• GST: <b>{formData.gstin}</b></span>}
                        {formData.supportEmail && <span>• Email: {formData.supportEmail}</span>}
                        {formData.supportPhone && <span>• Phone: {formData.supportPhone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isHi ? 'प्रिंट का नियम:' : 'Print Rule:'}</span>
                    </div>
                    <p>
                      {isHi
                        ? 'जो फील्ड खाली (blank) होगा, वो प्रिंट में नहीं आएगा। केवल भरे हुए फील्ड ही प्रिंट होंगे।'
                        : 'Any field left blank will NOT be printed. Only non-empty fields appear on official documents.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Preview 2: First Party Entity Block */}
              {activePreview === 'LEGAL_BLOCK' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-300 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase">
                      <Building2 className="w-4 h-4" />
                      <span>FIRST PARTY (GCAP PLATFORM)</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-800">
                      <p><b>Company Name:</b> {formData.companyName}</p>
                      {formData.companyType && <p><b>Type:</b> {formData.companyType}</p>}
                      {formData.cin && <p><b>CIN:</b> {formData.cin}</p>}
                      {formData.pan && <p><b>PAN:</b> {formData.pan}</p>}
                      {formData.registeredAddress && <p><b>Address:</b> {formData.registeredAddress}</p>}
                      {formData.authorizedSignatory && (
                        <p><b>Authorized Signatory:</b> {formData.authorizedSignatory} ({formData.signatoryDesignation || 'Director'})</p>
                      )}
                      {formData.signatoryDin && <p><b>Director DIN:</b> {formData.signatoryDin}</p>}
                      {formData.bankName && formData.bankAccountNumber && (
                        <p><b>Corporate Bank:</b> {formData.bankName} (A/c: {formData.bankAccountNumber})</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview 3: Official Seal & Signature */}
              {activePreview === 'SEAL' && (
                <div className="space-y-3 animate-in fade-in duration-150 text-center">
                  <div className="p-4 rounded-xl border border-amber-600 bg-slate-50 flex flex-col items-center justify-center space-y-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">
                      FOR FIRST PARTY ({formData.tradeName || 'GCAP'}):
                    </span>

                    {/* Seal Stamp */}
                    <div className="relative flex items-center justify-center my-2">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-700 flex flex-col items-center justify-center p-1 text-[7px] font-black uppercase text-amber-900 text-center leading-tight">
                        <span>★ {formData.tradeName ? formData.tradeName.toUpperCase().slice(0, 15) : 'GCAP'} ★</span>
                        <span className="font-mono text-[6px] text-slate-700">SEAL & SIGN</span>
                        <span>{formData.sealCity || 'MUMBAI'}</span>
                      </div>
                      <div className="absolute text-blue-900 font-serif italic text-sm font-bold rotate-[-12deg] select-none">
                        {formData.authorizedSignatory ? formData.authorizedSignatory.split(' ')[0] : 'GCap'}
                      </div>
                    </div>

                    <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-900">
                      <p className="font-bold">{formData.authorizedSignatory || 'Authorized Signatory'}</p>
                      <p className="text-[9px] text-slate-600 font-medium">{formData.signatoryDesignation || 'Managing Director'}</p>
                      <p className="text-[8px] text-slate-500 font-mono">{formData.companyName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Startup India Certificate Modal */}
      {showStartupCertModal && (
        <StartupIndiaCertificateModal
          isOpen={showStartupCertModal}
          onClose={() => setShowStartupCertModal(false)}
          language={language}
        />
      )}
    </div>
  );
};
