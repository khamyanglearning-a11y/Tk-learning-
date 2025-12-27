
import React, { useState } from 'react';
import { Word } from '../types';

interface WordListProps {
  words: Word[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
  onGenerateImage: (id: string) => Promise<void>;
  onPractice: (word: Word) => void;
  isOnline: boolean;
}

const WordCard: React.FC<{
  word: Word;
  index: number;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (word: Word) => void;
  onDelete: (id: string) => void;
  onGenerateImage: (id: string) => Promise<void>;
  onPractice: (word: Word) => void;
  isOnline: boolean;
}> = ({ word, index, canEdit, canDelete, onEdit, onDelete, onGenerateImage, onPractice, isOnline }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleManualGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating || word.imageUrl) return;
    if (!isOnline) {
      alert("You are offline. Image generation requires internet.");
      return;
    }
    
    setIsGenerating(true);
    try {
      await onGenerateImage(word.id);
    } catch (error) {
      console.error("Manual generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Audio playback failed", e));
  };

  return (
    <div 
      className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative group flex flex-col h-full animate-card-entry overflow-hidden"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="relative aspect-video bg-gray-50 overflow-hidden">
        {word.imageUrl ? (
          <img 
            src={word.imageUrl} 
            alt={word.english} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <button 
            onClick={handleManualGenerate}
            disabled={isGenerating || !isOnline}
            className={`w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 transition-colors group/gen ${!isOnline ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-50/50'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isGenerating ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-300 group-hover/gen:text-blue-500 group-hover/gen:scale-110'}`}>
              {isGenerating ? (
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isGenerating ? 'text-blue-600' : 'text-gray-300 group-hover/gen:text-blue-400'}`}>
                {!isOnline ? 'Offline: No AI Image' : isGenerating ? 'AI is Drawing...' : 'Tap to Generate Photo'}
              </span>
            </div>
          </button>
        )}
        
        {word.isOfflineReady && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-emerald-500/90 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm animate-in fade-in duration-300">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            Offline
          </div>
        )}

        <button 
          onClick={() => onPractice(word)}
          className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-md text-blue-600 rounded-2xl shadow-lg border border-white hover:scale-110 active:scale-95 transition-all flex items-center gap-2 z-20"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          <span className="text-[10px] font-black uppercase tracking-widest pr-1">Practice</span>
        </button>
      </div>

      <div className="p-7 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
              {word.category || 'General'}
            </span>
            <h3 className="text-2xl font-black text-gray-900 mt-2 break-words leading-tight">{word.english}</h3>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0">
            {word.audioUrl && (
              <button 
                onClick={() => playAudio(word.audioUrl!)}
                className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all active:scale-90 shadow-sm border border-emerald-100"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              </button>
            )}
            {canEdit && (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => onEdit(word)} 
                  className="p-2.5 text-gray-500 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all shadow-sm border border-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 flex-grow">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assamese (অসমীয়া)</span>
            <span className="text-2xl text-gray-800 assamese-font font-medium">{word.assamese}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tai Khamyang</span>
              <span className="text-xl text-emerald-700 font-black tracking-tight">{word.taiKhamyang}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">More / Other</span>
              <span className="text-xl text-amber-600 font-black tracking-tight">{word.additionalLang || '—'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
          {word.pronunciation && (
             <div className="flex items-center gap-2 text-xs text-gray-400 italic">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
               </svg>
               {word.pronunciation}
             </div>
          )}

          {word.exampleSentence && (
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-50">
              <p className="text-sm text-gray-900 leading-relaxed font-bold">
                "{word.exampleSentence}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function WordList({ words, canEdit, canDelete, onEdit, onDelete, onGenerateImage, onPractice, isOnline }: WordListProps) {
  if (words.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
        <p className="text-gray-400 text-lg font-medium">No words found match your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {words.map((word, index) => (
        <WordCard 
          key={word.id}
          word={word}
          index={index}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={onEdit}
          onDelete={onDelete}
          onGenerateImage={onGenerateImage}
          onPractice={onPractice}
          isOnline={isOnline}
        />
      ))}
    </div>
  );
}
