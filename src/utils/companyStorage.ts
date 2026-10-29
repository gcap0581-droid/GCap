import { CompanyProfile } from '../types';

const COMPANY_PROFILE_STORAGE_KEY = 'gcap_corporate_company_profile_v2';
const OLD_COMPANY_PROFILE_KEY = 'gcap_corporate_company_profile_v1';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'GCap OPC Private Limited',
  companyNameHi: 'जीकैप (ओपीसी) प्राइवेट लिमिटेड',
  tradeName: 'GCap OPC Private Limited',
  cin: 'U66190BR2026OPC088307',
  pan: 'AANCG4365Q',
  tan: 'PTNG16977C',
  gstin: '',
  incorporationDate: '2026-09-23',
  rocJurisdiction: 'ROC Patna, Bihar',
  companyType: 'Private Limited Company (Non-Govt)',
  authorizedCapital: '₹55,00,00,000',
  paidUpCapital: '₹1,00,00,000',
  registeredAddress: 'Khari, Babhangawa, Shree Nagur, Near RRP School of Nursing Sasaram, Bihar - 821113',
  corporateAddress: 'Khari, Babhangawa, Shree Nagur, Near RRP School of Nursing Sasaram, Bihar - 821113',
  city: 'Sasaram',
  state: 'Bihar',
  pincode: '821113',
  supportEmail: 'support@gcapopc.com',
  legalEmail: 'support@gcapopc.com',
  supportPhone: '+91 8503504808',
  altPhone: '+91 6184 220011',
  adminWhatsAppNumber: '+91 8603504808',
  websiteUrl: 'https://www.gcapopc.com',
  authorizedSignatory: 'Amit Kumar',
  signatoryDesignation: 'Director & Authorized Signatory',
  signatoryDin: 'DIN: 11964641',
  sealCity: 'SASARAM (BIHAR)',
  bankName: 'Axis Bank Ltd.',
  bankAccountNumber: '924010008662307',
  bankIfsc: 'UTIB0001219',
  bankBranch: 'Sasaram Branch',
  bankAccountType: 'Current Account',
  companyUpiId: '8603504808@axisbank',
  companyBankAccountHolder: 'GCap OPC Private Limited',
  tagline: 'ASSETS & WEALTH MANAGEMENT SYSTEM',
  taglineHi: 'संपत्ति और धन प्रबंधन प्रणाली',
  // DPIIT Startup India Recognition (Govt of India)
  dippNumber: 'DIPP285976',
  startupIndiaCertNumber: 'DIPP285976',
  startupIndiaCertIssueDate: '30-09-2026',
  startupIndiaCertValidUpto: '22-09-2036',
  industry: 'Finance Technology',
  sector: 'Business Finance',
  dpiitMinistry: 'Ministry of Commerce & Industry, DPIIT, Government of India',
  // Official Social Media & YouTube Channel Links
  youtubeUrl: 'https://www.youtube.com/@GCapOfficial',
  telegramUrl: 'https://t.me/gcapofficial',
  whatsappGroupUrl: 'https://chat.whatsapp.com/GCapOfficialCommunity',
  facebookUrl: 'https://facebook.com/gcapofficial',
  instagramUrl: 'https://instagram.com/gcapofficial',
  twitterUrl: 'https://twitter.com/gcapofficial',
  showYoutube: true,
  showTelegram: true,
  showWhatsapp: true,
  showFacebook: true,
  showInstagram: true,
  showTwitter: true,
  showLinkedin: true,
  featuredVideoUrl: '',
  lastUpdated: '2026-09-30T16:31:07.308Z',
};

/**
 * Safely merges incoming company profile updates without erasing custom non-empty fields
 */
export function mergeCompanyProfiles(base: CompanyProfile, incoming?: Partial<CompanyProfile> | null): CompanyProfile {
  if (!incoming || typeof incoming !== 'object') return base || DEFAULT_COMPANY_PROFILE;
  const baseObj = base || DEFAULT_COMPANY_PROFILE;

  // Merge order: Defaults -> Base -> Incoming (Incoming ALWAYS takes precedence)
  const merged: CompanyProfile = {
    ...DEFAULT_COMPANY_PROFILE,
    ...baseObj,
    ...incoming,
    lastUpdated: incoming.lastUpdated || baseObj.lastUpdated || new Date().toISOString(),
  };

  // Guarantee every non-empty field and boolean in incoming overrides previous values
  (Object.keys(incoming) as (keyof CompanyProfile)[]).forEach((key) => {
    const val = incoming[key];
    if (typeof val === 'string' && val.trim().length > 0) {
      (merged as any)[key] = val;
    } else if (typeof val === 'boolean') {
      (merged as any)[key] = val;
    }
  });

  if (merged.companyName === 'GCAP PRIVATE LIMITED' || merged.companyName === 'GCAP (OPC) PRIVATE LIMITED') {
    merged.companyName = 'GCap OPC Private Limited';
  }
  if (merged.tradeName === 'GCAP PRIVATE LIMITED' || merged.tradeName === 'GCAP (OPC) PRIVATE LIMITED') {
    merged.tradeName = 'GCap OPC Private Limited';
  }
  if (merged.companyBankAccountHolder === 'GCAP PRIVATE LIMITED' || merged.companyBankAccountHolder === 'GCAP (OPC) PRIVATE LIMITED') {
    merged.companyBankAccountHolder = 'GCap OPC Private Limited';
  }
  if (merged.companyNameHi === 'जीकैप प्राइवेट लिमिटेड') {
    merged.companyNameHi = 'जीकैप (ओपीसी) प्राइवेट लिमिटेड';
  }

  return merged;
}

/**
 * Retrieves the stored company profile or returns default
 */
export function getStoredCompanyProfile(): CompanyProfile {
  try {
    // Purge old v1 corrupted dummy storage if present
    if (typeof localStorage !== 'undefined') {
      const oldV1 = localStorage.getItem(OLD_COMPANY_PROFILE_KEY);
      if (oldV1 && (oldV1.includes('AABCG1234F') || oldV1.includes('Grand Plaza') || oldV1.includes('MUMB10293E'))) {
        localStorage.removeItem(OLD_COMPANY_PROFILE_KEY);
        saveStoredCompanyProfile(DEFAULT_COMPANY_PROFILE);
        return DEFAULT_COMPANY_PROFILE;
      }
    }

    const raw = localStorage.getItem(COMPANY_PROFILE_STORAGE_KEY);
    if (!raw) {
      saveStoredCompanyProfile(DEFAULT_COMPANY_PROFILE);
      return DEFAULT_COMPANY_PROFILE;
    }
    const parsed = JSON.parse(raw);
    if (parsed.pan === 'AABCG1234F' || (parsed.registeredAddress && parsed.registeredAddress.includes('Grand Plaza'))) {
      saveStoredCompanyProfile(DEFAULT_COMPANY_PROFILE);
      return DEFAULT_COMPANY_PROFILE;
    }
    return mergeCompanyProfiles(DEFAULT_COMPANY_PROFILE, parsed);
  } catch (err) {
    console.log('Failed to parse stored company profile:', err);
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
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(COMPANY_PROFILE_STORAGE_KEY, JSON.stringify(payload));

    // Emit storage event for multi-tab/subscribers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gcap_company_profile_updated', { detail: payload })
      );
    }
  } catch (err) {
    console.log('Failed to save company profile:', err);
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
