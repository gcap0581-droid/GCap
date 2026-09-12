import { InvestmentPlan } from '../types';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'short-term',
    name: 'Short Term Plan',
    nameHi: 'शॉर्ट टर्म प्लान (Short Term Plan)',
    dailyRoiPercent: 0.164, // 0.041% every 6 hours (0.041% * 4 = 0.164% per day)
    durationDays: 641,
    minAmount: 100000, // Min ₹1,00,000
    maxAmount: 1000000000, // Unlimited max
    payoutFrequency: 'Daily',
    payoutFrequencyHi: 'हर 6 घंटे में 0.041% GP',
    risk: 'Low',
    tag: '641 Days Lock + 0.041%/6h GP',
    tagHi: '641 दिन लॉक + हर 6h में 0.041% GP',
    badge: '⚡ 641-Day Short Term Plan',
    description: 'Special 641-day Short Term investment plan. Minimum deposit ₹1,00,000 (No maximum limit). Locked for 641 days. Earn 0.041% of your investment amount every 6 hours as GP (1 GP = ₹1) automatically credited to Total Earning. Withdraw earnings as per company withdrawal dates. At 641 days maturity, choose to renew with same Plan ID or withdraw full principal + remaining earnings with an official Certificate.',
    descriptionHi: 'विशेष 641 दिवसीय शॉर्ट टर्म निवेश योजना। न्यूनतम निवेश ₹1,00,000 (अधिकतम की कोई सीमा नहीं)। मूलधन 641 दिनों तक सुरक्षित लॉक रहेगा। लॉक पीरियड में हर 6 घंटे में निवेश राशि का 0.041% GP (1 GP = ₹1) स्वतः Total Earning में जमा होता रहेगा। कंपनी के निकासी नियमों (1 से 5 तारीख) के तहत अर्निंग निकाली जा सकती है। 641 दिन पूरे होने पर उसी Plan ID से पुनः रिन्यू करें अथवा पूरा मूलधन व शेष लाभ निकालें और आधिकारिक परिपक्वता प्रमाण पत्र प्राप्त करें।',
    features: [
      'न्यूनतम निवेश ₹1,00,000 (अधिकतम निवेश की कोई सीमा नहीं / Unlimited)',
      'परिपक्वता अवधि 641 दिन (पूंजी 641 दिनों तक सुरक्षित लॉक)',
      'हर 6 घंटे में निवेश राशि का 0.041% GP लाभ (1 GP = ₹1)',
      'प्रत्येक 6 घंटे में अर्निंग स्वतः Total Earning बैलेंस में जमा',
      'कंपनी के नियमों के तहत निकासी (महीने की 1 से 5 तारीख)',
      'एक यूजर एक से अधिक प्लान ले सकता है (प्रत्येक का यूनिक सर्च करने योग्य ID)',
      '641 दिन पूर्ण होने पर पूरा मूलधन व शेष अर्निंग निकासी अथवा उसी ID से रिन्यूअल',
      'प्लान क्लोज होने पर प्रिंट करने योग्य शानदार आधिकारिक परिपक्वता प्रमाण पत्र'
    ],
    featuresHi: [
      'न्यूनतम निवेश ₹1,00,000 (अधिकतम निवेश की कोई सीमा नहीं / Unlimited)',
      'परिपक्वता अवधि 641 दिन (पूंजी 641 दिनों तक सुरक्षित लॉक)',
      'हर 6 घंटे में निवेश राशि का 0.041% GP लाभ (1 GP = ₹1)',
      'प्रत्येक 6 घंटे में अर्निंग स्वतः Total Earning बैलेंस में जमा',
      'कंपनी के नियमों के तहत निकासी (महीने की 1 से 5 तारीख)',
      'एक यूजर एक से अधिक प्लान ले सकता है (प्रत्येक का यूनिक सर्च करने योग्य ID)',
      '641 दिन पूर्ण होने पर पूरा मूलधन व शेष अर्निंग निकासी अथवा उसी ID से रिन्यूअल',
      'प्लान क्लोज होने पर प्रिंट करने योग्य शानदार आधिकारिक परिपक्वता प्रमाण पत्र'
    ]
  },
  {
    id: 'long-term',
    name: 'Long Term Plan',
    nameHi: 'लॉन्ग टर्म प्लान (Long Term Plan)',
    dailyRoiPercent: 0.124, // 0.031% every 6 hours (0.031% * 4 = 0.124% per day)
    durationDays: 365,
    minAmount: 50000, // Min ₹50,000
    maxAmount: 100000, // Max ₹100,000
    payoutFrequency: 'Daily',
    payoutFrequencyHi: 'हर 6 घंटे में 0.031% GP',
    risk: 'Low',
    tag: '365 Days Lock + 0.031%/6h GP + Royalty Pathway',
    tagHi: '365 दिन लॉक + 0.031%/6h GP + रॉयल्टी प्लान',
    badge: '👑 365-Day Long Term & Royalty Plan',
    description: 'Premier 365-day Long Term Plan with Royalty pathway. Deposit ₹50,000 to ₹100,000. Locked for 365 days. Earn 0.031% of your invested amount every 6 hours as GP (1 GP = ₹1) credited automatically to Total Earning. Withdraw earnings as per company withdrawal rules. At 365 days maturity, choose to exit with full principal + remaining earnings with Certificate, OR lock for 1461 days to qualify for 1825 days of lifetime Royalty earnings even after principal withdrawal!',
    descriptionHi: 'प्रीमियम 365-दिवसीय लॉन्ग टर्म निवेश एवं रॉयल्टी योजना। निवेश सीमा ₹50,000 से ₹1,00,000 तक। मूलधन 365 दिनों तक सुरक्षित लॉक रहेगा। लॉक अवधि में हर 6 घंटे में निवेश राशि का 0.031% GP (1 GP = ₹1) स्वतः Total Earning में जमा होता रहेगा। कंपनी के निकासी नियमों (महीने की 1 से 5 तारीख) के तहत अर्निंग निकासी। 365 दिन पूरे होने पर पूरा मूलधन व अर्निंग निकालकर सर्टिफिकेट प्राप्त करें अथवा 1461 दिनों के लिए रॉयल्टी प्लान में जाएं जहां 1461 दिन पूरे होने पर मूलधन वापस मिलने के बाद भी अगले 1825 दिनों (5 वर्ष) तक लगातार अर्निंग मिलती रहेगी!',
    features: [
      'न्यूनतम निवेश ₹50,000 एवं अधिकतम ₹1,00,000',
      'अवधि 365 दिन (पूंजी 365 दिनों तक सुरक्षित लॉक)',
      'हर 6 घंटे में निवेश राशि का 0.031% GP (1 GP = ₹1) स्वतः जमा',
      'कंपनी के निकासी नियमों (1 से 5 तारीख) के अनुसार लाभ निकासी',
      'प्रत्येक प्लान का यूनिक सर्च करने योग्य ID (LTP-365D-XXXXX)',
      '365 दिन पूर्ण होने पर मूलधन निकासी + सर्टिफिकेट अथवा रॉयल्टी प्लान में जाने का विकल्प',
      'रॉयल्टी प्लान (1461 दिन) चुनने पर 1461 दिन बाद मूलधन वापसी',
      'मूलधन वापसी के बाद भी अगले 1825 दिनों (5 वर्ष) तक लगातार रॉयल्टी अर्निंग + रॉयल मास्टर सर्टिफिकेट'
    ],
    featuresHi: [
      'न्यूनतम निवेश ₹50,000 एवं अधिकतम ₹1,00,000',
      'अवधि 365 दिन (पूंजी 365 दिनों तक सुरक्षित लॉक)',
      'हर 6 घंटे में निवेश राशि का 0.031% GP (1 GP = ₹1) स्वतः जमा',
      'कंपनी के निकासी नियमों (1 से 5 तारीख) के अनुसार लाभ निकासी',
      'प्रत्येक प्लान का यूनिक सर्च करने योग्य ID (LTP-365D-XXXXX)',
      '365 दिन पूर्ण होने पर मूलधन निकासी + सर्टिफिकेट अथवा रॉयल्टी प्लान में जाने का विकल्प',
      'रॉयल्टी प्लान (1461 दिन) चुनने पर 1461 दिन बाद मूलधन वापसी',
      'मूलधन वापसी के बाद भी अगले 1825 दिनों (5 वर्ष) तक लगातार रॉयल्टी अर्निंग + रॉयल मास्टर सर्टिफिकेट'
    ]
  }
];

