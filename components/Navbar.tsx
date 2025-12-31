
import React, { useState } from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: 'dictionary' | 'library' | 'gallery' | 'songs' | 'profile' | 'videos' | 'dashboard' | 'offline' | 'wiki';
  onTabChange: (tab: 'dictionary' | 'library' | 'gallery' | 'songs' | 'profile' | 'videos' | 'dashboard' | 'offline' | 'wiki') => void;
  onLoginClick: (type: 'dev' | 'admin') => void;
  onLogout: () => void;
  onSyncClick: () => void;
  onMessagesClick: () => void;
  isSyncing: boolean;
  isOnline: boolean;
  unreadCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  activeTab, 
  onTabChange, 
  onLogout, 
  onSyncClick, 
  onMessagesClick,
  isSyncing,
  isOnline,
  unreadCount
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const allTabs: { id: typeof activeTab, label: string, icon: string, roleRestriction?: 'owner' | 'admin' | 'staff-feature' }[] = [
    { id: 'dashboard', label: 'Developer Hub', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', roleRestriction: 'owner' },
    { id: 'dashboard', label: 'Staff Portal', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944', roleRestriction: 'admin' },
    { id: 'dictionary', label: 'Dictionary', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
    { id: 'wiki', label: 'Scholar AI', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'library', label: 'Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
    { id: 'gallery', label: 'Gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01' },
    { id: 'videos', label: 'TV', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14' },
    { id: 'songs', label: 'Music', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2' },
    { id: 'offline', label: 'Offline', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4' },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  const visibleTabs = allTabs.filter(t => {
    if (!t.roleRestriction) return true;
    if (!user) return false;
    if (t.roleRestriction === 'owner') return user.role === 'owner';
    if (t.roleRestriction === 'admin') return user.role === 'admin';
    return true;
  });

  return (
    <>
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 p-2 hover:bg-gray-100/50 rounded-xl transition-all active:scale-90"
            >
              <span className={`w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-x-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 rotate-3">T</div>
              <span className="text-xl font-black text-gray-900 tracking-tight hidden sm:inline">TaiHub</span>
            </div>
            
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 p-1 rounded-xl ml-4 overflow-x-auto no-scrollbar max-w-[500px]">
              {visibleTabs.map((tab, idx) => (
                <button 
                  key={idx}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id && tab.label !== 'Staff Portal' && tab.label !== 'Developer Hub' ? 'bg-white text-blue-600 shadow-sm' : (activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-900')}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {user && (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">
                    {user.role === 'owner' ? 'Developer' : user.role === 'admin' ? 'Staff' : 'Member'}
                  </span>
                  <span className="text-sm font-black text-blue-600">{user.name}</span>
                </div>
                
                {user.role === 'owner' && (
                  <button 
                    onClick={onSyncClick}
                    disabled={isSyncing || !isOnline}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black transition-all bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <span className="hidden md:inline">Sync</span>
                  </button>
                )}
                
                <button 
                  onClick={onMessagesClick}
                  className="p-2.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-xl relative"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{unreadCount}</span>}
                </button>

                <button 
                  onClick={onLogout}
                  className="text-xs md:text-sm bg-gray-900 hover:bg-black text-white px-3 md:px-4 py-2 rounded-lg font-black"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-16 md:hidden bg-white border-b border-gray-100 shadow-2xl p-4 flex flex-col gap-2 animate-in slide-in-from-top duration-300 z-50">
            {visibleTabs.map((tab, idx) => (
              <button 
                key={idx}
                onClick={() => { onTabChange(tab.id); setIsMenuOpen(false); }}
                className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
