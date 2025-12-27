
import React, { useState } from 'react';
import { generateSmsMessage } from '../services/geminiService';

interface SignInPageProps {
  onClose: () => void;
  onLogin: (phoneNumber: string, otp: string) => void;
  expectedOtp: string | null;
  onOtpGenerated: (otp: string) => void;
  intent: 'public' | 'staff' | 'developer' | 'student';
  showSuccess?: boolean;
}

const SignInPage: React.FC<SignInPageProps> = ({ onClose, onLogin, expectedOtp, onOtpGenerated, intent, showSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpEntry, setOtpEntry] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSending, setIsSending] = useState(false);
  const [smsNotification, setSmsNotification] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    
    setIsSending(true);
    
    // 1. Generate a random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    onOtpGenerated(newOtp);

    // 2. Use Gemini to generate a realistic SMS message
    const message = await generateSmsMessage(newOtp);

    // 3. Simulate network delay for realistic feedback
    setTimeout(() => {
      setIsSending(false);
      setStep('otp');
      
      setSmsNotification({ show: true, message });
      
      setTimeout(() => {
        setSmsNotification(prev => ({ ...prev, show: false }));
      }, 8000);
    }, 1500);
  };

  const handleVerify = () => {
    if (otpEntry.length !== 6) {
      alert('Please enter a 6-digit OTP.');
      return;
    }
    
    setIsSending(true);
    
    // Brief simulated delay to show the loading state before transitioning to main app
    setTimeout(() => {
      onLogin(phoneNumber, otpEntry);
      setIsSending(false);
    }, 800);
  };

  const isDeveloper = intent === 'developer';
  const isStaff = intent === 'staff';
  const isStudent = intent === 'student';

  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* SUCCESS BANNER AFTER REGISTRATION */}
      {showSuccess && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 shadow-xl shadow-emerald-900/5">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
             </div>
             <div>
               <p className="text-emerald-900 font-black text-sm leading-tight">Registration Successful!</p>
               <p className="text-emerald-600 font-bold text-xs">Please sign in to your new account.</p>
             </div>
           </div>
        </div>
      )}

      {/* REALISTIC SMS NOTIFICATION BUBBLE */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm transition-all duration-700 transform ${smsNotification.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-black/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-3">
          <div className={`w-10 h-10 ${isDeveloper ? 'bg-indigo-500' : isStaff ? 'bg-blue-500' : isStudent ? 'bg-emerald-500' : 'bg-blue-500'} rounded-full flex items-center justify-center shrink-0 shadow-lg`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDeveloper ? 'text-indigo-400' : isStudent ? 'text-emerald-400' : 'text-blue-400'}`}>Messages • Now</span>
              <button onClick={() => setSmsNotification({ ...smsNotification, show: false })} className="text-gray-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm font-medium leading-tight">{smsNotification.message}</p>
          </div>
        </div>
      </div>

      <div className="absolute top-10 left-10">
        <button 
          onClick={onClose}
          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all group"
        >
          <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>

      <div className="max-w-sm w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div>
          <div className={`w-20 h-20 ${isDeveloper ? 'bg-indigo-600 shadow-indigo-200' : isStaff ? 'bg-blue-600 shadow-blue-200' : isStudent ? 'bg-emerald-600 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'} rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl mx-auto mb-8`}>
            {isStudent ? 'S' : 'T'}
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            {isDeveloper ? 'Developer Login' : isStaff ? 'Staff Portal' : isStudent ? 'Student Login' : 'Community Sign In'}
          </h1>
          <p className="text-gray-500 font-medium mt-2 px-4">
            {step === 'phone' 
              ? (isDeveloper ? 'Lead developer authorization only' : isStaff ? 'Authorized personnel access only' : isStudent ? 'Verified student academic access' : 'Enter your registered community number') 
              : 'Enter the verification code sent to your device'}
          </p>
        </div>

        <div className="space-y-6 pt-4 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {step === 'phone' ? 'Phone Number' : 'Verification Code'}
            </label>
            
            {step === 'phone' ? (
              <div className="relative group">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold transition-colors ${isStudent ? 'text-emerald-500' : 'text-gray-400 group-focus-within:text-blue-500'}`}>+91</span>
                <input
                  type="tel"
                  className={`w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white transition-all text-xl font-bold tracking-widest ${isDeveloper ? 'focus:border-indigo-500' : isStudent ? 'focus:border-emerald-500' : 'focus:border-blue-500'}`}
                  placeholder="0000000000"
                  value={phoneNumber}
                  autoFocus
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            ) : (
              <input
                type="text"
                className={`w-full px-4 py-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white transition-all text-center text-4xl font-black tracking-[0.4em] ${isDeveloper ? 'focus:border-indigo-500' : isStudent ? 'focus:border-emerald-500' : 'focus:border-blue-500'}`}
                placeholder="------"
                value={otpEntry}
                autoFocus
                onChange={(e) => setOtpEntry(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            )}
          </div>
          
          <button 
            onClick={step === 'phone' ? handleSendOtp : handleVerify}
            disabled={isSending}
            className={`w-full py-5 ${isDeveloper ? 'bg-indigo-900 hover:bg-black' : isStaff ? 'bg-blue-900 hover:bg-black' : isStudent ? 'bg-emerald-900 hover:bg-black' : 'bg-gray-900 hover:bg-black'} text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2`}
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{step === 'phone' ? 'Sending Code...' : 'Authenticating...'}</span>
              </>
            ) : (
              step === 'phone' ? 'Verify Identity' : 'Secure Entry'
            )}
          </button>
        </div>

        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-8">
          {isDeveloper ? 'ROOT Access Mode Active' : isStudent ? 'Student Academic Protocol' : 'Strict Security Mode Active'}
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
