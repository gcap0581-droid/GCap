import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Sparkles,
  CheckCircle,
  Eye,
  Sliders,
  Image as ImageIcon,
  Layers,
  ShieldCheck,
  Palette,
  Maximize2,
  FileImage,
  RefreshCw,
  Building2,
  Share2,
  Copy,
  Info,
  ExternalLink
} from 'lucide-react';
import { getStoredCompanyProfile } from '../../utils/companyStorage';
import { GCAP_LOGOS, LogoAssetInfo } from '../../utils/logoAssets';
import { Language } from '../../types';

interface AdminCompanyLogoTabProps {
  language?: Language;
}

const STANDARD_SIZES = [
  { label: '128 x 128 px', width: 128, height: 128, use: 'Favicon / Mini Icon', badge: 'XS' },
  { label: '256 x 256 px', width: 256, height: 256, use: 'Avatar / Profile DP', badge: 'SM' },
  { label: '512 x 512 px', width: 512, height: 512, use: 'App Icon / WhatsApp / Web', badge: 'MD' },
  { label: '1024 x 1024 px', width: 1024, height: 1024, use: '1K HD Master (Docs & Web)', badge: 'HD 1K' },
  { label: '2048 x 2048 px', width: 2048, height: 2048, use: '2K Ultra HD (Print & Flex)', badge: '2K QHD' },
  { label: '4096 x 4096 px', width: 4096, height: 4096, use: '4K Cinema HD (Master Print)', badge: '4K UHD' },
];

export const AdminCompanyLogoTab: React.FC<AdminCompanyLogoTabProps> = ({ language = 'hi' }) => {
  const isHi = language === 'hi';
  const profile = getStoredCompanyProfile();

  const [selectedLogoId, setSelectedLogoId] = useState<string>('luxury-gold-3d');
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');
  const [selectedSize, setSelectedSize] = useState<number>(1024);
  const [isCustomSize, setIsCustomSize] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(1200);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Background preview mode
  const [previewBg, setPreviewBg] = useState<'dark' | 'light' | 'checker'>('dark');
  const [activeMockup, setActiveMockup] = useState<'none' | 'appHeader' | 'letterhead' | 'idCard'>('none');

  // Vector Engine custom texts
  const [companyText, setCompanyText] = useState(profile.companyName || 'GCAP PRIVATE LIMITED');
  const [subtitleText, setSubtitleText] = useState('GLOBAL ASSET PORTAL');
  const [cinText, setCinText] = useState(profile.cin || 'U66190BR2026OPC088307');
  const [establishedYear, setEstablishedYear] = useState('2026');

  // Download status state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vectorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentPreset = GCAP_LOGOS.find((p) => p.id === selectedLogoId) || GCAP_LOGOS[0];

  // Draw Dynamic Vector Logo when Vector Engine is active or as an alternative
  useEffect(() => {
    if (selectedLogoId === 'vector-master') {
      drawVectorLogo();
    }
  }, [selectedLogoId, companyText, subtitleText, cinText, establishedYear]);

  const drawVectorLogo = () => {
    const canvas = vectorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1000;
    canvas.height = 1000;

    // Background gradient
    const bgGrad = ctx.createRadialGradient(500, 500, 100, 500, 500, 600);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.6, '#04070d');
    bgGrad.addColorStop(1, '#020306');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 1000);

    // Decorative outer gold ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(500, 500, 440, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    const goldGrad = ctx.createLinearGradient(200, 100, 800, 900);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.2, '#d97706');
    goldGrad.addColorStop(0.5, '#fbbf24');
    goldGrad.addColorStop(0.8, '#b45309');
    goldGrad.addColorStop(1, '#fef3c7');
    ctx.strokeStyle = goldGrad;
    ctx.stroke();

    // Dotted accent ring
    ctx.beginPath();
    ctx.arc(500, 500, 420, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner shield/hexagon background
    ctx.beginPath();
    ctx.arc(500, 500, 360, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = goldGrad;
    ctx.stroke();

    // Crown / 3 stars at top
    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = goldGrad;
      ctx.fill();
    };

    drawStar(500, 220, 5, 24, 10);
    drawStar(430, 235, 5, 18, 8);
    drawStar(570, 235, 5, 18, 8);

    // Large Monogram "GCAP"
    ctx.font = '900 130px "Inter", "Montserrat", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = goldGrad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 25;
    ctx.fillText('GCAP', 500, 390);
    ctx.shadowBlur = 0;

    // Rising Arrow / Financial Growth Line
    ctx.beginPath();
    ctx.moveTo(330, 480);
    ctx.lineTo(440, 480);
    ctx.lineTo(530, 440);
    ctx.lineTo(670, 440);
    ctx.lineWidth = 5;
    ctx.strokeStyle = goldGrad;
    ctx.stroke();

    // Arrow tip
    ctx.beginPath();
    ctx.moveTo(670, 440);
    ctx.lineTo(650, 425);
    ctx.lineTo(650, 455);
    ctx.closePath();
    ctx.fillStyle = goldGrad;
    ctx.fill();

    // Company Name (Primary)
    ctx.font = '800 36px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '4px';
    ctx.fillText(companyText.toUpperCase(), 500, 550);

    // Subtitle / Tagline
    ctx.font = '700 22px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.letterSpacing = '8px';
    ctx.fillText(subtitleText.toUpperCase(), 500, 605);

    // CIN / Legal ID
    ctx.font = '600 18px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.letterSpacing = '2px';
    ctx.fillText(`CIN: ${cinText}`, 500, 660);

    // Established Ribbon / Badge at bottom
    ctx.beginPath();
    ctx.roundRect(380, 710, 240, 44, 22);
    ctx.fillStyle = 'rgba(217, 119, 6, 0.2)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.stroke();

    ctx.font = '800 16px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.letterSpacing = '3px';
    ctx.fillText(`ESTD. ${establishedYear} • INDIA`, 500, 734);

    ctx.restore();
  };

  /**
   * High Definition Master Resizer & Download Engine
   * Draws from the source image or vector canvas at exact specified dimensions
   */
  const handleDownloadLogo = async (overrideW?: number, overrideH?: number, overrideFmt?: 'png' | 'jpeg') => {
    setIsProcessing(true);
    setDownloadSuccess(null);

    const targetWidth = overrideW || (isCustomSize ? customWidth : selectedSize);
    const targetHeight = overrideH || (isCustomSize ? customHeight : selectedSize);
    const format = overrideFmt || downloadFormat;

    try {
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = targetWidth;
      offscreenCanvas.height = targetHeight;
      const ctx = offscreenCanvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // High quality bicubic image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (selectedLogoId === 'vector-master') {
        const sourceVector = vectorCanvasRef.current;
        if (sourceVector) {
          ctx.drawImage(sourceVector, 0, 0, targetWidth, targetHeight);
        }
      } else {
        // Load image from preset
        const img = new Image();
        if (!currentPreset.url.startsWith('data:')) {
          img.crossOrigin = 'anonymous';
        }

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Image failed to load'));
            img.src = currentPreset.fallbackUrl;
          };
          img.src = currentPreset.url;
        });

        // If JPEG and user wants dark luxury background, ensure canvas is not transparent
        if (format === 'jpeg') {
          ctx.fillStyle = '#060a12';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }

      // Convert to blob
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const quality = 1.0; // Max 100% quality

      const blob = await new Promise<Blob | null>((resolve) => {
        offscreenCanvas.toBlob((b) => resolve(b), mimeType, quality);
      });

      if (!blob) {
        throw new Error('Blob conversion failed');
      }

      // Trigger instant browser download
      const cleanName = currentPreset.id.replace(/-/g, '_');
      const filename = `GCAP_Official_Logo_${cleanName}_${targetWidth}x${targetHeight}.${format}`;
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(`${filename} (${(blob.size / 1024).toFixed(0)} KB) ${isHi ? 'सफलतापूर्वक डाउनलोड हुआ!' : 'downloaded successfully!'}`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Logo download failed:', err);
      alert(isHi ? 'लोगो डाउनलोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Failed to download logo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Download All Standard Sizes package
   */
  const handleDownloadAllSizes = async () => {
    setIsProcessing(true);
    const sizesToExport = [256, 512, 1024, 2048];
    for (const sz of sizesToExport) {
      await handleDownloadLogo(sz, sz, downloadFormat);
      // Brief pause between browser downloads
      await new Promise((r) => setTimeout(r, 600));
    }
    setIsProcessing(false);
    setDownloadSuccess(isHi ? 'सभी मानक साइज (256px, 512px, 1024px, 2048px) डाउनलोड हो गए!' : 'All standard sizes downloaded!');
  };

  /**
   * Copy Image to Clipboard
   */
  const handleCopyImage = async () => {
    try {
      const imgSrc = currentPreset.url || currentPreset.fallbackUrl;
      const response = await fetch(imgSrc);
      const blob = await response.blob();
      if (navigator.clipboard && (window as any).ClipboardItem) {
        // Must be PNG for ClipboardItem in most browsers
        const img = new Image();
        img.src = imgSrc;
        await new Promise((res) => { img.onload = res; });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1024;
        canvas.height = img.naturalHeight || 1024;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(async (pngBlob) => {
          if (pngBlob) {
            await navigator.clipboard.write([
              new (window as any).ClipboardItem({ 'image/png': pngBlob })
            ]);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 3000);
          }
        }, 'image/png');
      } else {
        await navigator.clipboard.writeText(window.location.origin + (currentPreset.url || currentPreset.fallbackUrl));
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 p-6 border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border border-amber-500/40 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isHi ? 'कंपनी आधिकारिक HD लोगो स्टूडियो' : 'Official Company HD Logo Studio'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-sm">
                  4K ULTRA HD • PNG & JPG
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                {isHi
                  ? 'GCAP PRIVATE LIMITED के लिए एडवांस और आकर्षक HD लोगो। हर साइज (128px से 4096px 4K) में PNG और JPEG दोनों फॉर्मेट में तुरंत डाउनलोड करें।'
                  : 'Advanced & attractive HD logo assets for GCAP PRIVATE LIMITED. Download in all resolutions (128px to 4096px 4K) in both PNG and JPEG formats.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleDownloadAllSizes}
              disabled={isProcessing}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isHi ? 'ऑल साइज डाउनलोड पैक' : 'Download All Sizes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{downloadSuccess}</span>
        </div>
      )}

      {/* Main Grid: Logo Selector & Real-Time Preview + Downloader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Logo Variants & Live Vector Engine */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>{isHi ? 'लोगो वेरियंट चुनें' : 'Select Logo Variant'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {GCAP_LOGOS.length + 1} {isHi ? 'डिजाइन्स उपलब्ध' : 'Designs Available'}
              </span>
            </div>

            {/* Presets List */}
            <div className="space-y-3">
              {GCAP_LOGOS.map((preset) => {
                const isSelected = selectedLogoId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedLogoId(preset.id)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 shadow-md">
                      <img
                        src={preset.url}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = preset.fallbackUrl;
                        }}
                        alt={preset.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-amber-300 drop-shadow" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {isHi ? preset.nameHi : preset.nameEn}
                        </h4>
                      </div>
                      <span className={`inline-block mt-0.5 text-[9px] font-black px-2 py-0.5 rounded text-white bg-gradient-to-r ${preset.tagColor}`}>
                        {preset.tag}
                      </span>
                      <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-1">
                        {isHi ? preset.descHi : preset.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Vector Master Engine Option */}
              <div
                onClick={() => setSelectedLogoId('vector-master')}
                className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                  selectedLogoId === 'vector-master'
                    ? 'bg-purple-500/15 border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-purple-500/40 bg-slate-950 shrink-0 flex items-center justify-center">
                  <Sliders className="w-7 h-7 text-purple-400" />
                  {selectedLogoId === 'vector-master' && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-purple-300 drop-shadow" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {isHi ? 'लाइव कस्टमाइजेबल लोगो इंजन' : 'Live Vector Customizer'}
                    </h4>
                  </div>
                  <span className="inline-block mt-0.5 text-[9px] font-black px-2 py-0.5 rounded text-white bg-gradient-to-r from-purple-500 to-indigo-600">
                    LIVE SVG / CANVAS
                  </span>
                  <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-1">
                    {isHi ? 'कंपनी का नाम, CIN और टैगलाइन लाइव कस्टमाइज करें।' : 'Customize legal name, CIN and taglines in real time.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Customization controls if Vector Engine is active */}
            {selectedLogoId === 'vector-master' && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
                <h5 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isHi ? 'वेक्टर लोगो टेक्स्ट सेटिंग्स' : 'Vector Logo Settings'}</span>
                </h5>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    {isHi ? 'कंपनी का नाम' : 'Company Name'}
                  </label>
                  <input
                    type="text"
                    value={companyText}
                    onChange={(e) => setCompanyText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    {isHi ? 'सब-टाइटल / टैगलाइन' : 'Subtitle / Tagline'}
                  </label>
                  <input
                    type="text"
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">CIN</label>
                    <input
                      type="text"
                      value={cinText}
                      onChange={(e) => setCinText(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      {isHi ? 'स्थापना वर्ष' : 'Estd Year'}
                    </label>
                    <input
                      type="text"
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Info className="w-4 h-4" />
              <span>{isHi ? 'लोगो उपयोग निर्देशिका' : 'Usage Guidelines'}</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
              <li><strong className="text-slate-200">PNG Format:</strong> {isHi ? 'वेबसाइट, मोबाइल ऐप, और पारदर्शी उपयोग के लिए सर्वोत्तम।' : 'Best for app, website, and transparent overlay.'}</li>
              <li><strong className="text-slate-200">JPEG Format:</strong> {isHi ? 'प्रिंट, फ्लेक्स बैनर, लेटरहेड और दस्तावेज़ों के लिए 100% स्पष्टता।' : 'Best for printing, flex banners, certificates & docs.'}</li>
              <li><strong className="text-slate-200">4K UHD (4096px):</strong> {isHi ? 'बड़ी होर्डिंग्स और ऑफिस बोर्ड के लिए अल्ट्रा-हाई रेजोल्यूशन।' : 'Ultra crisp for large hoardings and signage.'}</li>
            </ul>
          </div>
        </div>

        {/* Right Column (7 cols): Visual HD Preview & Download Engine */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            
            {/* Header with Background Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {isHi ? 'लाइव HD प्रीव्यू' : 'Live HD Preview'}
                </h3>
              </div>

              {/* Background Theme Mode for preview */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium px-2">
                  {isHi ? 'पृष्ठभूमि:' : 'Background:'}
                </span>
                <button
                  onClick={() => setPreviewBg('dark')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    previewBg === 'dark' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'डार्क लग्जरी' : 'Dark'}
                </button>
                <button
                  onClick={() => setPreviewBg('light')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    previewBg === 'light' ? 'bg-slate-200 text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'लाइट व्हाइट' : 'Light'}
                </button>
                <button
                  onClick={() => setPreviewBg('checker')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    previewBg === 'checker' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isHi ? 'पारदर्शी ग्रिड' : 'Grid'}
                </button>
              </div>
            </div>

            {/* Display Canvas or Image with Background Wrapper */}
            <div
              className={`relative rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden min-h-[340px] border ${
                previewBg === 'dark'
                  ? 'bg-gradient-to-b from-[#060a12] via-[#090d16] to-[#04060a] border-slate-800 shadow-inner'
                  : previewBg === 'light'
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 border-slate-800'
              }`}
            >
              {/* Center Preview Content */}
              <div className="relative group max-w-sm w-full flex flex-col items-center">
                {selectedLogoId === 'vector-master' ? (
                  <canvas
                    ref={vectorCanvasRef}
                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105 border border-amber-500/30"
                  />
                ) : (
                  <img
                    src={currentPreset.url}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = currentPreset.fallbackUrl;
                    }}
                    alt={currentPreset.nameEn}
                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105 border border-amber-500/30"
                  />
                )}

                {/* Subtitle badge in preview */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 text-amber-300 border border-amber-500/40 shadow-md">
                    {isHi ? currentPreset.nameHi : currentPreset.nameEn}
                  </span>
                </div>
              </div>
            </div>

            {/* Mockup Previews Selector (App Header, Letterhead, ID Card) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isHi ? 'वास्तविक मॉकअप प्रीव्यू (Real-world Mockups):' : 'Real-world Mockup Previews:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveMockup(activeMockup === 'appHeader' ? 'none' : 'appHeader')}
                  className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                    activeMockup === 'appHeader'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  📱 {isHi ? 'ऐप हेडर लुक' : 'App Header'}
                </button>
                <button
                  onClick={() => setActiveMockup(activeMockup === 'letterhead' ? 'none' : 'letterhead')}
                  className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                    activeMockup === 'letterhead'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  📜 {isHi ? 'लेटरहेड व बॉन्ड' : 'Letterhead'}
                </button>
                <button
                  onClick={() => setActiveMockup(activeMockup === 'idCard' ? 'none' : 'idCard')}
                  className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold cursor-pointer ${
                    activeMockup === 'idCard'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  🪪 {isHi ? 'स्टाफ ID कार्ड' : 'Staff ID Card'}
                </button>
              </div>

              {/* Mockup Display Box */}
              {activeMockup === 'appHeader' && (
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/40 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentPreset.url}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = currentPreset.fallbackUrl;
                      }}
                      alt="logo"
                      className="w-10 h-10 rounded-lg object-contain border border-amber-500/50"
                    />
                    <div>
                      <div className="text-xs font-black text-white">{profile.companyName || 'GCAP PRIVATE LIMITED'}</div>
                      <div className="text-[10px] text-amber-400 font-medium">Secured • Govt. Registered</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">ONLINE</span>
                </div>
              )}

              {activeMockup === 'letterhead' && (
                <div className="p-4 bg-white rounded-xl border border-slate-300 text-slate-900 animate-fade-in shadow-md">
                  <div className="flex items-center justify-between border-b-2 border-amber-600 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentPreset.url}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = currentPreset.fallbackUrl;
                        }}
                        alt="logo"
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <div className="text-sm font-black text-slate-900">{profile.companyName || 'GCAP PRIVATE LIMITED'}</div>
                        <div className="text-[10px] text-slate-600 font-mono">CIN: {profile.cin || 'U66190BR2026OPC088307'}</div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-medium">
                      SASARAM, BIHAR - 821115
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 italic mt-2 text-center">
                    Official Corporate Letterhead Preview
                  </div>
                </div>
              )}

              {activeMockup === 'idCard' && (
                <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-xl border border-slate-700 animate-fade-in max-w-xs mx-auto text-center shadow-lg">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-amber-400 p-1 bg-black">
                    <img
                      src={currentPreset.url}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = currentPreset.fallbackUrl;
                      }}
                      alt="logo"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div className="text-xs font-black text-white">{profile.companyName || 'GCAP PRIVATE LIMITED'}</div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase mt-0.5">DIRECTOR / EXECUTIVE</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">ID: GCAP-DIR-001</div>
                </div>
              )}
            </div>

            {/* DOWNLOAD CONFIGURATION SECTION */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              
              {/* Format Toggle (PNG vs JPEG) */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  1. {isHi ? 'फॉर्मेट चुनें (PNG या JPEG):' : 'Select Format (PNG or JPEG):'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDownloadFormat('png')}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      downloadFormat === 'png'
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileImage className={`w-5 h-5 ${downloadFormat === 'png' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <div className="text-left">
                        <div className="text-sm font-black">PNG Format</div>
                        <div className="text-[10px] text-slate-400">
                          {isHi ? 'क्रिस्टल क्लियर लॉसलेस' : 'Crystal Lossless'}
                        </div>
                      </div>
                    </div>
                    {downloadFormat === 'png' && <CheckCircle className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => setDownloadFormat('jpeg')}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      downloadFormat === 'jpeg'
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ImageIcon className={`w-5 h-5 ${downloadFormat === 'jpeg' ? 'text-amber-400' : 'text-slate-500'}`} />
                      <div className="text-left">
                        <div className="text-sm font-black">JPEG / JPG Format</div>
                        <div className="text-[10px] text-slate-400">
                          {isHi ? '100% प्रिंट क्वालिटी' : '100% Print Ultra'}
                        </div>
                      </div>
                    </div>
                    {downloadFormat === 'jpeg' && <CheckCircle className="w-4 h-4 text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* Size Selection (Standard Sizes & Custom) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. {isHi ? 'साइज चुनें (Resolution):' : 'Select Size (Resolution):'}
                  </label>
                  <button
                    onClick={() => setIsCustomSize(!isCustomSize)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    {isCustomSize
                      ? isHi ? 'मानक साइज सूची देखें' : 'View Standard Sizes'
                      : isHi ? '+ कस्टम साइज दर्ज करें' : '+ Custom Size'}
                  </button>
                </div>

                {!isCustomSize ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STANDARD_SIZES.map((sz) => {
                      const isChosen = selectedSize === sz.width;
                      return (
                        <button
                          key={sz.label}
                          onClick={() => setSelectedSize(sz.width)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isChosen
                              ? 'bg-amber-500/20 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">{sz.label}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded font-mono ${
                              isChosen ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {sz.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 truncate">
                            {sz.use}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">
                          {isHi ? 'चौड़ाई (Width in px)' : 'Width (px)'}
                        </label>
                        <input
                          type="number"
                          min={64}
                          max={5000}
                          value={customWidth}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 512;
                            setCustomWidth(val);
                            if (lockAspectRatio) setCustomHeight(val);
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">
                          {isHi ? 'ऊंचाई (Height in px)' : 'Height (px)'}
                        </label>
                        <input
                          type="number"
                          min={64}
                          max={5000}
                          value={customHeight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 512;
                            setCustomHeight(val);
                            if (lockAspectRatio) setCustomWidth(val);
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockAspectRatio}
                        onChange={(e) => setLockAspectRatio(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span>{isHi ? '1:1 आस्पेक्ट रेशियो लॉक रखें (स्क्वायर लोगो)' : 'Lock 1:1 Aspect Ratio (Square)'}</span>
                    </label>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS: Download Now & Quick Grid */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleDownloadLogo()}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span>
                    {isHi
                      ? `डाउनलोड करें: ${isCustomSize ? `${customWidth}x${customHeight}` : `${selectedSize}x${selectedSize}`} px (${downloadFormat.toUpperCase()})`
                      : `Download: ${isCustomSize ? `${customWidth}x${customHeight}` : `${selectedSize}x${selectedSize}`} px (${downloadFormat.toUpperCase()})`}
                  </span>
                </button>

                {/* Quick 1-Click Download Matrix Buttons */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 text-center">
                    {isHi ? 'त्वरित 1-क्लिक डाउनलोड बटन्स:' : 'Quick 1-Click Downloads:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      onClick={() => handleDownloadLogo(512, 512, 'png')}
                      className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3 text-amber-400" />
                      <span>512px PNG</span>
                    </button>
                    <button
                      onClick={() => handleDownloadLogo(512, 512, 'jpeg')}
                      className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3 text-amber-400" />
                      <span>512px JPG</span>
                    </button>
                    <button
                      onClick={() => handleDownloadLogo(1024, 1024, 'png')}
                      className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3 text-amber-400" />
                      <span>1K HD PNG</span>
                    </button>
                    <button
                      onClick={() => handleDownloadLogo(2048, 2048, 'jpeg')}
                      className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3 text-amber-400" />
                      <span>2K JPG</span>
                    </button>
                  </div>
                </div>

                {/* Secondary tools: Copy to clipboard */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    onClick={handleCopyImage}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? (isHi ? 'क्लिपबोर्ड पर कॉपी हुआ!' : 'Copied to Clipboard!') : (isHi ? 'लोगो कॉपी करें' : 'Copy Logo')}</span>
                  </button>
                  <span className="text-slate-700">•</span>
                  <a
                    href={currentPreset.url || currentPreset.fallbackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center gap-1.5 py-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isHi ? 'फुल साइज नया टैब' : 'Open Full HD View'}</span>
                  </a>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
