
import React, { useState, useRef, useEffect } from 'react';
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
  const [isGeneratingPronunciation, setIsGeneratingPronunciation] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreview, setAudioPreview] = useState<string | null>(initialData?.audioUrl || null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEnglishBlur = async () => {
    if (!isOnline) return;
    if (formData.english && formData.english.length > 1 && !formData.pronunciation && !isGeneratingPronunciation) {
      setIsGeneratingPronunciation(true);
      const pron = await getAIPronunciation(formData.english);
      if (pron) {
        setFormData(prev => ({ ...prev, pronunciation: pron }));
      }
      setIsGeneratingPronunciation(false);
    }
  };

  const handleAISuggest = async () => {
    if (!isOnline) {
      alert("You are offline. AI Fill requires an internet connection.");
      return;
    }
    const wordToLookup = formData.english || formData.assamese || formData.taiKhamyang;
    if (!wordToLookup) return alert('Please enter at least one field to get suggestions.');
    
    setIsLoadingAI(true);
    const suggestions = await getAIWordSuggestions(wordToLookup, 'unknown');
    setIsLoadingAI(false);

    if (suggestions) {
      setFormData(prev => ({ ...prev, ...suggestions }));
    }
  };

  const toBase64 = (file: File | Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please upload an MP3 smaller than 2MB.");
        return;
      }
      try {
        const base64 = await toBase64(file);
        setFormData(prev => ({ ...prev, audioUrl: base64 }));
        setAudioPreview(base64);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await toBase64(audioBlob);
        setFormData(prev => ({ ...prev, audioUrl: base64 }));
        setAudioPreview(base64);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone access denied or not available.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const removeAudio = () => {
    setFormData(prev => ({ ...prev, audioUrl: '' }));
    setAudioPreview(null);
  };

  const handleFormSubmit = () => {
    const currentEnglish = formData.english?.trim().toLowerCase();
    
    if (!currentEnglish) {
      alert("Please provide the English base word.");
      return;
    }

    const isDuplicate = existingWords.some(w => 
      w.english.trim().toLowerCase() === currentEnglish && 
      (!initialData || w.id !== initialData.id)
    );

    if (isDuplicate) {
      alert(`The word "${formData.english}" already exists in the dictionary.`);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900">{initialData ? 'Edit Word Entry' : 'Add New Dictionary Entry'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">English Base Word</label>
                <input
                  name="english"
                  value={formData.english}
                  onChange={handleChange}
                  onBlur={handleEnglishBlur}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                  placeholder="e.g., Apple"
                />
              </div>
              <button 
                onClick={handleAISuggest}
                disabled={isLoadingAI || !isOnline}
                className={`mb-1 p-3 rounded-xl transition-colors shadow-sm font-bold text-xs flex items-center gap-1 ${!isOnline ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                {isLoadingAI ? (
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {isOnline ? 'AI Fill' : 'Offline'}
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assamese Translation</label>
                <input
                  name="assamese"
                  value={formData.assamese}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all assamese-font text-lg"
                  placeholder="অসমীয়া শব্দ"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tai Khamyang Entry</label>
                <input
                  name="taiKhamyang"
                  value={formData.taiKhamyang}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-emerald-700"
                  placeholder="Tai word"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Additional Language (More)</label>
                <input
                  name="additionalLang"
                  value={formData.additionalLang}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-amber-600"
                  placeholder="e.g. Hindi translation"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Word Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                >
                  <option value="General">General</option>
                  <option value="Nature">Nature</option>
                  <option value="Food">Food</option>
                  <option value="Family">Family</option>
                  <option value="Place">Place</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pronunciation Guide</label>
              <input
                name="pronunciation"
                value={formData.pronunciation}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all italic text-gray-600"
                placeholder="Phonetic spelling"
              />
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Example Sentence</label>
                <input
                  name="exampleSentence"
                  value={formData.exampleSentence}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                  placeholder="How is this word used in a sentence?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sentence Meaning / Translation</label>
                <textarea
                  name="sentenceMeaning"
                  value={formData.sentenceMeaning}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium h-20"
                  placeholder="What does the above sentence mean in English or Assamese?"
                />
              </div>
            </div>

            <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Voice Recording / MP3 Upload</label>
              
              {audioPreview ? (
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  <audio src={audioPreview} controls className="h-8 max-w-[200px]" />
                  <button onClick={removeAudio} className="p-2 text-red-400 hover:text-red-600 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input type="file" accept=".mp3,audio/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center py-4 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                      <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <span className="text-[10px] font-bold text-gray-400">Upload</span>
                    </div>
                  </div>
                  <button onClick={isRecording ? stopRecording : startRecording} className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all border-2 ${isRecording ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-white border-dashed border-gray-200'}`}>
                    <span className="text-[10px] font-bold text-gray-400">{isRecording ? 'Stop' : 'Record'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl font-black">Cancel</button>
              <button onClick={handleFormSubmit} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg">Save Record</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordFormModal;
