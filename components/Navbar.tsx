
import React, { useState } from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: 'dictionary' | 'library' | 'gallery' | 'songs' | 'about' | 'profile' | 'videos' | 'dashboard' | 'offline';
  onTabChange: (tab: 'dictionary' | 'library' | 'gallery' | 'songs' | 'about' | 'profile' | 'videos' | 'dashboard' | 'offline') => void;
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

  const allTabs: { id: typeof activeTab, label: string, icon: string, ownerOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z', ownerOnly: true },
    { id: 'dictionary', label: 'Dictionary', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'library', label: 'Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'gallery', label: 'Gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'videos', label: 'TV', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'songs', label: 'Music', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
    { id: 'about', label: 'Heritage', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'offline', label: 'Offline', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ];

  const visibleTabs = allTabs.filter(t => !t.ownerOnly || (user && user.role === 'owner'));

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
              {visibleTabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
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
            {visibleTabs.map(tab => (
              <button 
                key={tab.id}
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
