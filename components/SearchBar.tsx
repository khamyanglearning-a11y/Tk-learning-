
import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Defaulting to English-India, though users might speak Assamese

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice search is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="relative flex-1 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className={`h-5 w-5 transition-colors ${isListening ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        className={`block w-full pl-11 pr-14 py-3 bg-white border border-transparent focus:ring-0 focus:border-blue-500 rounded-xl transition-all outline-none text-lg shadow-sm group-hover:shadow-md ${isListening ? 'border-blue-200 ring-2 ring-blue-50' : ''}`}
        placeholder={isListening ? "Listening..." : "Search words in Assamese, English or Tai..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
        <button
          onClick={toggleListening}
          className={`p-2 rounded-lg transition-all active:scale-90 flex items-center justify-center ${
            isListening 
              ? 'bg-red-50 text-red-600 animate-pulse' 
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
          title={isListening ? "Stop listening" : "Voice search"}
        >
          {isListening ? (
            <div className="relative w-6 h-6 flex items-center justify-center">
               <div className="absolute inset-0 bg-red-400 rounded-full opacity-20 animate-ping"></div>
               <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>
      
      {isListening && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Speak now...</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
