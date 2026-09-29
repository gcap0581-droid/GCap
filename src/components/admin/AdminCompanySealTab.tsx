import React, { useState, useRef, useEffect } from 'react';
import {
  Award,
  Download,
  Printer,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Building2,
  FileText,
  ShieldCheck,
  Palette,
  Eye,
  Sliders,
  Feather,
} from 'lucide-react';
import { getStoredCompanyProfile } from '../../utils/companyStorage';
import { Language } from '../../types';

interface AdminCompanySealTabProps {
  language?: Language;
  onSwitchToLogoTab?: () => void;
}

export const AdminCompanySealTab: React.FC<AdminCompanySealTabProps> = ({ language = 'hi', onSwitchToLogoTab }) => {
  const isHi = language === 'hi';
  const profile = getStoredCompanyProfile();

  // Form Controls for Seal Customization
  const [companyName, setCompanyName] = useState(profile.companyName || 'GCAP PRIVATE LIMITED');
  const [cinNumber, setCinNumber] = useState(profile.cin || 'U66190BR2026OPC088307');
  const [locationText, setLocationText] = useState(profile.sealCity || 'SASARAM (BIHAR)');

  // Auto-sanitize on mount if stale data exists in local state
  useEffect(() => {
    if (companyName.includes('ASSETS & WEALTH MANAGEMENT')) {
      setCompanyName('GCAP PRIVATE LIMITED');
    }
  }, []);
  const [directorTitle, setDirectorTitle] = useState('DIRECTOR / AUTHORIZED SIGNATORY');
  const [directorName, setDirectorName] = useState('AMIT KUMAR');

  // Design Settings
  const [stampColor, setStampColor] = useState<'PURPLE' | 'BLUE' | 'RED' | 'BLACK'>('PURPLE');
  const [includeGrunge, setIncludeGrunge] = useState(true);
  const [activeTab, setActiveTab] = useState<'ROUND' | 'RECTANGLE' | 'COMBINED'>('ROUND');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Color Mapping
  const getColorHex = (c: 'PURPLE' | 'BLUE' | 'RED' | 'BLACK') => {
    switch (c) {
      case 'PURPLE':
        return '#4c1d95'; // Deep violet stamp ink
      case 'BLUE':
        return '#1e3a8a'; // Royal blue stamp ink
      case 'RED':
        return '#b91c1c'; // Official crimson red
      case 'BLACK':
        return '#18181b'; // Charcoal black
    }
  };

  const drawSealOnCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mainColor = getColorHex(stampColor);

    if (activeTab === 'ROUND') {
      // 500x500 Canvas for Crisp HD Round Seal
      canvas.width = 600;
      canvas.height = 600;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = 300;
      const centerY = 300;
      const outerRadius = 260;
      const innerRadius1 = 245;
      const innerRadius2 = 175;
      const centerRadius = 160;

      ctx.save();
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = mainColor;

      // Outer Thick Border Ring
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Thin Border Ring
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius1, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Border Ring
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius2, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Thin Circle
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Curved Text: Top (Company Name)
      ctx.font = 'bold 22px "Trebuchet MS", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const topText = companyName.toUpperCase();
      const topRadius = (innerRadius1 + innerRadius2) / 2;
      const angleStep = Math.PI / (topText.length + 3);
      const startAngle = -Math.PI / 2 - (angleStep * (topText.length - 1)) / 2;

      for (let i = 0; i < topText.length; i++) {
        const char = topText[i];
        const angle = startAngle + i * angleStep;
        ctx.save();
        ctx.translate(centerX + topRadius * Math.cos(angle), centerY + topRadius * Math.sin(angle));
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      // Curved Text: Bottom (Location & CIN)
      const bottomText = `★ ${locationText.toUpperCase()} ★ CIN: ${cinNumber.toUpperCase()}`;
      const bottomRadius = (innerRadius1 + innerRadius2) / 2;
      const bAngleStep = Math.PI / (bottomText.length + 4);
      const bStartAngle = Math.PI / 2 + (bAngleStep * (bottomText.length - 1)) / 2;

      ctx.font = 'bold 17px "Trebuchet MS", Arial, sans-serif';

      for (let i = 0; i < bottomText.length; i++) {
        const char = bottomText[i];
        const angle = bStartAngle - i * bAngleStep;
        ctx.save();
        ctx.translate(centerX + bottomRadius * Math.cos(angle), centerY + bottomRadius * Math.sin(angle));
        ctx.rotate(angle - Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      // Center Emblem / Text
      ctx.font = 'bold 28px "Arial Black", Gadget, sans-serif';
      ctx.fillText('GCAP', centerX, centerY - 45);

      // Star Divider
      ctx.font = '22px Arial';
      ctx.fillText('★ ★ ★', centerX, centerY - 15);

      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('CORPORATE SEAL', centerX, centerY + 15);

      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText('REGISTERED COMPANY', centerX, centerY + 42);

      // Rubber Stamp Ink Distress Noise Effect
      if (includeGrunge) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        for (let i = 0; i < 900; i++) {
          const rx = Math.random() * 600;
          const ry = Math.random() * 600;
          const rw = Math.random() * 2.5 + 0.5;
          ctx.fillRect(rx, ry, rw, rw);
        }
      }

      ctx.restore();
    } else if (activeTab === 'RECTANGLE') {
      // 600x300 Canvas for Rectangular Director Stamp
      canvas.width = 650;
      canvas.height = 320;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = mainColor;

      // Outer Rectangle Box
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, 610, 280);

      // Inner Border Line
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 28, 594, 264);

      // Company Line
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.textAlign = 'center';
      // Ensure the text fits by adjusting font size if necessary
      const fullCompanyName = `FOR ${companyName.toUpperCase()}`;
      ctx.font = fullCompanyName.length > 30 ? 'bold 18px Arial, sans-serif' : 'bold 22px Arial, sans-serif';
      ctx.fillText(fullCompanyName, 325, 70);

      // Signature Placeholder Box / Line
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(120, 185);
      ctx.lineTo(530, 185);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cursive Simulated Signature
      ctx.font = 'italic bold 32px "Brush Script MT", cursive, Georgia';
      ctx.fillText(directorName, 325, 170);

      // Director Designation Title
      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillText(directorTitle.toUpperCase(), 325, 225);

      // Location & CIN
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText(`${locationText} • CIN: ${cinNumber}`, 325, 260);

      // Rubber Stamp Ink Noise
      if (includeGrunge) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        for (let i = 0; i < 700; i++) {
          const rx = Math.random() * 650;
          const ry = Math.random() * 320;
          const rw = Math.random() * 2.5 + 0.5;
          ctx.fillRect(rx, ry, rw, rw);
        }
      }

      ctx.restore();
    } else {
      // Combined Set: 900x550 Canvas
      canvas.width = 950;
      canvas.height = 550;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = mainColor;

      // 1. Draw Round Seal on Left
      const centerX = 280;
      const centerY = 275;
      const outerRadius = 220;
      const innerRadius1 = 205;
      const innerRadius2 = 145;
      const centerRadius = 130;

      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Top Curved Text
      ctx.font = 'bold 18px "Trebuchet MS", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const topText = companyName.toUpperCase();
      const topRadius = (innerRadius1 + innerRadius2) / 2;
      const angleStep = Math.PI / (topText.length + 3);
      const startAngle = -Math.PI / 2 - (angleStep * (topText.length - 1)) / 2;

      for (let i = 0; i < topText.length; i++) {
        const char = topText[i];
        const angle = startAngle + i * angleStep;
        ctx.save();
        ctx.translate(centerX + topRadius * Math.cos(angle), centerY + topRadius * Math.sin(angle));
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      // Bottom Curved Text
      const bottomText = `★ ${locationText.toUpperCase()} ★ CIN: ${cinNumber.toUpperCase()}`;
      const bottomRadius = (innerRadius1 + innerRadius2) / 2;
      const bAngleStep = Math.PI / (bottomText.length + 4);
      const bStartAngle = Math.PI / 2 + (bAngleStep * (bottomText.length - 1)) / 2;

      ctx.font = 'bold 14px "Trebuchet MS", Arial, sans-serif';

      for (let i = 0; i < bottomText.length; i++) {
        const char = bottomText[i];
        const angle = bStartAngle - i * bAngleStep;
        ctx.save();
        ctx.translate(centerX + bottomRadius * Math.cos(angle), centerY + bottomRadius * Math.sin(angle));
        ctx.rotate(angle - Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      // Center
      ctx.font = 'bold 24px "Arial Black", Gadget, sans-serif';
      ctx.fillText('GCAP', centerX, centerY - 35);

      ctx.font = '18px Arial';
      ctx.fillText('★ ★ ★', centerX, centerY - 10);

      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText('CORPORATE SEAL', centerX, centerY + 15);

      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText('REGISTERED COMPANY', centerX, centerY + 38);

      // 2. Draw Rectangular Director Seal on Right
      ctx.lineWidth = 5;
      ctx.strokeRect(540, 130, 380, 290);
      ctx.lineWidth = 2;
      ctx.strokeRect(547, 137, 366, 276);

      ctx.font = 'bold 16px Arial, sans-serif';
      // Ensure the text fits by adjusting font size if necessary
      const combinedCompanyName = `FOR ${companyName.toUpperCase()}`;
      ctx.font = combinedCompanyName.length > 30 ? 'bold 13px Arial, sans-serif' : 'bold 16px Arial, sans-serif';
      ctx.fillText(combinedCompanyName, 730, 175);

      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(580, 290);
      ctx.lineTo(880, 290);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'italic bold 28px "Brush Script MT", cursive, Georgia';
      ctx.fillText(directorName, 730, 275);

      ctx.font = 'bold 17px Arial, sans-serif';
      ctx.fillText(directorTitle.toUpperCase(), 730, 325);

      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.fillText(`${locationText} • CIN: ${cinNumber}`, 730, 360);

      // Rubber Noise
      if (includeGrunge) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        for (let i = 0; i < 1100; i++) {
          const rx = Math.random() * 950;
          const ry = Math.random() * 550;
          const rw = Math.random() * 2.5 + 0.5;
          ctx.fillRect(rx, ry, rw, rw);
        }
      }

      ctx.restore();
    }
  };

  useEffect(() => {
    drawSealOnCanvas();
  }, [companyName, cinNumber, locationText, directorTitle, directorName, stampColor, includeGrunge, activeTab]);

  const handleDownloadPng = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `GCAP_OFFICIAL_SEAL_${activeTab}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setIsGenerating(false);
    }, 100);
  };

  const handleDownloadJpeg = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // JPEG requires a solid background (White)
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
      
      const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `GCAP_OFFICIAL_SEAL_${activeTab}_${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      setIsGenerating(false);
    }, 100);
  };

  const handlePrintSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>GCap Official Stamps & Seal Printable Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #fff; color: #000; }
            .header { margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; margin-top: 30px; }
            .stamp-box { border: 1px dashed #ccc; padding: 15px; border-radius: 8px; }
            img { max-width: 320px; height: auto; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>GCAP PRIVATE LIMITED</h2>
            <p>Official Corporate Seals & Director Designation Rubber Stamps</p>
          </div>
          <button class="no-print" onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 20px;">
            🖨️ Print Stamp Sheet Now
          </button>
          <div class="grid">
            <div class="stamp-box">
              <h4>Original Seal Image</h4>
              <img src="${dataUrl}" />
            </div>
            <div class="stamp-box">
              <h4>Duplicate Copy</h4>
              <img src="${dataUrl}" />
            </div>
            <div class="stamp-box">
              <h4>Archive Copy</h4>
              <img src="${dataUrl}" />
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className="w-64 h-64 text-purple-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>{isHi ? 'वैधानिक कॉर्पोरेट सील जनरेटर' : 'Legal Corporate Seal Generator'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{isHi ? 'कंपनी गोल मुहर एवं डायरेक्टर पदनाम सील डाउनलोड केंद्र' : 'Official Corporate Seals & Director Stamps'}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isHi
                ? 'यहाँ से आप GCap की लीगल गोल रबर मुहर, डायरेक्टर पदनाम सील, एवं संयुक्त कॉर्पोरेट स्टैम्प HD पारदर्शी (PNG) या सफ़ेद बैकग्राउंड (JPEG) फॉर्मेट में डाउनलोड कर सकते हैं।'
                : 'Generate and download high-resolution official seals & stamps in transparent PNG or solid JPEG formats.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadPng}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950 border border-purple-400/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isHi ? 'Download HD PNG' : 'Download PNG'}</span>
            </button>

            <button
              onClick={handleDownloadJpeg}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 border border-emerald-400/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isHi ? 'Download HD JPEG' : 'Download JPEG'}</span>
            </button>

            <button
              onClick={handlePrintSheet}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{isHi ? 'प्रिंट प्रिंटर शीट' : 'Print Sheet'}</span>
            </button>

            {onSwitchToLogoTab && (
              <button
                onClick={onSwitchToLogoTab}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isHi ? 'कंपनी HD लोगो स्टूडियो' : 'HD Logo Studio'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Controls + Live Canvas Render */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Design Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>{isHi ? 'मुहर अनुकूलन एवं डिज़ाइन' : 'Customize Seal Details'}</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/30">
              100% Real
            </span>
          </div>

          {/* Stamp Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              {isHi ? '1. मुहर का प्रकार चुनें' : '1. Select Seal Type'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('ROUND')}
                className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all ${
                  activeTab === 'ROUND'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isHi ? '⭕ गोल सील' : 'Round Seal'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('RECTANGLE')}
                className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all ${
                  activeTab === 'RECTANGLE'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isHi ? '▭ डायरेक्टर मुहर' : 'Director Stamp'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('COMBINED')}
                className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all ${
                  activeTab === 'COMBINED'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isHi ? '✨ संयुक्त सेट' : 'Combined Set'}
              </button>
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
              <span>{isHi ? '2. स्टैम्प स्याही (Ink Color)' : '2. Stamp Ink Color'}</span>
              <Palette className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStampColor('PURPLE')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all ${
                  stampColor === 'PURPLE'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-300 ring-2 ring-purple-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-purple-800 border border-purple-300 shadow-sm" />
                <span className="text-[10px]">{isHi ? 'बैंगनी (Violet)' : 'Purple'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStampColor('BLUE')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all ${
                  stampColor === 'BLUE'
                    ? 'bg-blue-950/80 border-blue-400 text-blue-300 ring-2 ring-blue-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-blue-800 border border-blue-300 shadow-sm" />
                <span className="text-[10px]">{isHi ? 'शाही नीली' : 'Royal Blue'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStampColor('RED')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all ${
                  stampColor === 'RED'
                    ? 'bg-red-950/80 border-red-400 text-red-300 ring-2 ring-red-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-red-700 border border-red-300 shadow-sm" />
                <span className="text-[10px]">{isHi ? 'गहरी लाल' : 'Crimson'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStampColor('BLACK')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-bold transition-all ${
                  stampColor === 'BLACK'
                    ? 'bg-slate-800 border-slate-400 text-slate-200 ring-2 ring-slate-400/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-500 shadow-sm" />
                <span className="text-[10px]">{isHi ? 'काली (Black)' : 'Black'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                {isHi ? 'कंपनी का पूरा नाम (Company Legal Name)' : 'Company Name'}
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {isHi ? 'CIN नंबर' : 'CIN Number'}
                </label>
                <input
                  type="text"
                  value={cinNumber}
                  onChange={(e) => setCinNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono font-bold focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  {isHi ? 'स्थान/शहर' : 'City/State'}
                </label>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                {isHi ? 'डायरेक्टर/हस्ताक्षरकर्ता का नाम' : 'Director / Signatory Name'}
              </label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                {isHi ? 'पदनाम शीर्षक (Designation Title)' : 'Designation Title'}
              </label>
              <input
                type="text"
                value={directorTitle}
                onChange={(e) => setDirectorTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Rubber Stamp Texture Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Feather className="w-3.5 h-3.5 text-purple-400" />
                <span>{isHi ? 'वास्तविक रबर स्याही टेक्सचर (Rubber Stamp Noise)' : 'Realistic Rubber Stamp Effect'}</span>
              </span>
              <input
                type="checkbox"
                checked={includeGrunge}
                onChange={(e) => setIncludeGrunge(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live High-Resolution Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>{isHi ? 'लाइव HD मुहर पूर्वावलोकन (Live High-Res Stamp Preview)' : 'Live Seal Preview'}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                Transparent Canvas Ready
              </span>
            </div>

            {/* Checkered Transparent Background Container for Canvas Preview */}
            <div className="relative w-full flex items-center justify-center p-6 rounded-xl border border-slate-800 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] min-h-[360px] overflow-x-auto">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto drop-shadow-2xl transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHi ? 'यह मुहर किसी भी डॉक्यूमेंट, एग्रीमेंट या लेटरहेड पर सीधे लगाई जा सकती है।' : 'Ready to overlay on certificates & agreements.'}</span>
              </span>
              <button
                type="button"
                onClick={handleDownloadPng}
                className="text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer text-xs"
              >
                {isHi ? 'डाउनलोड PNG' : 'Download'}
              </button>
            </div>
          </div>

          {/* Quick Legal Usage Guide Card */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-purple-300">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>{isHi ? 'लीगल एग्रीमेंट एवं सर्टिफिकेट में उपयोग की विधि:' : 'How to use this seal in legal agreements:'}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
              <li>{isHi ? 'डाउनलोड की गई PNG फाइल पारदर्शी (Transparent Background) है।' : 'The downloaded PNG has a transparent background.'}</li>
              <li>{isHi ? 'आप इसे MS Word, PDF, फ़ोटोशॉप या किसी भी एग्रीमेंट डॉक्यूमेंट पर डायरेक्ट ड्रैग करके लगा सकते हैं।' : 'Directly overlay on MS Word, PDF agreements or certificates.'}</li>
              <li>{isHi ? 'आप इस डिज़ाइन का प्रिंटआउट निकालकर रबर स्टैम्प मेकर (Stamp Shop) से असली भौतिक मुहर भी बनवा सकते हैं।' : 'Can also be printed and taken to physical rubber stamp shops.'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
