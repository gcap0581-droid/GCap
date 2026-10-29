import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Sparkles,
  MoreHorizontal,
  Bell,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Volume2,
  Video
} from 'lucide-react';
import { PRIMARY_COMPANY_LOGO } from '../utils/logoAssets';

interface YouTubeNativeActionBarProps {
  channelUrl?: string;
  videoUrl?: string;
  videoTitle?: string;
  channelName?: string;
  subscribersCount?: string;
  initialLikes?: number;
  initialViews?: string;
  isHi?: boolean;
  onOpenStudio?: () => void;
  className?: string;
}

export const YouTubeNativeActionBar: React.FC<YouTubeNativeActionBarProps> = ({
  channelUrl = 'https://www.youtube.com/@GCapOfficial',
  videoUrl = 'https://www.youtube.com/@GCapOfficial',
  videoTitle = 'GCap OPC Private Limited - Official Plan & 6-Hour Return Guide',
  channelName = 'GCap Official',
  subscribersCount = '12.5K subscribers',
  initialLikes = 3742,
  initialViews = '6.6 lakh views',
  isHi = true,
  onOpenStudio,
  className = '',
}) => {
  // Subscribe state persisted in localStorage
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gcap_yt_subscribed') === 'true';
    } catch {
      return false;
    }
  });

  // Like state & count persisted in localStorage
  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gcap_yt_liked') === 'true';
    } catch {
      return false;
    }
  });

  const [hasDisliked, setHasDisliked] = useState<boolean>(false);

  const [likeCount, setLikeCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gcap_yt_like_count');
      return saved ? parseInt(saved, 10) : initialLikes;
    } catch {
      return initialLikes;
    }
  });

  // Action feedback toasts
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleSubscribeToggle = () => {
    const nextSubState = !isSubscribed;
    setIsSubscribed(nextSubState);
    try {
      localStorage.setItem('gcap_yt_subscribed', String(nextSubState));
    } catch {}

    if (nextSubState) {
      triggerToast(isHi ? '🎉 धन्यवाद! आप यूट्यूब चैनल से जुड़ गए हैं (Subscribed)!' : '🎉 Subscribed to GCap Official!');
      // Open YouTube channel with ?sub_confirmation=1 in new tab for official account confirmation
      const subUrl = channelUrl.includes('?') ? `${channelUrl}&sub_confirmation=1` : `${channelUrl}?sub_confirmation=1`;
      window.open(subUrl, '_blank', 'noopener,noreferrer');
    } else {
      triggerToast(isHi ? 'Unsubscribed' : 'Unsubscribed');
    }
  };

  const handleLikeToggle = () => {
    if (hasLiked) {
      setHasLiked(false);
      const newCount = likeCount - 1;
      setLikeCount(newCount);
      try {
        localStorage.setItem('gcap_yt_liked', 'false');
        localStorage.setItem('gcap_yt_like_count', String(newCount));
      } catch {}
      triggerToast(isHi ? 'लाइक हटाया गया' : 'Like removed');
    } else {
      setHasLiked(true);
      setHasDisliked(false);
      const newCount = likeCount + 1;
      setLikeCount(newCount);
      try {
        localStorage.setItem('gcap_yt_liked', 'true');
        localStorage.setItem('gcap_yt_like_count', String(newCount));
      } catch {}
      triggerToast(isHi ? '👍 वीडियो लाइक करने के लिए धन्यवाद! (3.7K+ Likes)' : '👍 Liked! Thanks for supporting GCap!');
    }
  };

  const handleDislikeToggle = () => {
    if (hasDisliked) {
      setHasDisliked(false);
    } else {
      setHasDisliked(true);
      if (hasLiked) {
        setHasLiked(false);
        const newCount = likeCount - 1;
        setLikeCount(newCount);
        try {
          localStorage.setItem('gcap_yt_liked', 'false');
          localStorage.setItem('gcap_yt_like_count', String(newCount));
        } catch {}
      }
      triggerToast(isHi ? 'आपकी प्रतिक्रिया सबमिट हो गई है' : 'Feedback submitted');
    }
  };

  const handleShare = () => {
    const shareData = {
      title: 'GCap Official YouTube Channel',
      text: `${videoTitle}\nGCap (OPC) Private Limited Official Video`,
      url: videoUrl || channelUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share(shareData)
        .then(() => triggerToast(isHi ? '📲 शेयर कर दिया गया!' : '📲 Shared successfully!'))
        .catch(() => copyLinkFallback());
    } else {
      copyLinkFallback();
    }
  };

  const copyLinkFallback = () => {
    try {
      navigator.clipboard.writeText(videoUrl || channelUrl);
      setCopied(true);
      triggerToast(isHi ? '📋 व्हाट्सएप और सोशल मीडिया शेयर के लिए लिंक कॉपी हो गया!' : '📋 Link copied for WhatsApp sharing!');
      setTimeout(() => setCopied(false), 3000);
    } catch {}
  };

  // Format like count display e.g. 3.7K
  const formatLikes = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className={`bg-slate-950/95 border border-slate-800 rounded-2xl p-3 sm:p-4 text-white shadow-xl space-y-3 font-sans relative ${className}`}>
      {/* Toast Notification Popup */}
      {toastMsg && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-200 border border-amber-300 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 fill-slate-950" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Video Title & Quick Stats */}
      <div className="space-y-1 border-b border-slate-800/80 pb-2.5">
        <h4 className="font-extrabold text-sm sm:text-base text-white line-clamp-2 leading-snug">
          {videoTitle}
        </h4>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap font-mono">
          <span className="font-bold text-amber-400">@{channelName.replace(/\s+/g, '')}</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">{formatLikes(likeCount)} likes</span>
          <span>•</span>
          <span>{initialViews}</span>
          <span>•</span>
          <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px]">
            MCA Official
          </span>
        </div>

        {/* Informational Callout Badge about YouTube Subscribe & Notification Bell */}
        <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
          <Bell className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-bold text-white block">
              {isHi ? '📌 यूट्यूब सब्सक्राइब व नोटिफिकेशन बेल जानकारी:' : '📌 YouTube Subscribe & Notification Bell Info:'}
            </span>
            <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
              {isHi
                ? 'जब आप अपने खुद के गूगल/यूट्यूब खाते (@GCapOPCPrivateLimited) से लॉग इन करके अपना वीडियो देखते हैं, तो यूट्यूब Subscribe बटन छिपा देता है (क्योंकि आप खुद को सब्सक्राइब नहीं कर सकते)। लेकिन जब भी कोई निवेशक, ग्राहक या दर्शक आपका वीडियो देखेगा, तो उसे नीचे की तरह "Subscribe 🔔" और घंटी का बटन 100% दिखाई देगा!'
                : 'When viewing your video logged into your own YouTube channel, YouTube hides the Subscribe button. For all other visitors, YouTube displays the Subscribe & Bell Notification button prominently!'}
            </p>
          </div>
        </div>
      </div>

      {/* Main YouTube Native Action Bar (Matching Mobile Screenshot) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        
        {/* Left: Channel Logo Avatar + Channel Name + Subscribe Pill */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 border-2 border-red-500/80 p-0.5 overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <img
                src={PRIMARY_COMPANY_LOGO}
                alt={channelName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors">
                  {channelName}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 fill-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                {subscribersCount}
              </span>
            </div>
          </a>

          {/* Native YouTube White Subscribe Button with Bell & Direct Auto-Subscribe Confirmation */}
          <button
            onClick={handleSubscribeToggle}
            className={`px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm transition-all cursor-pointer shadow-lg flex items-center gap-1.5 active:scale-95 shrink-0 ${
              isSubscribed
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-white hover:bg-slate-200 text-slate-950 shadow-white/10'
            }`}
            title={isHi ? 'यूट्यूब चैनल सब्सक्राइब व बेल नोटिफिकेशन चालू करें' : 'Subscribe & Turn on Bell Notifications'}
          >
            <Bell className={`w-4 h-4 ${isSubscribed ? 'text-amber-400 fill-amber-400' : 'text-slate-900 fill-slate-900 animate-bounce'}`} />
            <span>{isSubscribed ? (isHi ? 'Subscribed ✓' : 'Subscribed ✓') : (isHi ? 'Subscribe 🔔' : 'Subscribe 🔔')}</span>
          </button>
        </div>

        {/* Right: Horizontal Pill Action Row (Like / Dislike, Share, Remix/Studio, More) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none justify-start sm:justify-end">
          
          {/* Segmented Like / Dislike Pill */}
          <div className="flex items-center bg-slate-800/90 hover:bg-slate-800 rounded-full border border-slate-700/80 p-0.5 shrink-0 shadow-sm">
            <button
              onClick={handleLikeToggle}
              className={`px-3 py-1.5 rounded-l-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasLiked ? 'text-amber-400' : 'text-slate-200 hover:text-white'
              }`}
              title={isHi ? 'वीडियो लाइक करें' : 'Like video'}
            >
              <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{formatLikes(likeCount)}</span>
            </button>

            <div className="w-[1px] h-4 bg-slate-700/80"></div>

            <button
              onClick={handleDislikeToggle}
              className={`px-2.5 py-1.5 rounded-r-full text-xs font-bold flex items-center transition-colors cursor-pointer ${
                hasDisliked ? 'text-red-400' : 'text-slate-200 hover:text-white'
              }`}
              title={isHi ? 'डिसलाइक' : 'Dislike'}
            >
              <ThumbsDown className={`w-4 h-4 ${hasDisliked ? 'fill-red-400 text-red-400' : ''}`} />
            </button>
          </div>

          {/* Share Pill Button */}
          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
            title={isHi ? 'शेयर करें' : 'Share Video'}
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>{copied ? (isHi ? 'कॉपी हुआ!' : 'Copied!') : (isHi ? 'Share' : 'Share')}</span>
          </button>

          {/* Remix / Studio Sparkle Button */}
          {onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/40 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
              title={isHi ? '7-सीन प्रोमो वीडियो स्टूडियो' : '7-Scene Promo Video Studio'}
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{isHi ? 'Remix / Studio' : 'Remix / Studio'}</span>
            </button>
          )}

          {/* More Options Dropdown Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-sm"
              title={isHi ? 'अधिक विकल्प' : 'More Options'}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Popup */}
            {showMoreMenu && (
              <div className="absolute right-0 bottom-10 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-40 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-2 border-b border-slate-800 text-slate-400 font-bold">
                  <span>{isHi ? 'यूट्यूब वीडियो विकल्प' : 'YouTube Video Options'}</span>
                  <button onClick={() => setShowMoreMenu(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <a
                  href={channelUrl.includes('?') ? `${channelUrl}&sub_confirmation=1` : `${channelUrl}?sub_confirmation=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-white transition-colors"
                >
                  <Bell className="w-4 h-4 text-red-500" />
                  <span>{isHi ? '🔴 यूट्यूब पर चैनल सब्सक्राइब करें' : '🔴 Open Channel & Subscribe'}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
                </a>

                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    copyLinkFallback();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 text-white transition-colors text-left"
                >
                  <Copy className="w-4 h-4 text-sky-400" />
                  <span>{isHi ? '📋 वीडियो लिंक कॉपी करें' : '📋 Copy Video Link'}</span>
                </button>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>MCA Govt of India Registered</span>
                  </div>
                  <p>CIN: U66190BR2026OPC088307</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
