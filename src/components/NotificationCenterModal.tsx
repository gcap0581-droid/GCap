import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle,
  CheckCheck,
  Calendar,
  Sparkles,
  ShieldAlert,
  Info,
  Gift,
  AlertTriangle,
  ChevronRight,
  Inbox,
  Filter,
} from 'lucide-react';
import { AdminMessage, Language } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AdminMessage[];
  currentUserId?: string;
  language: Language;
  onMarkAsRead: (messageId: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  messages,
  currentUserId,
  language,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ANNOUNCEMENT' | 'ALERT'>('ALL');
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);

  if (!isOpen) return null;

  const isHi = language === 'hi';

  const isMessageRead = (msg: AdminMessage) => {
    if (!currentUserId) return false;
    return Array.isArray(msg.readByUserIds) && msg.readByUserIds.includes(currentUserId);
  };

  const unreadCount = messages.filter((m) => !isMessageRead(m)).length;

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'UNREAD') return !isMessageRead(msg);
    if (filter === 'ANNOUNCEMENT') return msg.category === 'ANNOUNCEMENT';
    if (filter === 'ALERT') return msg.category === 'ALERT' || msg.priority === 'URGENT';
    return true;
  });

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'ALERT':
        return {
          icon: ShieldAlert,
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
          dot: 'bg-rose-500',
          label: isHi ? 'चेतावनी' : 'Alert',
        };
      case 'BONUS':
        return {
          icon: Gift,
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          dot: 'bg-amber-400',
          label: isHi ? 'बोनस' : 'Bonus',
        };
      case 'INFO':
        return {
          icon: Info,
          bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
          dot: 'bg-cyan-400',
          label: isHi ? 'जानकारी' : 'Info',
        };
      case 'SYSTEM':
        return {
          icon: AlertTriangle,
          bg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
          dot: 'bg-purple-400',
          label: isHi ? 'सिस्टम' : 'System',
        };
      default:
        return {
          icon: Sparkles,
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          dot: 'bg-emerald-400',
          label: isHi ? 'घोषणा' : 'Announcement',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
        id="notification-center-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {isHi ? 'सूचना एवं संदेश केंद्र' : 'Notifications & Messages'}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white animate-pulse">
                    {unreadCount} {isHi ? 'नए' : 'New'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isHi ? 'एडमिन द्वारा भेजी गई महत्वपूर्ण सूचनाएं' : 'Official updates & alerts from admin'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title={isHi ? 'बंद करें' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setFilter('ALL');
                setSelectedMessage(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isHi ? 'सभी' : 'All'} ({messages.length})
            </button>
            <button
              onClick={() => {
                setFilter('UNREAD');
                setSelectedMessage(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isHi ? 'अपठित' : 'Unread'} {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => {
                setFilter('ALERT');
                setSelectedMessage(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'ALERT'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isHi ? 'अलर्ट / नोटिस' : 'Alerts'}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer shrink-0 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{isHi ? 'सभी पढ़ा हुआ मार्क करें' : 'Mark all as read'}</span>
            </button>
          )}
        </div>

        {/* Content Body: Message Detail View or List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedMessage ? (
            /* Detailed View of Single Message */
            <div className="space-y-4 animate-in fade-in duration-150">
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                ← {isHi ? 'सभी संदेशों पर वापस जाएं' : 'Back to all notifications'}
              </button>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          getCategoryTheme(selectedMessage.category).bg
                        }`}
                      >
                        {getCategoryTheme(selectedMessage.category).label}
                      </span>
                      {selectedMessage.priority === 'URGENT' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white">
                          {isHi ? 'अति-महत्वपूर्ण' : 'URGENT'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      {isHi && selectedMessage.titleHi ? selectedMessage.titleHi : selectedMessage.title}
                    </h4>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1 font-mono">
                      <span>
                        {new Date(selectedMessage.timestamp).toLocaleString(
                          isHi ? 'hi-IN' : 'en-IN',
                          { dateStyle: 'medium', timeStyle: 'short' }
                        )}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">{selectedMessage.senderName || 'GCap Admin'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-sm text-slate-200 whitespace-pre-line leading-relaxed select-text">
                  {isHi && selectedMessage.contentHi
                    ? selectedMessage.contentHi
                    : selectedMessage.content}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {!isMessageRead(selectedMessage) ? (
                    <button
                      onClick={() => {
                        onMarkAsRead(selectedMessage.id);
                        setSelectedMessage({
                          ...selectedMessage,
                          readByUserIds: [
                            ...(selectedMessage.readByUserIds || []),
                            currentUserId || '',
                          ],
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isHi ? 'पढ़ा हुआ मार्क करें' : 'Mark as Read'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{isHi ? 'आप इसे पढ़ चुके हैं' : 'Read'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            /* Empty State */
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-slate-300 text-sm">
                  {filter === 'UNREAD'
                    ? isHi
                      ? 'कोई नया अपठित संदेश नहीं है'
                      : 'No unread notifications'
                    : isHi
                    ? 'अभी कोई संदेश उपलब्ध नहीं है'
                    : 'No messages yet'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {isHi
                    ? 'एडमिन से आने वाले सभी संदेश यहाँ सुरक्षित रहेंगे।'
                    : 'Updates and alerts from admin will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            /* Messages List */
            filteredMessages.map((msg) => {
              const isRead = isMessageRead(msg);
              const theme = getCategoryTheme(msg.category);
              const Icon = theme.icon;
              const title = isHi && msg.titleHi ? msg.titleHi : msg.title;
              const content = isHi && msg.contentHi ? msg.contentHi : msg.content;

              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!isRead) {
                      onMarkAsRead(msg.id);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !isRead
                      ? 'bg-slate-950/90 border-amber-500/40 shadow-sm hover:border-amber-400'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${theme.bg}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          )}
                          <span className="font-bold text-sm text-white truncate">
                            {title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {new Date(msg.timestamp).toLocaleDateString(
                            isHi ? 'hi-IN' : 'en-IN',
                            { month: 'short', day: 'numeric' }
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {content}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[11px] text-slate-400">
                        <span className="truncate">{msg.senderName || 'GCap Admin'}</span>
                        <span className="text-amber-400 flex items-center gap-0.5 font-semibold">
                          {isHi ? 'विस्तार से पढ़ें' : 'Read more'} <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            {isHi
              ? '✨ किसी भी पेज पर काम करते समय आप कभी भी यह नोटिफिकेशन बॉक्स खोल सकते हैं।'
              : '✨ You can open this notification inbox anytime from any page.'}
          </p>
        </div>
      </div>
    </div>
  );
};
