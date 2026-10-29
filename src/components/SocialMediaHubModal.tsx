import React, { useState } from 'react';
import {
  X,
  Youtube,
  Send,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Video,
  Sparkles,
  ShieldCheck,
  Globe,
  Award,
  Edit3,
  Save,
  QrCode,
  Users,
  Bell,
} from 'lucide-react';
import { CompanyProfile, UserProfile } from '../types';
import { getStoredCompanyProfile, saveStoredCompanyProfile } from '../utils/companyStorage';
import { PRIMARY_COMPANY_LOGO } from '../utils/logoAssets';

interface SocialMediaHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'hi' | 'en';
  companyProfile?: CompanyProfile;
  currentUser?: UserProfile | null;
  onOpenYouTubeStudio?: () => void;
  onSaveProfileSuccess?: () => void;
}

export const SocialMediaHubModal: React.FC<SocialMediaHubModalProps> = ({
  isOpen,
  onClose,
  language = 'hi',
  companyProfile,
  currentUser,
  onOpenYouTubeStudio,
  onSaveProfileSuccess,
}) => {
  const isHi = language === 'hi';
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF';
  const [activeProf, setActiveProf] = useState<CompanyProfile>(() => companyProfile || getStoredCompanyProfile());

  React.useEffect(() => {
    if (companyProfile) setActiveProf(companyProfile);
  }, [companyProfile]);

  React.useEffect(() => {
    const handleProfileUpdated = (e: any) => {
      if (e?.detail) setActiveProf(e.detail);
    };
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === 'gcap_corporate_company_profile_v2' || e.key === 'gcap_corporate_company_profile_v1') && e.newValue) {
        try {
          setActiveProf(JSON.parse(e.newValue));
        } catch {}
      }
    };
    const handleFirestoreUpdated = (e: any) => {
      if (e?.detail?.companyProfile) {
        setActiveProf(e.detail.companyProfile);
      }
    };
    window.addEventListener('gcap_company_profile_updated', handleProfileUpdated);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('firestore_state_updated', handleFirestoreUpdated);
    return () => {
      window.removeEventListener('gcap_company_profile_updated', handleProfileUpdated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('firestore_state_updated', handleFirestoreUpdated);
    };
  }, []);

  const prof = activeProf;

  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form state for admin editing social handles
  const [formData, setFormData] = useState({
    youtubeUrl: prof.youtubeUrl || 'https://www.youtube.com/@GCapOfficial',
    telegramUrl: prof.telegramUrl || 'https://t.me/gcapofficial',
    whatsappGroupUrl: prof.whatsappGroupUrl || 'https://chat.whatsapp.com/GCapOfficialCommunity',
    facebookUrl: prof.facebookUrl || 'https://facebook.com/gcapofficial',
    instagramUrl: prof.instagramUrl || 'https://instagram.com/gcapofficial',
    twitterUrl: prof.twitterUrl || 'https://twitter.com/gcapofficial',
    linkedinUrl: prof.linkedinUrl || 'https://linkedin.com/company/gcapofficial',
  });

  React.useEffect(() => {
    setFormData({
      youtubeUrl: prof.youtubeUrl || 'https://www.youtube.com/@GCapOfficial',
      telegramUrl: prof.telegramUrl || 'https://t.me/gcapofficial',
      whatsappGroupUrl: prof.whatsappGroupUrl || 'https://chat.whatsapp.com/GCapOfficialCommunity',
      facebookUrl: prof.facebookUrl || 'https://facebook.com/gcapofficial',
      instagramUrl: prof.instagramUrl || 'https://instagram.com/gcapofficial',
      twitterUrl: prof.twitterUrl || 'https://twitter.com/gcapofficial',
      linkedinUrl: prof.linkedinUrl || 'https://linkedin.com/company/gcapofficial',
    });
  }, [prof]);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSaveSocialLinks = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedProfile: CompanyProfile = {
        ...prof,
        ...formData,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredCompanyProfile(updatedProfile);
      setActiveProf(updatedProfile);
      setIsEditing(false);
      if (onSaveProfileSuccess) onSaveProfileSuccess();
    } catch (err) {
      console.log('Failed to save social links:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const youtubeChannelUrl = prof.youtubeUrl || 'https://www.youtube.com/@GCapOfficial';
  const telegramChannelUrl = prof.telegramUrl || 'https://t.me/gcapofficial';
  const whatsappCommunityUrl = prof.whatsappGroupUrl || 'https://chat.whatsapp.com/GCapOfficialCommunity';
  const facebookPageUrl = prof.facebookUrl || 'https://facebook.com/gcapofficial';
  const instagramPageUrl = prof.instagramUrl || 'https://instagram.com/gcapofficial';
  const twitterPageUrl = prof.twitterUrl || 'https://twitter.com/gcapofficial';
  const linkedinPageUrl = prof.linkedinUrl || 'https://linkedin.com/company/gcapofficial';

  const socialPlatforms = [
    {
      id: 'youtube',
      name: isHi ? 'यूट्यूब आधिकारिक चैनल (YouTube Channel)' : 'Official YouTube Channel',
      handle: '@GCapOfficial',
      url: youtubeChannelUrl,
      icon: Youtube,
      color: 'from-red-600 to-rose-700',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      description: isHi
        ? 'जीकैप के आधिकारिक वीडियो, निवेश प्लान गाइड, 6-घंटे रिटर्न ट्यूटोरियल और यूट्यूब प्रोमो वीडियो।'
        : 'Official GCap promotional videos, investment plan tutorials, and 6-hour cycle guides.',
      subscribers: '12.5K Subscribers',
      actionText: isHi ? 'यूट्यूब पर देखें व सब्सक्राइब करें' : 'Subscribe on YouTube',
    },
    {
      id: 'telegram',
      name: isHi ? 'टेलीग्राम आधिकारिक चैनल (Telegram Channel)' : 'Official Telegram Channel',
      handle: 't.me/gcapofficial',
      url: telegramChannelUrl,
      icon: Send,
      color: 'from-sky-500 to-blue-600',
      badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      description: isHi
        ? 'दैनिक रिटर्न पेआउट अलर्ट, कंपनी अपडेट्स और लाइव कम्युनिटी डिस्कशंस के लिए जुड़ें।'
        : 'Join for daily payout alerts, company updates, and live community discussions.',
      subscribers: '24.8K Members',
      actionText: isHi ? 'टेलीग्राम चैनल से जुड़ें' : 'Join Telegram Channel',
    },
    {
      id: 'whatsapp',
      name: isHi ? 'व्हाट्सएप कम्युनिटी व सपोर्ट (WhatsApp Community)' : 'WhatsApp Community & Support',
      handle: '+91 8603504808',
      url: whatsappCommunityUrl,
      icon: MessageSquare,
      color: 'from-emerald-500 to-green-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: isHi
        ? 'आधिकारिक व्हाट्सएप ग्रुप और 24x7 सपोर्ट हेल्पलाइन से जुड़कर त्वरित जानकारी प्राप्त करें।'
        : 'Connect with official WhatsApp group and 24x7 support helpline for quick updates.',
      subscribers: 'Active Community',
      actionText: isHi ? 'व्हाट्सएप ग्रुप जॉइन करें' : 'Join WhatsApp Group',
    },
    {
      id: 'facebook',
      name: isHi ? 'फेसबुक कॉर्पोरेट पेज (Facebook Page)' : 'Official Facebook Page',
      handle: 'facebook.com/gcapofficial',
      url: facebookPageUrl,
      icon: Facebook,
      color: 'from-blue-600 to-indigo-700',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      description: isHi
        ? 'कंपनी की कॉर्पोरेट घोषणाएं, MCA रजिस्ट्रेशन अपडेट्स और निवेशकों की सफलता गाथाएं।'
        : 'Corporate announcements, MCA compliance updates, and investor stories.',
      subscribers: '18K Followers',
      actionText: isHi ? 'फेसबुक पेज फॉलो करें' : 'Follow Facebook Page',
    },
    {
      id: 'instagram',
      name: isHi ? 'इंस्टाग्राम ऑफिशियल प्रोफाइल (Instagram)' : 'Official Instagram',
      handle: '@gcapofficial',
      url: instagramPageUrl,
      icon: Instagram,
      color: 'from-pink-500 via-rose-500 to-purple-600',
      badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      description: isHi
        ? 'शॉर्ट इंफॉर्मेटिव रील्स, डेली पेआउट स्क्रीनशॉट्स और लेटेस्ट बिजनेस हाइलाइट्स।'
        : 'Informative reels, daily payout highlights, and business updates.',
      subscribers: '15.2K Followers',
      actionText: isHi ? 'इंस्टाग्राम पर फॉलो करें' : 'Follow on Instagram',
    },
    {
      id: 'twitter',
      name: isHi ? 'ट्विटर / X ऑफिशियल हैंडल (Twitter/X)' : 'Official Twitter / X',
      handle: '@gcapofficial',
      url: twitterPageUrl,
      icon: Twitter,
      color: 'from-slate-700 to-slate-900',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      description: isHi
        ? 'आधिकारिक प्रेस रिलीज, स्टार्ट-अप इंडिया अपडेट्स और कॉर्पोरेट नोटिस।'
        : 'Official press releases, Startup India updates, and corporate notices.',
      subscribers: '8.4K Followers',
      actionText: isHi ? 'X (ट्विटर) पर फॉलो करें' : 'Follow on X',
    },
    {
      id: 'linkedin',
      name: isHi ? 'लिंक्डइन कॉर्पोरेट प्रोफाइल (LinkedIn Page)' : 'Corporate LinkedIn Page',
      handle: 'linkedin.com/company/gcapofficial',
      url: linkedinPageUrl,
      icon: Linkedin,
      color: 'from-blue-700 to-cyan-800',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      description: isHi
        ? 'डायरेक्टर DIN वेरिफिकेशन, प्रोफेशनल प्रोफाइल और कॉर्पोरेट नेटवर्किंग।'
        : 'Director DIN verification, professional profile, and corporate credentials.',
      subscribers: 'Corporate Profile',
      actionText: isHi ? 'लिंक्डइन पर जुड़ें' : 'Connect on LinkedIn',
    },
  ].filter((p) => {
    if (p.id === 'youtube' && prof.showYoutube === false) return false;
    if (p.id === 'telegram' && prof.showTelegram === false) return false;
    if (p.id === 'whatsapp' && prof.showWhatsapp === false) return false;
    if (p.id === 'facebook' && prof.showFacebook === false) return false;
    if (p.id === 'instagram' && prof.showInstagram === false) return false;
    if (p.id === 'twitter' && prof.showTwitter === false) return false;
    if (p.id === 'linkedin' && prof.showLinkedin === false) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/80 text-white overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Banner */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-red-950 via-slate-950 to-slate-900 border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                <Youtube className="w-7 h-7 text-red-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {isHi ? 'जीकैप यूट्यूब व सोशल मीडिया हब' : 'GCap YouTube & Social Media Hub'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {isHi ? 'आधिकारिक कम्युनिटी' : 'Official Hub'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {isHi
                  ? 'हमारे आधिकारिक यूट्यूब चैनल, टेलीग्राम, व्हाट्सएप और सभी सोशल मीडिया हैंडल से सीधे जुड़ें।'
                  : 'Connect directly with our official YouTube channel, Telegram, WhatsApp, and social profiles.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title={isHi ? 'सोशल लिंक एडिट करें' : 'Edit Social Links'}
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">{isHi ? 'एडिट करें' : 'Edit Links'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">

          {/* Admin Social Link Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveSocialLinks} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    {isHi ? 'सोशल मीडिया और यूट्यूब लिंक्स अपडेट करें' : 'Update Social Media & YouTube Links'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">YouTube Channel URL:</label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    placeholder="https://www.youtube.com/@GCapOfficial"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Telegram Channel URL:</label>
                  <input
                    type="url"
                    value={formData.telegramUrl}
                    onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://t.me/gcapofficial"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">WhatsApp Group / Community URL:</label>
                  <input
                    type="url"
                    value={formData.whatsappGroupUrl}
                    onChange={(e) => setFormData({ ...formData, whatsappGroupUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="https://chat.whatsapp.com/..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Facebook Page URL:</label>
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://facebook.com/gcapofficial"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Instagram Profile URL:</label>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                    placeholder="https://instagram.com/gcapofficial"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Twitter / X Handle URL:</label>
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-500"
                    placeholder="https://twitter.com/gcapofficial"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? (isHi ? 'सेव हो रहा है...' : 'Saving...') : (isHi ? 'लिंक्स सुरक्षित करें' : 'Save All Links')}</span>
                </button>
              </div>
            </form>
          )}

          {/* Featured YouTube Channel Hero Section */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-950 via-slate-950 to-amber-950 border border-red-500/40 p-5 sm:p-7 shadow-xl space-y-4">
            {prof.featuredVideoUrl && (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-red-500/30">
                <iframe
                  className="w-full h-full"
                  src={prof.featuredVideoUrl.replace('watch?v=', 'embed/')}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              
              <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-600/20 border-2 border-red-500/50 p-1 shrink-0 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <img
                    src={PRIMARY_COMPANY_LOGO}
                    alt="GCap Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-red-500 font-extrabold text-xs uppercase tracking-widest flex items-center gap-1">
                      <Youtube className="w-4 h-4 inline" /> YouTube Channel
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      MCA Registered
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {prof.companyName || 'GCap OPC Private Limited'} (Official)
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                    {isHi
                      ? 'भारत सरकार के कॉर्पोरेट कार्य मंत्रालय (MCA) द्वारा पंजीकृत आधिकारिक यूट्यूब चैनल। हर 6 घंटे में दैनिक रिटर्न, प्लान ट्यूटोरियल्स और लीगल सर्टिफिकेट्स देखें।'
                      : 'Official YouTube channel registered under MCA Govt of India. Watch 6-hour daily return tutorials, investment plans, and corporate updates.'}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3 justify-center md:justify-start text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Users className="w-3.5 h-3.5 text-red-400" /> 12.5K+ Subscribers
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> CIN: {prof.cin || 'U66190BR2026OPC088307'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Channel Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                <a
                  href={youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition-all hover:scale-[1.02] active:scale-95 text-center cursor-pointer"
                >
                  <Youtube className="w-5 h-5 fill-white" />
                  <span>{isHi ? 'चैनल पर जाएँ और सब्सक्राइब करें' : 'Visit & Subscribe Channel'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {onOpenYouTubeStudio && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenYouTubeStudio();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>{isHi ? '🎥 7-सीन प्रोमो वीडियो स्टूडियो' : '🎥 7-Scene Promo Video Studio'}</span>
                  </button>
                )}

                <button
                  onClick={() => handleCopy(youtubeChannelUrl, 'youtube')}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {copiedLink === 'youtube' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{isHi ? 'लिंक कॉपी हो गया!' : 'Link Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isHi ? 'चैनल लिंक कॉपी करें' : 'Copy Channel Link'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* Social Platforms Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <span>{isHi ? 'सभी आधिकारिक सोशल मीडिया चैनल्स' : 'All Official Social Media Channels'}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {isHi ? '100% सत्यापित एवं सुरक्षित लिंक्स' : '100% Verified & Authentic Handles'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {socialPlatforms.map((plat) => {
                const IconComp = plat.icon;
                return (
                  <div
                    key={plat.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${plat.color} p-0.5 shadow-md shrink-0 flex items-center justify-center`}
                        >
                          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                            <IconComp className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                            {plat.name}
                          </h4>
                          <span className="text-xs font-mono text-slate-400 block">{plat.handle}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${plat.badgeColor}`}>
                        {plat.subscribers}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{plat.description}</p>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                      <a
                        href={plat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/80 transition-all cursor-pointer"
                      >
                        <span>{plat.actionText}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>

                      <button
                        onClick={() => handleCopy(plat.url, plat.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors cursor-pointer"
                        title={isHi ? 'लिंक कॉपी करें' : 'Copy Link'}
                      >
                        {copiedLink === plat.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corporate Helpline & Verification Footer */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block">
                  {prof.companyName || 'GCap OPC Private Limited'}
                </span>
                <span>
                  {isHi
                    ? `पंजीकृत कार्यालय: ${prof.registeredAddress || 'सासाराम, बिहार - 821113'}`
                    : `Registered Office: ${prof.registeredAddress || 'Sasaram, Bihar - 821113'}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-amber-300">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>{prof.supportPhone || '+91 8603504808'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
