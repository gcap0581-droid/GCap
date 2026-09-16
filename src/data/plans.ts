import { InvestmentPlan } from '../types';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'short-term',
    name: 'Short Term Plan (641-Day Plan)',
    nameHi: 'शॉर्ट टर्म प्लान (641-Day Plan)',
    dailyRoiPercent: 0.164, // 0.041% every 6 hours (0.041% * 4 = 0.164% per day)
    durationDays: 641,
    minAmount: 10000, // Min ₹10,000
    maxAmount: 1000000000, // Unlimited (₹10,000 to Unlimited)
    payoutFrequency: 'Daily',
    payoutFrequencyHi: 'हर 6 घंटे में 0.041% GP',
    risk: 'Low',
    tag: '641 Days • First 24h Lock • 0.041%/6h GP',
    tagHi: '641 दिन • पहले 24 घंटे का लॉक • हर 6h में 0.041% GP',
    badge: '⚡ 641-Day Short Term Plan (Unlimited)',
    description: 'Special 641-day Short Term investment plan. Deposit ₹10,000 to Unlimited. First 24 hours lock. Earn 0.041% of your investment amount every 6 hours as GP (1 GP = ₹1) automatically credited to Total Earning.',
    descriptionHi: 'विशेष 641 दिवसीय शॉर्ट टर्म निवेश योजना। निवेश सीमा ₹10,000 से असीमित (Unlimited)। पहले 24 घंटे का लॉक। हर 6 घंटे में निवेश राशि का 0.041% GP (1 GP = ₹1) स्वतः Total Earning में जमा होता रहेगा।',
    features: [
      'न्यूनतम निवेश ₹10,000 से अधिकतम असीमित (Unlimited)',
      'परिपक्वता अवधि 641 दिन (पहले 24 घंटे का लॉक)',
      'हर 6 घंटे में निवेश राशि का 0.041% GP लाभ (1 GP = ₹1)',
      'प्रत्येक 6 घंटे में अर्निंग स्वतः Total Earning बैलेंस में जमा',
      'कंपनी के नियमों के तहत निकासी (महीने की 1 से 5 तारीख)',
      'एक यूजर एक से अधिक प्लान ले सकता है',
      '641 दिन पूर्ण होने पर पूरा मूलधन व शेष अर्निंग निकासी अथवा उसी ID से रिन्यूअल',
      'प्लान क्लोज होने पर प्रिंट करने योग्य शानदार आधिकारिक परिपक्वता प्रमाण पत्र'
    ],
    featuresHi: [
      'न्यूनतम निवेश ₹10,000 से अधिकतम असीमित (Unlimited)',
      'परिपक्वता अवधि 641 दिन (पहले 24 घंटे का लॉक)',
      'हर 6 घंटे में निवेश राशि का 0.041% GP लाभ (1 GP = ₹1)',
      'प्रत्येक 6 घंटे में अर्निंग स्वतः Total Earning बैलेंस में जमा',
      'कंपनी के नियमों के तहत निकासी (महीने की 1 से 5 तारीख)',
      'एक यूजर एक से अधिक प्लान ले सकता है',
      '641 दिन पूर्ण होने पर पूरा मूलधन व शेष अर्निंग निकासी अथवा उसी ID से रिन्यूअल',
      'प्लान क्लोज होने पर प्रिंट करने योग्य शानदार आधिकारिक परिपक्वता प्रमाण पत्र'
    ]
  },
  {
    id: 'long-term',
    name: 'Long Term Plan (365-Day & Royalty Plan)',
    nameHi: 'लॉन्ग टर्म प्लान (365-Day & Royalty Plan)',
    dailyRoiPercent: 0.128, // 0.032% every 6 hours (0.032% * 4 = 0.128% per day)
    durationDays: 365,
    minAmount: 10000, // Min ₹10,000
    maxAmount: 100000, // Max ₹1,00,000
    payoutFrequency: 'Daily',
    payoutFrequencyHi: 'हर 6 घंटे में 0.032% GP',
    risk: 'Low',
    tag: '365 Days • First 24h Lock • 0.032%/6h GP + Royalty',
    tagHi: '365 दिन • पहले 24 घंटे का लॉक • 0.032%/6h GP + रॉयल्टी पाथवे',
    badge: '👑 365-Day Long Term & Royalty Plan',
    description: 'Premier 365-day Long Term Plan with Royalty pathway. Deposit ₹10,000 to ₹1,00,000. First 24 hours lock. Earn 0.032% of your invested amount every 6 hours as GP (1 GP = ₹1) credited automatically to Total Earning.',
    descriptionHi: 'प्रीमियम 365-दिवसीय लॉन्ग टर्म निवेश एवं रॉयल्टी योजना। निवेश सीमा ₹10,000 से ₹1,00,000 तक। पहले 24 घंटे का लॉक। हर 6 घंटे में निवेश राशि का 0.032% GP (1 GP = ₹1) स्वतः Total Earning में जमा होगा + रॉयल्टी पाथवे।',
    features: [
      'न्यूनतम निवेश ₹10,000 एवं अधिकतम ₹1,00,000',
      'अवधि 365 दिन (पहले 24 घंटे का लॉक)',
      'हर 6 घंटे में निवेश राशि का 0.032% GP (1 GP = ₹1) स्वतः जमा',
      'कंपनी के निकासी नियमों (1 से 5 तारीख) के अनुसार लाभ निकासी',
      '365 दिन पूर्ण होने पर मूलधन निकासी + सर्टिफिकेट अथवा रॉयल्टी प्लान में जाने का विकल्प',
      'रॉयल्टी प्लान (1461 दिन) चुनने पर 1461 दिन बाद मूलधन वापसी',
      'मूलधन वापसी के बाद भी अगले 1825 दिनों (5 वर्ष) तक लगातार रॉयल्टी अर्निंग + रॉयल मास्टर सर्टिफिकेट'
    ],
    featuresHi: [
      'न्यूनतम निवेश ₹10,000 एवं अधिकतम ₹1,00,000',
      'अवधि 365 दिन (पहले 24 घंटे का लॉक)',
      'हर 6 घंटे में निवेश राशि का 0.032% GP (1 GP = ₹1) स्वतः जमा',
      'कंपनी के निकासी नियमों (1 से 5 तारीख) के अनुसार लाभ निकासी',
      '365 दिन पूर्ण होने पर मूलधन निकासी + सर्टिफिकेट अथवा रॉयल्टी प्लान में जाने का विकल्प',
      'रॉयल्टी प्लान (1461 दिन) चुनने पर 1461 दिन बाद मूलधन वापसी',
      'मूलधन वापसी के बाद भी अगले 1825 दिनों (5 वर्ष) तक लगातार रॉयल्टी अर्निंग + रॉयल मास्टर सर्टिफिकेट'
    ]
  }
];

