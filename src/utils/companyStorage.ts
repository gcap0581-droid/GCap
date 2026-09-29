import { CompanyProfile } from '../types';

const COMPANY_PROFILE_STORAGE_KEY = 'gcap_corporate_company_profile_v1';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'GCAP PRIVATE LIMITED',
  companyNameHi: 'जीकैप प्राइवेट लिमिटेड',
  tradeName: 'GCAP PRIVATE LIMITED',
  cin: 'U66190BR2026OPC088307',
  pan: 'AABCG1234F',
  tan: 'MUMB10293E',
  gstin: '27AABCG1234F1Z5',
  incorporationDate: '2024-01-15',
  rocJurisdiction: 'ROC Mumbai, Maharashtra',
  companyType: 'Private Limited Company (Non-Govt)',
  authorizedCapital: '₹5,00,00,000',
  paidUpCapital: '₹1,00,00,000',
  registeredAddress: 'Grand Plaza, Main Road, Sasaram, Bihar - 821115',
  corporateAddress: 'Corporate Office: Main Road, Sasaram, Bihar - 821115',
  city: 'Sasaram',
  state: 'Bihar',
  pincode: '821115',
  supportEmail: 'support@gcap.in',
  legalEmail: 'legal@gcap.in',
  supportPhone: '+91 98000 12345',
  altPhone: '+91 6184 220011',
  websiteUrl: 'https://gcap.in',
  authorizedSignatory: 'Amit Kumar',
  signatoryDesignation: 'Director & Authorized Signatory',
  signatoryDin: 'DIN: 08924192',
  sealCity: 'SASARAM (BIHAR)',
  bankName: 'Axis Bank Ltd.',
  bankAccountNumber: '924010008662307',
  bankIfsc: 'UTIB0001219',
  bankBranch: 'Axis Commercial Branch',
  bankAccountType: 'Current Account',
  companyUpiId: '8603504808@axisbank',
  companyBankAccountHolder: 'GCAP PRIVATE LIMITED',
  tagline: 'ASSETS & WEALTH MANAGEMENT SYSTEM',
  taglineHi: 'संपत्ति और धन प्रबंधन प्रणाली',
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
    
    // Auto-migrate old name if it exists in storage
    const oldNameKeyword = 'ASSETS & WEALTH MANAGEMENT';
    if (parsed.companyName && parsed.companyName.toUpperCase().includes(oldNameKeyword)) {
      parsed.companyName = 'GCAP PRIVATE LIMITED';
      parsed.tradeName = 'GCAP PRIVATE LIMITED';
      parsed.companyNameHi = 'जीकैप प्राइवेट लिमिटेड';
      parsed.companyBankAccountHolder = 'GCAP PRIVATE LIMITED';
      saveStoredCompanyProfile(parsed);
    }

    return {
      ...DEFAULT_COMPANY_PROFILE,
      ...parsed,
    };
  } catch (err) {
    console.warn('Failed to parse stored company profile:', err);
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
    console.warn('Failed to save company profile:', err);
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
