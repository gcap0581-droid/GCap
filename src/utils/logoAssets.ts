import luxuryGoldImg from '../assets/images/gcap_luxury_logo_1790665820788.jpg';
import officialSealImg from '../assets/images/gcap_emblem_seal_1790665840672.jpg';
import corporateEliteImg from '../assets/images/gcap_hd_logo_premium_1790349527564.jpg';

export interface LogoAssetInfo {
  id: string;
  nameHi: string;
  nameEn: string;
  descHi: string;
  descEn: string;
  tag: string;
  tagColor: string;
  url: string;
  fallbackUrl: string;
}

export const GCAP_LOGOS: LogoAssetInfo[] = [
  {
    id: 'luxury-gold-3d',
    nameHi: 'लग्जरी 3D गोल्ड एम्बलम (Ultra HD)',
    nameEn: 'Luxury 3D Gold Emblem (Ultra HD)',
    descHi: '3D पॉलिश्ड गोल्ड शील्ड, राइजिंग ग्रोथ एरो और रॉयल गोल्ड क्राउन फिनिशिंग।',
    descEn: '3D polished metallic gold crest with growth arrow and royal crown finishing.',
    tag: 'MOST POPULAR',
    tagColor: 'from-amber-500 to-yellow-600',
    url: luxuryGoldImg,
    fallbackUrl: '/assets/images/gcap-luxury-gold-3d.jpg',
  },
  {
    id: 'official-crest-seal',
    nameHi: 'रॉयल कॉरपोरेट सील व बैज (Official 4K)',
    nameEn: 'Royal Corporate Seal & Badge (Official 4K)',
    descHi: 'सर्कुलर लीगल सील, लॉरेल पुष्पांजलि, सितारे एवं आधिकारिक कॉरपोरेट पहचान।',
    descEn: 'Circular official corporate legal seal with laurel wreath, stars and crest.',
    tag: 'OFFICIAL SEAL',
    tagColor: 'from-emerald-500 to-teal-600',
    url: officialSealImg,
    fallbackUrl: '/assets/images/gcap-official-crest-seal.jpg',
  },
  {
    id: 'corporate-elite',
    nameHi: 'कॉरपोरेट एलिट डायमंड गोल्ड (HD)',
    nameEn: 'Corporate Elite Diamond Gold (HD)',
    descHi: 'गहरे नेवी बैकग्राउंड पर मॉडर्न मिनिमल गोल्ड ज्योमेट्री और प्रीमियम लुक।',
    descEn: 'Modern minimal gold geometry and clean high-end corporate presence.',
    tag: 'CORPORATE BRAND',
    tagColor: 'from-blue-500 to-indigo-600',
    url: corporateEliteImg,
    fallbackUrl: '/assets/images/gcap-corporate-elite.jpg',
  },
];

export const PRIMARY_COMPANY_LOGO = luxuryGoldImg || '/assets/images/gcap-luxury-gold-3d.jpg';
export const OFFICIAL_SEAL_LOGO = officialSealImg || '/assets/images/gcap-official-crest-seal.jpg';
export const CORPORATE_ELITE_LOGO = corporateEliteImg || '/assets/images/gcap-corporate-elite.jpg';
