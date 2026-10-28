import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const scenes = [
  {
    id: 1,
    title: 'सुनहरा भविष्य, आपका अपना जीकैप!',
    sub: 'भरोसेमंद निवेश • सुरक्षित कल • बड़ी कामयाबी',
    badge: '🚀 भारत का नंबर 1 ट्रस्टेड डिजिटल एसेट प्लेटफॉर्म',
    audio: 'public/assets/audio/scene_1.wav',
    bg: '#0f172a',
    accent: '#f59e0b',
  },
  {
    id: 2,
    title: 'धमाकेदार 641-दिन शॉर्ट टर्म प्लान',
    sub: '0.160% डेली रिटर्न • ₹1 लाख पर ₹160 प्रतिदिन पक्का!',
    badge: '⚡ 100% मूलधन सुरक्षा • 24 घंटे बाद कभी भी निकासी',
    audio: 'public/assets/audio/scene_2.wav',
    bg: '#091e3a',
    accent: '#38bdf8',
  },
  {
    id: 3,
    title: 'शाही रॉयल्टी पाथवे - लाइफटाइम इनकम',
    sub: '365 दिन + 1461 दिन रॉयल्टी क्लब',
    badge: '👑 ₹10,000 से शुरू करें अपनी शाही आमदनी!',
    audio: 'public/assets/audio/scene_3.wav',
    bg: '#1e112a',
    accent: '#a855f7',
  },
  {
    id: 4,
    title: 'सुपर-फास्ट जीपी स्वैप (GP Instant Swap)',
    sub: '₹1 = 0.98 GP • 1 सेकंड में वॉलेट में ट्रांसफर',
    badge: '🪙 0% विथड्रॉल फीस • कोई छिपा हुआ चार्ज नहीं',
    audio: 'public/assets/audio/scene_4.wav',
    bg: '#06281e',
    accent: '#10b981',
  },
  {
    id: 5,
    title: 'हर 6 घंटे में ऑटो-पेआउट - 24x7 लगातार कमाई',
    sub: '06:00 AM • 12:00 PM • 06:00 PM • 12:00 AM',
    badge: '⏰ जब आप सो रहे होते हैं, तब भी जीकैप आपके लिए कमाता है',
    audio: 'public/assets/audio/scene_5.wav',
    bg: '#1f1305',
    accent: '#f59e0b',
  },
  {
    id: 6,
    title: 'बैंक निकासी: सीधी, सुरक्षित और सरल',
    sub: 'महीने की 1-5 तारीख और 6-10 तारीख को सीधी बैंक निकासी',
    badge: '🏦 न्यूनतम निकासी मात्र ₹200 • सीधे आपके बैंक खाते में',
    audio: 'public/assets/audio/scene_6.wav',
    bg: '#06202a',
    accent: '#06b6d4',
  },
  {
    id: 7,
    title: 'ज्वाइन जीकैप इंडिया - आज ही शुरुआत करें!',
    sub: 'ऑफिशियल सपोर्ट: +91 8603504808 • हेड ऑफिस: सासाराम, बिहार',
    badge: '🌟 सुनहरा मौका हाथ से न जाने दें • अभी रजिस्टर करें!',
    audio: 'public/assets/audio/scene_7.wav',
    bg: '#0f172a',
    accent: '#eab308',
  },
];

console.log('Rendering 7 Scene Slides...');
const tmpDir = '/tmp/gcap_render';
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const segmentPaths = [];

scenes.forEach((sc) => {
  const svgPath = path.join(tmpDir, `scene_${sc.id}.svg`);
  const segPath = path.join(tmpDir, `seg_${sc.id}.mp4`);
  
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${sc.bg}" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bg)" />

  <!-- Gold Border Frame -->
  <rect x="20" y="20" width="1240" height="680" rx="24" fill="none" stroke="#f59e0b" stroke-width="3" stroke-opacity="0.4" />

  <!-- Top Header Bar -->
  <rect x="40" y="40" width="1200" height="70" rx="16" fill="#0b1329" fill-opacity="0.8" stroke="#334155" stroke-width="1.5" />
  
  <text x="70" y="85" font-family="DejaVu Sans, system-ui, sans-serif" font-weight="900" font-size="28" fill="#fbbf24">✨ GCAP GLOBAL DIGITAL ASSET</text>
  <text x="1200" y="85" text-anchor="end" font-family="DejaVu Sans, system-ui, sans-serif" font-weight="bold" font-size="18" fill="#38bdf8">CIN: U65990BR2024PTC068892 • ISO 9001:2015</text>

  <!-- Center Card -->
  <rect x="100" y="150" width="1080" height="420" rx="28" fill="#000000" fill-opacity="0.6" stroke="${sc.accent}" stroke-width="2" stroke-opacity="0.7" />

  <!-- Badge -->
  <rect x="240" y="180" width="800" height="48" rx="24" fill="${sc.accent}" fill-opacity="0.15" stroke="${sc.accent}" stroke-width="1.5" />
  <text x="640" y="212" text-anchor="middle" font-family="Noto Sans Devanagari, DejaVu Sans, sans-serif" font-weight="bold" font-size="22" fill="${sc.accent}">${sc.badge}</text>

  <!-- Scene Big Title -->
  <text x="640" y="310" text-anchor="middle" font-family="Noto Sans Devanagari, DejaVu Sans, sans-serif" font-weight="900" font-size="52" fill="#ffffff">${sc.title}</text>

  <!-- Subtitle -->
  <text x="640" y="380" text-anchor="middle" font-family="Noto Sans Devanagari, DejaVu Sans, sans-serif" font-weight="bold" font-size="28" fill="#fde047">${sc.sub}</text>

  <!-- Feature Tags -->
  <text x="640" y="470" text-anchor="middle" font-family="Noto Sans Devanagari, DejaVu Sans, sans-serif" font-weight="bold" font-size="22" fill="#94a3b8">सीन ${sc.id} / 7 • 100% गारंटीकृत सुरक्षा • ऑटो-क्रेडिट बैंक वॉलेट</text>

  <!-- Bottom Ticker -->
  <rect x="40" y="600" width="1200" height="60" rx="14" fill="#f59e0b" />
  <text x="640" y="638" text-anchor="middle" font-family="Noto Sans Devanagari, DejaVu Sans, sans-serif" font-weight="900" font-size="21" fill="#000000">🚀 जीकैप इंडिया: हर 6 घंटे में रिटर्न • 0% फीस • ऑफिस: सासाराम, बिहार • हेल्पलाइन: +91 8603504808</text>
</svg>`;

  fs.writeFileSync(svgPath, svgContent);

  console.log(`Encoding Segment ${sc.id}...`);
  // Render segment with H.264 baseline + AAC audio
  execSync(`ffmpeg -y -loop 1 -i "${svgPath}" -i "${sc.audio}" -c:v libx264 -preset ultrafast -tune stillimage -pix_fmt yuv420p -profile:v baseline -level 3.0 -c:a aac -b:a 192k -ar 44100 -ac 2 -shortest "${segPath}"`);
  segmentPaths.push(segPath);
});

console.log('Concatenating segments into final Master MP4...');
const concatListFile = path.join(tmpDir, 'concat_list.txt');
fs.writeFileSync(concatListFile, segmentPaths.map((p) => `file '${p}'`).join('\n'));

const finalMp4Path = path.resolve('public/assets/video/GCap_Official_Promo_HD.mp4');
execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListFile}" -c:v copy -c:a copy -movflags +faststart "${finalMp4Path}"`);

console.log('Master Video Rendered Successfully at:', finalMp4Path);
const stats = fs.statSync(finalMp4Path);
console.log('Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
