
import React, { useState, useRef } from 'react';
import { StudentRequest } from '../types';

interface StudentRegisterModalProps {
  onClose: () => void;
  onRegister: (data: { name: string, phone: string, email: string, address: string, photoUrl: string }) => void;
  studentRequests: StudentRequest[];
  onLoginRequested: () => void;
  ownerPhone?: string;
}

const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({ onClose, onRegister, studentRequests, onLoginRequested, ownerPhone }) => {
  const [viewMode, setViewMode] = useState<'register' | 'checkStatus'>('register');
  
  // Registration States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status Check States
  const [checkPhone, setCheckPhone] = useState('');
  const [checkResult, setCheckResult] = useState<StudentRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert("Photo too large. Please use a passport photo under 1MB.");
        return;
      }
      setIsUploading(true);
      try {
        const base64 = await toBase64(file);
        setPhotoUrl(base64);
      } catch (err) {
        alert("Failed to process photo.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !address || !photoUrl) {
      alert("All fields including passport photo are mandatory.");
      return;
    }
    if (phone.length !== 10) {
      alert("Please enter a valid 10-digit WhatsApp number.");
      return;
    }
    onRegister({ name, phone, email, address, photoUrl });
    setCheckPhone(phone);
    handleCheckStatus(null, phone);
    setViewMode('checkStatus');
  };

  const handleCheckStatus = (e: React.FormEvent | null, phoneOverride?: string) => {
    if (e) e.preventDefault();
    const targetPhone = phoneOverride || checkPhone;
    if (targetPhone.length < 10) {
      alert("Please enter a 10-digit WhatsApp number.");
      return;
    }

    if (ownerPhone && targetPhone.endsWith(ownerPhone.slice(-10))) {
      setCheckResult({
        id: 'OWNER-STUDENT',
        name: 'Developer Student',
        phone: targetPhone,
        email: 'developer@taihub.com',
        address: 'TaiHub Digital Center',
        photoUrl: 'https://images.unsplash.com/photo-1543734057-7977a45b98a5?q=80&w=200&auto=format&fit=crop',
        status: 'approved',
        requestedAt: Date.now()
      });
      setHasSearched(true);
      return;
    }

    const found = studentRequests.find(r => r.phone.endsWith(targetPhone.slice(-10)));
    setCheckResult(found || null);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-8 my-8 transform transition-all animate-in fade-in zoom-in duration-300">
        
        {viewMode === 'register' ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Student Admission</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Submit your WhatsApp number for verification.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-32 h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${photoUrl ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  {isUploading ? (
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : photoUrl ? (
                    <img src={photoUrl} alt="Passport" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Passport Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-xl font-bold focus:bg-white focus:border-green-500 border-2 transition-all outline-none" placeholder="Student Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-xl font-bold focus:bg-white focus:border-green-500 border-2 transition-all outline-none tracking-widest" placeholder="10 Digits" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gmail Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-xl font-bold focus:bg-white focus:border-green-500 border-2 transition-all outline-none" placeholder="example@gmail.com" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complete Address</label>
                <textarea required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-xl font-medium focus:bg-white focus:border-green-500 border-2 transition-all outline-none h-20" placeholder="Address..." />
              </div>

              <div className="pt-4 space-y-3">
                <button type="submit" className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all active:scale-95">
                  Submit Admission
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setViewMode('checkStatus')}
                  className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black text-sm transition-all"
                >
                  Check Admission Status
                </button>

                <button type="button" onClick={onClose} className="w-full py-2 text-gray-300 font-bold hover:text-gray-600 transition-colors text-xs">
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Admission Tracker</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Enter WhatsApp number to see status.</p>
            </div>

            <form onSubmit={handleCheckStatus} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                <input 
                  type="tel" 
                  required 
                  value={checkPhone} 
                  onChange={e => setCheckPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl font-black text-xl text-center focus:bg-white focus:border-green-500 border-2 transition-all outline-none tracking-[0.2em]" 
                  placeholder="0000000000" 
                />
              </div>

              <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black transition-all">
                Track Application
              </button>

              {hasSearched && checkResult && checkResult.status === 'approved' && (
                <button 
                  type="button"
                  onClick={onLoginRequested}
                  className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl"
                >
                  WhatsApp Login
                </button>
              )}

              <button type="button" onClick={() => setViewMode('register')} className="w-full py-2 text-gray-300 font-bold hover:text-gray-600 transition-colors text-xs">
                Back to Form
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRegisterModal;
