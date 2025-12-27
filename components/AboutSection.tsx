
import React, { useState } from 'react';
import { searchTaiAbout } from '../services/geminiService';

interface TaiGroup {
  name: string;
  description: string;
  image: string;
}

const TAI_GROUPS: TaiGroup[] = [
  {
    name: "Tai Khamyang",
    description: "The Tai Khamyang (also known as Shyam) are a distinct community living mostly in the Tinsukia, Dibrugarh, and Jorhat districts. They are one of the smaller Tai groups but hold immensely deep knowledge of ancient Tai Buddhism and traditional agriculture. They speak the Khamyang language and follow the Theravada Buddhist faith.",
    image: "https://images.unsplash.com/photo-1543734057-7977a45b98a5?q=80&w=1200&auto=format&fit=crop" // Representative of traditional SE Asian temple heritage
  },
  {
    name: "Tai Khamti",
    description: "The Tai Khamti are known as 'Great Tai' and were once powerful rulers in the Upper Chindwin region. Today, they primarily inhabit the Namsai and Lohit districts of Arunachal Pradesh. They are renowned for their intricate wood carvings, Buddhist literature, and vibrant festivals like Poi Pee Mau.",
    image: "https://images.unsplash.com/photo-1588065053424-df3531b7829a?q=80&w=1200&auto=format&fit=crop" // Representative of gold-adorned Buddhist architecture
  },
  {
    name: "Tai Phake",
    description: "Inhabiting mostly the bank of the river Buridihing, the Tai Phake community (Phakial) is famous for preserving their traditional lifestyle. Their villages like Nam Phake are living museums of Tai culture, featuring Chang-ghars (stilt houses) and beautiful hand-woven textiles made by the village women.",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc18a593?q=80&w=1200&auto=format&fit=crop" // Representative of traditional weaving and color
  },
  {
    name: "Tai Turung",
    description: "The Tai Turung are the largest group among the Tai people of Assam. They migrated from the Mung-Ma-Lung region and have assimilated deeply with the local culture while maintaining their identity through language and religious practices. They are primarily found in the Golaghat and Karbi Anglong districts.",
    image: "https://images.unsplash.com/photo-1621359670612-4c69837a5f36?q=80&w=1200&auto=format&fit=crop" // Representative of traditional architecture and rural life
  }
];

const AboutSection: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResult, setAiResult] = useState<{ text: string, sources: { title: string, uri: string }[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!isOnline) {
      alert("Search requires an internet connection.");
      return;
    }

    setIsLoading(true);
    const result = await searchTaiAbout(searchQuery);
    setAiResult(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Search Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
            Powered by Google Search Grounding
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Heritage Search Engine</h2>
          <p className="text-gray-500 font-medium max-w-lg mx-auto">Discover the history of Tai villages, language, and culture using our real-time AI scholar.</p>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Try: 'Villages of Tai Khamyang' or 'Tai Khamti history'..."
            className="w-full pl-6 pr-16 py-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-lg shadow-sm"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            )}
          </button>
        </form>

        {aiResult && (
          <div className="mt-8 p-8 bg-white rounded-3xl border border-gray-100 shadow-inner animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Scholar's Report</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Grounded in Google Search Data</p>
              </div>
            </div>
            
            <div className="prose prose-blue max-w-none text-gray-700 font-medium leading-relaxed whitespace-pre-wrap mb-8">
              {aiResult.text}
            </div>

            {aiResult.sources.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Verification Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {aiResult.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-gray-100 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tai Groups Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {TAI_GROUPS.map((group, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={group.image} 
                alt={group.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <div className="w-12 h-1 bg-blue-500 rounded-full mb-3"></div>
                <h3 className="text-4xl font-black text-white tracking-tighter">{group.name}</h3>
              </div>
            </div>
            <div className="p-8 flex-1">
              <p className="text-gray-600 leading-relaxed font-medium text-lg mb-6">{group.description}</p>
              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Heritage Profile</span>
                <button 
                  onClick={() => { setSearchQuery(`About ${group.name} villages and history`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
                >
                  Explore Profile
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Village Deep Dive Feature */}
      <div className="bg-gray-900 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-4">Village Directory</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 font-medium text-lg leading-relaxed">
            Our search engine performs deep queries across academic papers and cultural archives to provide village-by-village information. Tap a village below to learn more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Pather Gaon", 
              "Chalapathar", 
              "Nam Phake Village", 
              "Borkhamti", 
              "Ningroo", 
              "Tipam Phake", 
              "Borpather", 
              "Faneng Village"
            ].map((v, i) => (
              <button 
                key={i} 
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all transform hover:-translate-y-1" 
                onClick={() => {setSearchQuery(`Detailed history and culture of ${v}`); window.scrollTo({ top: 0, behavior: 'smooth' });}}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
