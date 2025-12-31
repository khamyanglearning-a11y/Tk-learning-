
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Word } from '../types';
import { getAIWordSuggestions, getAIPronunciation } from '../services/geminiService';

interface WordFormModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Word>) => void;
  onDelete?: () => void;
  canDelete: boolean;
  initialData?: Word;
  existingWords: Word[];
  isOnline: boolean;
}

const COMMON_SUGGESTIONS = [
  "Traditional Dress", "Folk Dance", "Rice Wine", "Bamboo Shoot", 
  "Monastery", "Festival", "Handloom", "Ancestors", "Village Head"
];

const WordFormModal: React.FC<WordFormModalProps> = ({ onClose, onSubmit, onDelete, canDelete, initialData, existingWords, isOnline }) => {
  const [formData, setFormData] = useState<Partial<Word>>(initialData || {
    english: '',
    assamese: '',
    taiKhamyang: '',
    additionalLang: '',
    pronunciation: '',
    exampleSentence: '',
    sentenceMeaning: '',
    audioUrl: '', 
    category: 'General'
  });

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioPreview, setAudioPreview] = useState<string | null>(initialData?.audioUrl || null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const filteredLocalWords = useMemo(() => {
    if (!formData.english || formData.english.length < 2) return [];
    return existingWords.filter(w => 
      w.english.toLowerCase().includes(formData.english!.toLowerCase()) && 
      w.id !== initialData?.id
    ).slice(0, 5);
  }, [formData.english, existingWords, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAISuggest = async () => {
    if (!isOnline) return alert('AI features require internet connection.');
    const wordToLookup = formData.english || formData.assamese || formData.taiKhamyang;
    if (!wordToLookup) return alert('Enter a word first.');
    
    setIsLoadingAI(true);
    const suggestions = await getAIWordSuggestions(wordToLookup, 'unknown');
    setIsLoadingAI(false);

    if (suggestions) {
      setFormData(prev => ({ ...prev, ...suggestions }));
    }
  };

  const selectSuggestion = (word: string) => {
    setFormData(prev => ({ ...prev, english: word }));
    setShowSuggestions(false);
  };

  const loadExistingWord = (word: Word) => {
    setFormData({ ...word });
    setAudioPreview(word.audioUrl || null);
    setShowSuggestions(false);
  };

  const toBase64 = (file: File | Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await toBase64(blob);
        setFormData(prev => ({ ...prev, audioUrl: base64 }));
        setAudioPreview(base64);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) { alert("Mic access denied"); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleFormSubmit = () => {
    if (!formData.english || !formData.assamese || !formData.taiKhamyang) {
      alert("Please fill English, Assamese, and Tai Khamyang at minimum.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[3.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300 custom-scrollbar border border-white/20">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{initialData ? 'Update Record' : 'New Entry'}</h2>
              <p className="text-gray-400 font-medium mt-1">Populate the 4-language digital dictionary.</p>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-gray-100 rounded-full transition-all text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-8">
            {/* Primary Entry with Suggestions */}
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Primary Word (English)</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    name="english"
                    value={formData.english}
                    onChange={handleChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none transition-all font-black text-xl text-gray-900 shadow-inner"
                    placeholder="e.g. Traditional House"
                    autoComplete="off"
                  />
                  
                  {/* Suggestion Dropdown */}
                  {showSuggestions && (formData.english || "").length >= 0 && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 animate-in slide-in-from-top-2">
                      <div className="p-3 border-b border-gray-50 mb-2">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Suggestions</span>
                      </div>
                      
                      {/* Local Database Matches */}
                      {filteredLocalWords.length > 0 && (
                        <div className="mb-4">
                          <p className="px-3 text-[8px] font-bold text-gray-400 uppercase mb-2">Already in Dictionary</p>
                          {filteredLocalWords.map(w => (
                            <button 
                              key={w.id} 
                              onClick={() => loadExistingWord(w)}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-2xl flex items-center justify-between group transition-colors"
                            >
                              <span className="font-black text-gray-700 group-hover:text-blue-700">{w.english}</span>
                              <span className="text-[10px] font-bold text-gray-300">Load Details</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Common Ideas */}
                      <div className="flex flex-wrap gap-2 p-2">
                        {(formData.english ? COMMON_SUGGESTIONS.filter(s => s.toLowerCase().includes(formData.english!.toLowerCase())) : COMMON_SUGGESTIONS).map(s => (
                          <button 
                            key={s} 
                            onClick={() => selectSuggestion(s)}
                            className="px-4 py-2 bg-gray-50 hover:bg-blue-100 text-[10px] font-black text-gray-500 hover:text-blue-700 rounded-xl transition-all"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => setShowSuggestions(false)}
                        className="w-full mt-2 py-2 text-[9px] font-black text-gray-300 uppercase hover:text-gray-900"
                      >
                        Close Suggestions
                      </button>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleAISuggest}
                  disabled={isLoadingAI || !isOnline}
                  className={`px-8 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isLoadingAI ? 'bg-blue-100 text-blue-400' : 'bg-blue-600 text-white shadow-blue-200'}`}
                >
                  {isLoadingAI ? 'AI Working...' : 'AI Smart Fill'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Assamese Script</label>
                <input
                  name="assamese"
                  value={formData.assamese}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none transition-all assamese-font text-2xl font-bold shadow-inner"
                  placeholder="অসমীয়া অৰ্থ"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4">Tai Khamyang</label>
                <input
                  name="taiKhamyang"
                  value={formData.taiKhamyang}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-xl text-emerald-700 shadow-inner"
                  placeholder="Tai script"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest ml-4">Additional Language (More)</label>
                <input
                  name="additionalLang"
                  value={formData.additionalLang}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-lg text-amber-700 shadow-inner"
                  placeholder="e.g. Hindi translation"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Classification</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none transition-all font-black shadow-inner appearance-none"
                >
                  {['General', 'Nature', 'Food', 'Family', 'Heritage', 'Place', 'Education'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Pronunciation Guide</label>
                <input
                  name="pronunciation"
                  value={formData.pronunciation}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none transition-all font-medium italic text-gray-600 shadow-inner"
                  placeholder="e.g. /Tra-di-shun-al/"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Usage Example & Translation</label>
                <input
                  name="exampleSentence"
                  value={formData.exampleSentence}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner"
                  placeholder="Sentence using the word..."
                />
                <textarea
                  name="sentenceMeaning"
                  value={formData.sentenceMeaning}
                  onChange={handleChange}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium h-24 shadow-inner"
                  placeholder="Translation of the example sentence..."
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-[2.5rem] p-8 space-y-6 border border-blue-100">
               <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Audio Record / Upload</h4>
               {audioPreview ? (
                 <div className="flex items-center justify-between bg-white p-5 rounded-[1.5rem] shadow-xl shadow-blue-900/5">
                   <audio src={audioPreview} controls className="h-10" />
                   <button onClick={() => { setAudioPreview(null); setFormData(p => ({...p, audioUrl: ''})); }} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3" /></svg>
                   </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                   <button onClick={isRecording ? stopRecording : startRecording} className={`py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all flex flex-col items-center gap-2 border-2 border-dashed ${isRecording ? 'bg-red-600 text-white border-transparent animate-pulse shadow-xl shadow-red-200' : 'bg-white border-blue-200 text-blue-600'}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                     {isRecording ? 'Stop Recording' : 'Start Recording'}
                   </button>
                   <label className="py-6 rounded-[2rem] bg-white border-2 border-blue-200 border-dashed text-blue-600 font-black uppercase text-xs tracking-widest flex flex-col items-center gap-2 cursor-pointer hover:bg-blue-100 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Upload MP3
                      <input type="file" accept="audio/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) { const b = await toBase64(f); setAudioPreview(b); setFormData(p => ({...p, audioUrl: b})); } }} />
                   </label>
                 </div>
               )}
            </div>

            <div className="flex gap-4 pt-6">
              <button onClick={onClose} className="flex-1 py-6 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
              <button onClick={handleFormSubmit} className="flex-1 py-6 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black shadow-xl transition-all active:scale-95">Save Digital Record</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordFormModal;
