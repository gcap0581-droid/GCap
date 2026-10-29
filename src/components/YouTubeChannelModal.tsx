import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  MoreVertical,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ExternalLink,
  Play,
  Share2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Info,
  Globe,
  ShieldCheck,
  Check,
  Copy,
  ChevronDown,
  Clock,
  Eye,
  Film,
  Radio,
  ListVideo,
  Home as HomeIcon,
  PlusCircle,
  Tv,
  UserCheck,
  Lock,
  Unlock,
  KeyRound,
  Plus,
  Edit3,
  Trash2,
  ShieldAlert,
  Send,
  ThumbsDown,
} from 'lucide-react';
import { PRIMARY_COMPANY_LOGO } from '../utils/logoAssets';
import { YouTubeNativeActionBar } from './YouTubeNativeActionBar';
import { UserProfile } from '../types';

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  views: string;
  date: string;
  thumbnail: string;
  category: string;
  isFeatured?: boolean;
}

interface CommentItem {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  date: string;
  likes: number;
}

interface YouTubeChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'hi' | 'en';
  onOpenStudio?: () => void;
  currentUser?: UserProfile | null;
}

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'L_LUpnjgPso',
    title: 'कुंडली के 12 भावों में राहु का प्रभाव! जानिए अचूक उपाय | जीकैप ऑफिशियल गाइड',
    duration: '9:11',
    views: '8.5K',
    date: '2 days ago',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    category: 'Tutorial',
  },
  {
    id: '5qap5aO4i9A',
    title: 'GCap Registration & Account Activation Complete Step-by-Step Hindi Guide 2026',
    duration: '14:20',
    views: '18.2K',
    date: '5 days ago',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    category: 'Registration',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'How to Withdraw Payouts to PhonePe, Paytm, GooglePay & Bank IMPS in 10 Seconds',
    duration: '6:45',
    views: '24.9K',
    date: '1 week ago',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    category: 'Payouts',
  },
  {
    id: 'Y33L4J32K90',
    title: 'GCap OPC Private Limited CIN Verification on Ministry of Corporate Affairs MCA Portal',
    duration: '11:02',
    views: '32.1K',
    date: '2 weeks ago',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    category: 'Compliance',
  },
  {
    id: 'M98P2293KS0',
    title: 'Refer & Earn Unlimited Daily Passive Income - GCap Partner Program Explained',
    duration: '8:15',
    views: '15.4K',
    date: '3 weeks ago',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    category: 'Referral',
  },
];

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'c1',
    author: 'Ramesh Sharma',
    text: 'बहुत ही बेहतरीन प्लान है जीकैप का! मेरा 6-घंटे का रिटर्न डायरेक्ट बैंक में आया है।',
    date: '1 day ago',
    likes: 24,
  },
  {
    id: 'c2',
    author: 'Vikram Singh (Patna)',
    text: '100% Guaranteed Payouts. Best official channel for tutorials.',
    date: '2 days ago',
    likes: 18,
  },
  {
    id: 'c3',
    author: 'Priya Verma',
    text: 'चैनल सब्सक्राइब कर दिया है 🔔। सभी वीडियो बहुत ही ज्ञानवर्धक हैं।',
    date: '3 days ago',
    likes: 12,
  },
];

export const YouTubeChannelModal: React.FC<YouTubeChannelModalProps> = ({
  isOpen,
  onClose,
  language = 'hi',
  onOpenStudio,
  currentUser,
}) => {
  const isHi = language === 'hi';

  // Subscribed state
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gcap_yt_subscribed') === 'true';
    } catch {
      return true;
    }
  });

  // Role Security State: Owner Mode vs Client Viewer Mode
  const isAppAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF' || currentUser?.email === 'gcap0581@gmail.com';
  
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(() => {
    try {
      if (isAppAdmin) return true;
      return localStorage.getItem('gcap_yt_owner_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  // Modal drawers
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showClientNoticeModal, setShowClientNoticeModal] = useState<boolean>(false);
  const [showVideoEditModal, setShowVideoEditModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Persistent Video List Storage (Fixes data resetting issue)
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('gcap_yt_channel_videos_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_VIDEOS;
  });

  // Active playing video & Filter state
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'shorts' | 'live' | 'playlists'>('home');
  const [showBioModal, setShowBioModal] = useState<boolean>(false);
  const [showLinksModal, setShowLinksModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedShort, setSelectedShort] = useState<number | null>(null);
  const [videoFilter, setVideoFilter] = useState<'latest' | 'popular' | 'oldest'>('latest');

  // Interactive Comments state for Client Viewers
  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const saved = localStorage.getItem('gcap_yt_comments_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COMMENTS;
  });
  const [newCommentText, setNewCommentText] = useState<string>('');

  // Editing Video Form State (For Channel Owner)
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoFormData, setVideoFormData] = useState({
    id: '',
    title: '',
    duration: '10:00',
    views: '10K',
    date: 'Just now',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    category: 'Official Guide',
  });

  // Save video changes permanently in localStorage
  const saveVideosToStorage = (updatedList: VideoItem[]) => {
    setVideos(updatedList);
    try {
      localStorage.setItem('gcap_yt_channel_videos_v2', JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('gcap_yt_videos_updated', { detail: updatedList }));
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem('gcap_yt_subscribed', String(isSubscribed));
    } catch {}
  }, [isSubscribed]);

  useEffect(() => {
    try {
      localStorage.setItem('gcap_yt_comments_list', JSON.stringify(comments));
    } catch {}
  }, [comments]);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleSubscribeToggle = () => {
    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    if (nextState) {
      triggerToast(isHi ? '🔔 चैनल सब्सक्राइब हो गया! (Notifications On)' : '🔔 Subscribed to GCap Official!');
      try {
        window.open('https://www.youtube.com/@GCapOfficial?sub_confirmation=1', '_blank', 'noopener,noreferrer');
      } catch {}
    } else {
      triggerToast(isHi ? 'Unsubscribed' : 'Unsubscribed');
    }
  };

  const handleShareChannel = () => {
    const shareUrl = 'https://www.youtube.com/@GCapOfficial';
    if (navigator.share) {
      navigator
        .share({
          title: 'GCap Official YouTube Channel',
          text: 'Official YouTube Channel of GCap OPC Private Limited',
          url: shareUrl,
        })
        .catch(() => copyLink(shareUrl));
    } else {
      copyLink(shareUrl);
    }
  };

  const copyLink = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      triggerToast(isHi ? '📋 चैनल लिंक कॉपी हो गया!' : '📋 Channel link copied!');
    } catch {}
  };

  // Owner PIN Authentication Handler
  const handleVerifyOwnerPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '0581' || pinInput.trim() === 'gcap0581' || pinInput.trim() === '1234') {
      setIsOwnerUnlocked(true);
      try {
        localStorage.setItem('gcap_yt_owner_unlocked', 'true');
      } catch {}
      setShowPinModal(false);
      setShowClientNoticeModal(false);
      setPinInput('');
      setPinError(null);
      triggerToast(isHi ? '👑 चैनल मालिक मोड अनलॉक हुआ! अब आप एडिट या अपलोड कर सकते हैं।' : '👑 Channel Owner Mode Unlocked!');
    } else {
      setPinError(isHi ? 'गलत PIN! कृपया सही मालिक PIN दर्ज करें (जैसे: 0581 या gcap0581)' : 'Invalid PIN! Correct Owner PIN required.');
    }
  };

  const handleLockOwnerMode = () => {
    setIsOwnerUnlocked(false);
    try {
      localStorage.setItem('gcap_yt_owner_unlocked', 'false');
    } catch {}
    triggerToast(isHi ? '🔒 दर्शक (Client Viewer) मोड सक्रिय हुआ' : '🔒 Switched to Client Viewer Mode');
  };

  // Action guard for Upload / Edit / Delete
  const handleGuardAdminAction = (actionCallback: () => void) => {
    if (isOwnerUnlocked || isAppAdmin) {
      actionCallback();
    } else {
      setShowClientNoticeModal(true);
    }
  };

  // Add or Update Video Handler (For Owner)
  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoFormData({
      id: `custom_yt_${Date.now()}`,
      title: 'जीकैप न्यू ऑफिशियल ट्यूटोरियल व गाइड 2026',
      duration: '10:00',
      views: '1.2K',
      date: 'Just now',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      category: 'Official Guide',
    });
    setShowVideoEditModal(true);
  };

  const handleOpenEditVideo = (vid: VideoItem) => {
    setEditingVideo(vid);
    setVideoFormData({
      id: vid.id,
      title: vid.title,
      duration: vid.duration,
      views: vid.views,
      date: vid.date,
      thumbnail: vid.thumbnail,
      category: vid.category,
    });
    setShowVideoEditModal(true);
  };

  const handleSaveVideoForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.title.trim() || !videoFormData.id.trim()) {
      triggerToast(isHi ? 'कृपया शीर्षक व आईडी भरें' : 'Please fill title and ID');
      return;
    }

    let updatedList: VideoItem[];
    if (editingVideo) {
      updatedList = videos.map((v) => (v.id === editingVideo.id ? { ...v, ...videoFormData } : v));
      triggerToast(isHi ? '✅ वीडियो अपडेट हो गया!' : '✅ Video updated!');
    } else {
      const newVid: VideoItem = {
        ...videoFormData,
        isFeatured: false,
      };
      updatedList = [newVid, ...videos];
      triggerToast(isHi ? '🎉 नया वीडियो चैनल में अपलोड/जोड़ दिया गया!' : '🎉 New video uploaded!');
    }

    saveVideosToStorage(updatedList);
    setShowVideoEditModal(false);
  };

  const handleDeleteVideo = (vidId: string) => {
    if (window.confirm(isHi ? 'क्या आप इस वीडियो को चैनल से हटाना चाहते हैं?' : 'Delete this video from channel?')) {
      const updatedList = videos.filter((v) => v.id !== vidId);
      saveVideosToStorage(updatedList);
      if (activeVideoId === vidId) {
        setActiveVideoId(null);
      }
      triggerToast(isHi ? '🗑️ वीडियो चैनल से हटा दिया गया' : '🗑️ Video removed');
    }
  };

  // Client Comment Submission Handler
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `cmt_${Date.now()}`,
      author: currentUser?.name || (isHi ? 'ग्राहक / निवेशक (Client Visitor)' : 'Client Visitor'),
      text: newCommentText.trim(),
      date: 'Just now',
      likes: 1,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    triggerToast(isHi ? '💬 आपकी टिप्पणी वीडियो पर पोस्ट हो गई!' : '💬 Comment posted!');
  };

  const featuredVideo = videos[0] || DEFAULT_VIDEOS[0];

  // Shorts list vertical aspect ratio
  const shortsList = [
    {
      id: 1,
      title: '⚡ 6-घंटे में 100% ऑटो पेआउट बैंक खाते में!',
      views: '45K views',
      duration: '0:48',
      thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 2,
      title: '🏦 PhonePe / Google Pay IMPS पेआउट प्रूफ',
      views: '28K views',
      duration: '0:35',
      thumbnail: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 3,
      title: '📜 MCA & StartUp India सर्टिफाइड कंपनी',
      views: '62K views',
      duration: '0:55',
      thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: 4,
      title: '💰 ₹500 से शुरू करें ऑटोमैटिक इनकम प्लान',
      views: '38K views',
      duration: '0:42',
      thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=500&q=80',
    },
  ];

  // Playlists list
  const playlistsList = [
    {
      title: 'GCap Official Plan & Strategy 2026',
      count: '12 videos',
      updated: 'Updated yesterday',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Live Payout Proofs & Bank Statements',
      count: '24 videos',
      updated: 'Updated 3 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'MCA Govt Legal Compliance & Directors',
      count: '8 videos',
      updated: 'Updated last week',
      thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=500&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto font-sans flex flex-col justify-between animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black shadow-2xl z-50 flex items-center gap-1.5 border border-amber-300">
          <Bell className="w-3.5 h-3.5 fill-slate-950" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main YouTube Container */}
      <div className="w-full max-w-2xl mx-auto min-h-screen bg-slate-950 flex flex-col relative pb-16">
        
        {/* Top Sticky Header Bar */}
        <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md px-3 py-2.5 flex items-center justify-between border-b border-slate-900">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span>GCap Official</span>
            </span>
          </div>

          {/* Header Action Buttons & Owner/Client Mode Toggle */}
          <div className="flex items-center gap-2">
            {isOwnerUnlocked ? (
              <button
                onClick={handleLockOwnerMode}
                className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer hover:bg-amber-500/30 transition-all"
                title="चैनल मालिक मोड अनलॉक है। ग्राहक व्यू देखने के लिए लॉक करें।"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHi ? '👑 मालिक मोड (Active)' : '👑 Owner Mode'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                title="चैनल मालिक (Admin Owner) लॉगिन करें"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isHi ? 'मालिक लॉगिन' : 'Owner Login'}</span>
              </button>
            )}

            <button
              onClick={handleShareChannel}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
              title="Share Channel"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Access Notice Bar */}
        {!isOwnerUnlocked && (
          <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                {isHi ? '👤 दर्शक मोड (Client Viewer View) • केवल चैनल स्वामी (gcap0581@gmail.com) ही एडिट या अपलोड कर सकते हैं।' : '👤 Client Viewer Mode Active • Upload & Edit restricted to Channel Owner.'}
              </span>
            </div>
            <button
              onClick={() => setShowPinModal(true)}
              className="text-amber-400 hover:underline font-bold shrink-0 cursor-pointer"
            >
              {isHi ? 'PIN भरें' : 'Enter PIN'}
            </button>
          </div>
        )}

        {/* Channel Banner Header */}
        <div className="relative w-full h-32 sm:h-44 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.25),transparent_70%)] pointer-events-none" />
          
          <div className="absolute inset-0 p-3 sm:p-4 flex items-center justify-between">
            <div className="space-y-1 z-10 max-w-[70%]">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                GCap OPC Private Limited
              </div>
              <h1 className="text-sm sm:text-xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                सुरक्षित व गारंटीकृत निवेश योजनाएँ
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-300 font-medium font-mono">
                📞 +91 8603504808 | 🌐 www.gcapofficial.com
              </p>
            </div>

            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400/40 p-1 bg-slate-950/80 backdrop-blur-sm shrink-0 flex items-center justify-center shadow-2xl">
              <img
                src={PRIMARY_COMPANY_LOGO}
                alt="GCap Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Channel Main Profile Info Bar */}
        <div className="p-3 sm:p-4 space-y-3 bg-slate-950 border-b border-slate-900">
          
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900 border-2 border-slate-700 p-0.5 shrink-0 overflow-hidden shadow-xl -mt-8 relative z-20">
              <img
                src={PRIMARY_COMPANY_LOGO}
                alt="GCap Official Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="flex-1 space-y-1 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  GCap Official
                </h2>
                <div className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-slate-950 shrink-0" title="Verified YouTube Channel">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="text-xs text-slate-400 font-normal space-x-1.5">
                <span className="font-semibold text-slate-300">@GCapOfficial</span>
                <span>•</span>
                <span>12.5K subscribers</span>
                <span>•</span>
                <span>{videos.length + 180} videos</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed font-normal">
            <span>
              GCap OPC Private Limited (CIN: U65999BR2026OPC078129). Official channel for scheme tutorials, 6-hour payouts, and investor support.
            </span>
            <button
              onClick={() => setShowBioModal(true)}
              className="ml-1 font-bold text-white hover:underline cursor-pointer"
            >
              ...more
            </button>
          </div>

          <button
            onClick={() => setShowLinksModal(true)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Official Website and 2 more links</span>
          </button>

          {/* Action Row: Subscribe Pill + Owner Video Control Pill */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleSubscribeToggle}
              className={`w-full py-2.5 px-4 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                isSubscribed
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  : 'bg-white hover:bg-slate-200 text-slate-950'
              }`}
            >
              <Bell className={`w-4 h-4 ${isSubscribed ? 'text-amber-400 fill-amber-400' : 'text-slate-950 fill-slate-950'}`} />
              <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
              {isSubscribed && <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {/* If Owner Mode is Active: Show Add/Upload Video Button */}
            {isOwnerUnlocked && (
              <button
                onClick={handleOpenAddVideo}
                className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-extrabold text-xs text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>{isHi ? 'नया वीडियो जोड़ें / अपलोड करें' : 'Upload / Add Video'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Channel Navigation Tabs Bar */}
        <div className="flex items-center border-b border-slate-900 bg-slate-950 overflow-x-auto scrollbar-none sticky top-[53px] z-30">
          {[
            { id: 'home', label: 'Home' },
            { id: 'videos', label: `Videos (${videos.length})` },
            { id: 'shorts', label: 'Shorts' },
            { id: 'live', label: 'Live' },
            { id: 'playlists', label: 'Playlists' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs sm:text-sm font-bold shrink-0 transition-colors cursor-pointer relative ${
                activeTab === tab.id ? 'text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-3 sm:p-4 space-y-6 flex-1">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              
              {/* Featured Trailer Card */}
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group">
                  {activeVideoId === featuredVideo.id ? (
                    <div className="w-full aspect-video bg-black">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${featuredVideo.id}?autoplay=1`}
                        title={featuredVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setActiveVideoId(featuredVideo.id);
                        setActiveVideoTitle(featuredVideo.title);
                      }}
                      className="relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-950"
                    >
                      <img
                        src={featuredVideo.thumbnail}
                        alt={featuredVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/90 text-white font-mono text-[11px] font-bold">
                        {featuredVideo.duration}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 p-0.5 shrink-0 overflow-hidden">
                      <img src={PRIMARY_COMPANY_LOGO} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                        {featuredVideo.title}
                      </h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>GCap Official</span>
                        <span>•</span>
                        <span>▷ {featuredVideo.views} views</span>
                        <span>•</span>
                        <span>{featuredVideo.date}</span>
                      </div>
                    </div>

                    {isOwnerUnlocked && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditVideo(featuredVideo)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
                          title="Edit Video"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Embedded YouTube Action Bar */}
                <YouTubeNativeActionBar
                  channelUrl="https://www.youtube.com/@GCapOfficial"
                  videoUrl="https://www.youtube.com/@GCapOfficial"
                  videoTitle={featuredVideo.title}
                  channelName="GCap Official"
                  subscribersCount="12.5K subscribers"
                  initialLikes={3742}
                  initialViews="6.6 lakh views"
                  isHi={isHi}
                  onOpenStudio={() => handleGuardAdminAction(() => onOpenStudio && onOpenStudio())}
                />
              </div>

              {/* Interactive Video Comments Section for Client Viewers */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>{isHi ? 'दर्शक टिप्पणियाँ (Comments)' : 'Viewer Comments'}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {comments.length}
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-400">{isHi ? 'पब्लिक कमेंट्स' : 'Public Comments'}</span>
                </div>

                {/* Post New Comment Box */}
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={isHi ? 'एक टिप्पणी जोड़ें (Add a public comment)...' : 'Add a public comment...'}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isHi ? 'कमेंट' : 'Post'}</span>
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-2.5 pt-1">
                  {comments.map((cmt) => (
                    <div key={cmt.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">{cmt.author}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{cmt.date}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{cmt.text}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <button className="flex items-center gap-1 hover:text-white cursor-pointer">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{cmt.likes}</span>
                        </button>
                        <button className="hover:text-white cursor-pointer">Reply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* "For you" Section */}
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  For you
                </h3>

                <div className="space-y-3">
                  {videos.slice(1).map((vid) => (
                    <div
                      key={vid.id}
                      className="flex items-start gap-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl p-2 transition-all group"
                    >
                      <div
                        onClick={() => {
                          setActiveVideoId(vid.id);
                          setActiveVideoTitle(vid.title);
                        }}
                        className="relative w-32 sm:w-40 aspect-video rounded-lg overflow-hidden bg-slate-950 shrink-0 cursor-pointer"
                      >
                        <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                          {vid.duration}
                        </div>
                      </div>

                      <div className="flex-1 space-y-1 py-0.5">
                        <h4
                          onClick={() => {
                            setActiveVideoId(vid.id);
                            setActiveVideoTitle(vid.title);
                          }}
                          className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 cursor-pointer transition-colors"
                        >
                          {vid.title}
                        </h4>
                        <div className="text-[10px] text-slate-400">
                          <span>{vid.views} views</span> • <span>{vid.date}</span>
                        </div>
                      </div>

                      {/* Owner Control Actions */}
                      {isOwnerUnlocked && (
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditVideo(vid)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors cursor-pointer"
                            title="Edit Video"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-red-400 transition-colors cursor-pointer"
                            title="Delete Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shorts Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Shorts</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('shorts')}
                    className="text-xs font-bold text-red-400 hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {shortsList.map((short, idx) => (
                    <div
                      key={short.id}
                      onClick={() => setSelectedShort(idx)}
                      className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group shadow-lg"
                    >
                      <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 space-y-0.5">
                        <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                          {short.title}
                        </p>
                        <span className="text-[10px] font-mono text-slate-300 block">{short.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* VIDEOS TAB */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'latest', label: 'Latest' },
                    { id: 'popular', label: 'Popular' },
                    { id: 'oldest', label: 'Oldest' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setVideoFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        videoFilter === f.id
                          ? 'bg-white text-slate-950'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {isOwnerUnlocked && (
                  <button
                    onClick={handleOpenAddVideo}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="flex flex-col sm:flex-row gap-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl p-2.5 transition-all group"
                  >
                    <div
                      onClick={() => {
                        setActiveVideoId(vid.id);
                        setActiveVideoTitle(vid.title);
                      }}
                      className="relative aspect-video w-full sm:w-48 rounded-lg overflow-hidden bg-slate-950 shrink-0 cursor-pointer"
                    >
                      <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/90 text-white font-mono text-[10px] font-bold">
                        {vid.duration}
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <h4
                        onClick={() => {
                          setActiveVideoId(vid.id);
                          setActiveVideoTitle(vid.title);
                        }}
                        className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 cursor-pointer transition-colors"
                      >
                        {vid.title}
                      </h4>
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                        <span>{vid.views} views</span> • <span>{vid.date}</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-red-950/60 text-red-300 border border-red-800/40">
                        {vid.category}
                      </span>
                    </div>

                    {isOwnerUnlocked && (
                      <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                        <button
                          onClick={() => handleOpenEditVideo(vid)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-red-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHORTS TAB */}
          {activeTab === 'shorts' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {shortsList.map((short, idx) => (
                <div
                  key={short.id}
                  onClick={() => setSelectedShort(idx)}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group shadow-xl"
                >
                  <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {short.title}
                    </p>
                    <span className="text-[11px] font-mono text-amber-300 block font-semibold">{short.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIVE TAB */}
          {activeTab === 'live' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-center space-y-2">
                <Radio className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
                <h3 className="font-extrabold text-sm text-white">
                  GCap Official Daily Live Support Session
                </h3>
                <p className="text-xs text-slate-300">
                  हर शाम 6:00 बजे लाइव Q&A और 6-घंटे पेआउट वेरिफिकेशन ब्रॉडकास्ट।
                </p>
                <button
                  onClick={() => triggerToast(isHi ? 'लाइव रिमाइंडर सेट किया गया!' : 'Live reminder set!')}
                  className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-lg"
                >
                  🔔 Set Live Reminder
                </button>
              </div>
            </div>
          )}

          {/* PLAYLISTS TAB */}
          {activeTab === 'playlists' && (
            <div className="space-y-3">
              {playlistsList.map((pl, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-slate-700 transition-all"
                  onClick={() => triggerToast(`Opening playlist: ${pl.title}`)}
                >
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-950 shrink-0">
                    <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-y-0 right-0 w-10 bg-black/80 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                      <ListVideo className="w-4 h-4 mb-0.5" />
                      <span>{pl.count}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{pl.title}</h4>
                    <span className="text-[11px] text-slate-400 block">{pl.count} • {pl.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Bottom Mobile Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-900 px-2 py-1.5 flex items-center justify-around text-slate-400 text-[10px] max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'home' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('shorts')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer ${activeTab === 'shorts' ? 'text-white font-bold' : 'hover:text-slate-200'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Shorts</span>
          </button>

          {/* Plus / Studio Button (Guarded with Admin Notice) */}
          <button
            onClick={() => {
              handleGuardAdminAction(() => {
                if (onOpenStudio) {
                  onClose();
                  onOpenStudio();
                } else {
                  triggerToast(isHi ? '7-सीन प्रोमो वीडियो स्टूडियो' : '7-Scene Studio');
                }
              });
            }}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform"
            title="Create / Studio (Owner Restricted)"
          >
            <PlusCircle className="w-6 h-6 text-amber-400" />
          </button>

          <button
            onClick={() => triggerToast(isHi ? 'सब्सक्रिप्शन लिस्ट' : 'Subscriptions')}
            className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-slate-200"
          >
            <Tv className="w-5 h-5" />
            <span>Subscriptions</span>
          </button>

          <button
            onClick={() => setShowBioModal(true)}
            className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-slate-200"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-700">
              <img src={PRIMARY_COMPANY_LOGO} alt="You" className="w-full h-full object-cover" />
            </div>
            <span>You</span>
          </button>
        </div>

      </div>

      {/* Owner PIN Authentication Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">
                  {isHi ? 'यूट्यूब चैनल मालिक लॉगिन' : 'YouTube Channel Owner Login'}
                </h3>
              </div>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isHi
                ? 'यह यूट्यूब चैनल आधिकारिक रूप से सुरक्षित है। केवल चैनल मालिक (Admin Owner - gcap0581@gmail.com) ही वीडियो एडिट या अपलोड कर सकते हैं।'
                : 'This channel is secured. Only the channel owner can edit or upload videos.'}
            </p>

            <form onSubmit={handleVerifyOwnerPin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  {isHi ? 'मालिक लॉगिन PIN (Owner PIN):' : 'Owner PIN:'}
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="PIN दर्ज करें (उदा. 0581)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-center text-amber-300 tracking-widest focus:outline-none focus:border-amber-400"
                  autoFocus
                  required
                />
                {pinError && <p className="text-red-400 text-[11px] mt-1 font-semibold">{pinError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
                >
                  {isHi ? 'अनलाॉक करें' : 'Unlock Owner Mode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Access Guard Notice Modal */}
      {showClientNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl w-full max-w-md p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h3 className="font-black text-base text-white">
                  {isHi ? 'केवल चैनल मालिक (Admin Owner) अनुमति' : 'Owner Authorization Required'}
                </h3>
                <span className="text-[10px] text-amber-300 font-mono">Channel Security Policy</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
              <p className="font-medium">
                {isHi
                  ? 'आप वर्तमान में एक ग्राहक/दर्शक (Client Visitor) के रूप में जुड़े हैं।'
                  : 'You are currently in Client Viewer mode.'}
              </p>
              <p className="text-slate-300">
                {isHi
                  ? 'केवल यूट्यूब चैनल के असली स्वामी (gcap0581@gmail.com) ही वीडियो एडिट, अपलोड या स्टूडियो संचालित कर सकते हैं। आप स्वतंत्र रूप से सभी वीडियो देख सकते हैं, लाइक 👍, शेयर 📲, कमेंट 💬 और सब्सक्राइब 🔔 कर सकते हैं!'
                  : 'Only the channel owner can upload, edit, or access studio controls. Viewers can watch, like, share, comment, and subscribe!'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-1">
              <button
                onClick={() => setShowClientNoticeModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                {isHi ? 'ठीक है (दर्शक रूप में जारी रखें)' : 'Got it (Continue as Viewer)'}
              </button>
              <button
                onClick={() => {
                  setShowClientNoticeModal(false);
                  setShowPinModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
              >
                {isHi ? 'मैं स्वामी हूँ (Enter PIN)' : 'I am Owner (Enter PIN)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Add / Edit Modal (For Channel Owner) */}
      {showVideoEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl w-full max-w-lg p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>{editingVideo ? (isHi ? 'वीडियो विवरण एडिट करें' : 'Edit Video') : (isHi ? 'नया वीडियो अपलोड/जोड़ें' : 'Upload New Video')}</span>
              </h3>
              <button onClick={() => setShowVideoEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideoForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">वीडियो शीर्षक (Video Title):</label>
                <input
                  type="text"
                  value={videoFormData.title}
                  onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">यूट्यूब ID / Embed ID:</label>
                  <input
                    type="text"
                    value={videoFormData.id}
                    onChange={(e) => setVideoFormData({ ...videoFormData, id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-400"
                    placeholder="L_LUpnjgPso"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">श्रेणी (Category):</label>
                  <input
                    type="text"
                    value={videoFormData.category}
                    onChange={(e) => setVideoFormData({ ...videoFormData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                    placeholder="Official Guide"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">अवधि (Duration):</label>
                  <input
                    type="text"
                    value={videoFormData.duration}
                    onChange={(e) => setVideoFormData({ ...videoFormData, duration: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                    placeholder="10:00"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">दृश्य संख्या (Views):</label>
                  <input
                    type="text"
                    value={videoFormData.views}
                    onChange={(e) => setVideoFormData({ ...videoFormData, views: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                    placeholder="12.5K"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">थंबनेल इमेज URL (Thumbnail Image URL):</label>
                <input
                  type="url"
                  value={videoFormData.thumbnail}
                  onChange={(e) => setVideoFormData({ ...videoFormData, thumbnail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVideoEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {isHi ? 'सेव करें' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bio / About Modal Drawer */}
      {showBioModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 text-white space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                <span>About GCap Official</span>
              </h3>
              <button onClick={() => setShowBioModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p className="font-medium text-white">
                GCap OPC Private Limited (Corporate Identification Number: U65999BR2026OPC078129).
              </p>
              <p>
                जीकैप का यह आधिकारिक यूट्यूब चैनल सभी निवेशकों को सुरक्षित एवं 6-घंटे ऑटो-पेआउट प्लान्स, अकाउंट एक्टिवेशन और डायरेक्ट बैंक ट्रांसफर की पारदर्शी जानकारी प्रदान करता है।
              </p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Joined:</span>
                  <span className="text-white">Jan 15, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Views:</span>
                  <span className="text-emerald-400 font-bold">664,210 views</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Country:</span>
                  <span className="text-white">India 🇮🇳</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Helpline:</span>
                  <span className="text-amber-300 font-bold">+91 8603504808</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowBioModal(false);
                handleShareChannel();
              }}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Channel</span>
            </button>
          </div>
        </div>
      )}

      {/* Links Modal Drawer */}
      {showLinksModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg p-5 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">Links</h3>
              <button onClick={() => setShowLinksModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href="https://www.gcapofficial.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-white hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold block">Official Website</span>
                    <span className="text-[10px] text-slate-400">gcapofficial.com</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href="https://t.me/gcapofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-white hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="font-bold block">Telegram Official Group</span>
                    <span className="text-[10px] text-slate-400">t.me/gcapofficial</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href="https://chat.whatsapp.com/GCapOfficialCommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-white hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold block">WhatsApp Community</span>
                    <span className="text-[10px] text-slate-400">chat.whatsapp.com</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
