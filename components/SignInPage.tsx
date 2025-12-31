
import React, { useState } from 'react';
import { generateSmsMessage } from '../services/geminiService';
import { sendWhatsAppOtp, WhatsAppResponse } from '../services/smsService';

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
  const [wsStatus, setWsStatus] = useState<WhatsAppResponse | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    
    setIsSending(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    onOtpGenerated(newOtp);

    const aiMessage = await generateSmsMessage(newOtp);
    const delivery = await sendWhatsAppOtp(phoneNumber, newOtp, aiMessage);
    
    setWsStatus(delivery);
    setIsSending(false);

    if (delivery.success) {
      setStep('otp');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 8000);
    } else {
      alert(`WhatsApp Gateway Error: ${delivery.message}`);
    }
  };

  const handleVerify = () => {
    if (otpEntry.length !== 6) {
      alert('Please enter the 6-digit code.');
      return;
    }
    setIsSending(true);
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
      {/* WHATSAPP STYLE NOTIFICATION */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm transition-all duration-700 transform ${showNotification ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#128C7E] text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 border border-white/20">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.123.553 4.197 1.604 6.046L0 24l6.104-1.601a11.803 11.803 0 005.94 1.6c6.637 0 12.033-5.396 12.036-12.03a11.83 11.83 0 00-3.328-8.504z"/></svg>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                WhatsApp • Just Now
              </span>
              <button onClick={() => setShowNotification(false)} className="text-white/50 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm font-medium leading-tight">
               {wsStatus?.isReal ? 'Your OTP has been delivered.' : `WhatsApp Simulation: Your code is ${expectedOtp}`}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-10 left-10">
        <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all group">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>

      <div className="max-w-sm w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div>
          <div className={`w-20 h-20 ${isDeveloper ? 'bg-indigo-600' : isStudent ? 'bg-emerald-600' : 'bg-green-600'} rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl mx-auto mb-8`}>
            {isStudent ? 'S' : 'T'}
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            {isDeveloper ? 'Developer Login' : isStaff ? 'Staff Portal' : isStudent ? 'Student Login' : 'Sign In'}
          </h1>
          <p className="text-gray-500 font-medium mt-2 px-4 text-sm leading-relaxed">
            {step === 'phone' 
              ? 'Enter your WhatsApp number to receive a secure login code.' 
              : `A code has been sent to your WhatsApp number +91 ${phoneNumber}.`}
          </p>
        </div>

        <div className="space-y-6 pt-4 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {step === 'phone' ? 'WhatsApp Number' : 'Verification Code'}
            </label>
            
            {step === 'phone' ? (
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-green-500">+91</span>
                <input
                  type="tel"
                  className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all text-xl font-bold tracking-widest"
                  placeholder="WhatsApp No."
                  value={phoneNumber}
                  autoFocus
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            ) : (
              <input
                type="text"
                className="w-full px-4 py-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all text-center text-4xl font-black tracking-[0.4em]"
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
            className={`w-full py-5 ${isDeveloper ? 'bg-indigo-900' : isStudent ? 'bg-emerald-900' : 'bg-green-600 hover:bg-green-700'} text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2`}
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Syncing WhatsApp...</span>
              </>
            ) : (
              step === 'phone' ? 'Send WhatsApp OTP' : 'Verify & Enter'
            )}
          </button>
          
          {step === 'otp' && (
            <button 
              onClick={() => setStep('phone')} 
              className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-green-600 transition-colors"
            >
              Wait, that's not my WhatsApp number
            </button>
          )}
        </div>

        <div className="pt-8 flex flex-col items-center gap-2 opacity-30">
          <div className="flex gap-1">
             {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>)}
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            Secured via WhatsApp Protocol
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
