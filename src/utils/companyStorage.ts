import { CompanyProfile } from '../types';

const COMPANY_PROFILE_STORAGE_KEY = 'gcap_corporate_company_profile_v1';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'GCAP ASSET MANAGEMENT (INDIA) PVT. LTD.',
  companyNameHi: 'जीकैप एसेट मैनेजमेंट (इंडिया) प्राइवेट लिमिटेड',
  tradeName: 'GCap Trust & Asset Management',
  cin: 'U65999MH2024PTC398102',
  pan: 'AABCG1234F',
  tan: 'MUMB10293E',
  gstin: '27AABCG1234F1Z5',
  incorporationDate: '2024-01-15',
  rocJurisdiction: 'ROC Mumbai, Maharashtra',
  companyType: 'Private Limited Company (Non-Govt)',
  authorizedCapital: '₹5,00,00,000',
  paidUpCapital: '₹1,00,00,000',
  registeredAddress: 'GCap Financial Towers, Bandra-Kurla Complex (BKC), Mumbai, MH - 400051',
  corporateAddress: 'Corporate Office: BKC East, Mumbai, Maharashtra - 400051',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400051',
  supportEmail: 'support@gcap.in',
  legalEmail: 'legal@gcap.in',
  supportPhone: '+91 98000 12345',
  altPhone: '+91 22 6800 1234',
  websiteUrl: 'https://gcap.in',
  authorizedSignatory: 'Vikramaditya Singhania',
  signatoryDesignation: 'Managing Director & Authorized Signatory',
  signatoryDin: 'DIN: 08924192',
  sealCity: 'MUMBAI',
  bankName: 'Axis Bank Ltd.',
  bankAccountNumber: '924010008662307',
  bankIfsc: 'UTIB0001219',
  bankBranch: 'Axis Commercial Branch',
  bankAccountType: 'Current Account',
  tagline: 'Guaranteed Principal Security & Automated Asset Growth',
  taglineHi: '100% मूलधन सुरक्षा एवं स्वचालित संपत्ति विकास',
  lastUpdated: new Date().toISOString().split('T')[0],
};

/**
 * Retrieves the stored company profile or returns default
 */
export function getStoredCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(COMPANY_PROFILE_STORAGE_KEY);
    if (!raw) {
      saveStoredCompanyProfile(DEFAULT_COMPANY_PROFILE);
      return DEFAULT_COMPANY_PROFILE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_COMPANY_PROFILE,
      ...parsed,
    };
  } catch (err) {
    console.error('Failed to parse stored company profile:', err);
    return DEFAULT_COMPANY_PROFILE;
  }
}

/**
 * Saves company profile to persistent local storage and emits event
 */
export function saveStoredCompanyProfile(profile: CompanyProfile): void {
  try {
    const payload = {
      ...profile,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    localStorage.setItem(COMPANY_PROFILE_STORAGE_KEY, JSON.stringify(payload));

    // Emit storage event for multi-tab/subscribers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gcap_company_profile_updated', { detail: payload })
      );
    }
  } catch (err) {
    console.error('Failed to save company profile:', err);
  }
}

/**
 * Resets company profile back to default
 */
export function resetCompanyProfileToDefault(): CompanyProfile {
  saveStoredCompanyProfile(DEFAULT_COMPANY_PROFILE);
  return DEFAULT_COMPANY_PROFILE;
}

export const resetStoredCompanyProfile = resetCompanyProfileToDefault;

/**
 * Helper to check if a specific company detail is filled (non-empty)
 */
export function hasCompanyField(profile?: Partial<CompanyProfile>, key?: keyof CompanyProfile): boolean {
  if (!profile || !key) return false;
  const val = profile[key];
  return typeof val === 'string' && val.trim().length > 0;
}
