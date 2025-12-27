
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
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    onRegister({ name, phone, email, address, photoUrl });
    // Switch to status view for feedback
    setCheckPhone(phone);
    handleCheckStatus(null, phone);
    setViewMode('checkStatus');
  };

  const handleCheckStatus = (e: React.FormEvent | null, phoneOverride?: string) => {
    if (e) e.preventDefault();
    const targetPhone = phoneOverride || checkPhone;
    if (targetPhone.length < 10) {
      alert("Please enter a 10-digit phone number.");
      return;
    }

    // CHECK FOR OWNER NUMBER PERMANENT APPROVAL
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
              <p className="text-gray-500 text-sm font-medium mt-1">Submit your details for developer approval.</p>
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
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Upload Passport Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-xl font-bold focus:bg-white focus:border-blue-500 border-2 transition-all outline-none" placeholder="Student Name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-xl font-bold focus:bg-white focus:border-blue-500 border-2 transition-all outline-none tracking-widest" placeholder="10 Digits" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gmail Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-xl font-bold focus:bg-white focus:border-blue-500 border-2 transition-all outline-none" placeholder="example@gmail.com" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complete Address</label>
                <textarea required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-transparent rounded-xl font-medium focus:bg-white focus:border-blue-500 border-2 transition-all outline-none h-20" placeholder="Village, District, State..." />
              </div>

              <div className="pt-4 space-y-3">
                <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95">
                  Submit for Approval
                </button>
                
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Already Applied?</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setViewMode('checkStatus')}
                  className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Check Your Status
                </button>

                <button type="button" onClick={onClose} className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 transition-colors text-xs">
                  Cancel Registration
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Verify Admission</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Enter your mobile number to check result.</p>
            </div>

            <form onSubmit={handleCheckStatus} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={checkPhone} 
                  onChange={e => setCheckPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl font-black text-xl text-center focus:bg-white focus:border-emerald-500 border-2 transition-all outline-none tracking-[0.2em]" 
                  placeholder="0000000000" 
                />
              </div>

              <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black transition-all active:scale-95 shadow-xl">
                Check Status Now
              </button>

              {hasSearched && (
                <div className="mt-8 p-6 rounded-[2.5rem] border bg-gray-50 animate-in zoom-in duration-300">
                  {checkResult ? (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-24 mx-auto rounded-xl overflow-hidden border-4 border-white shadow-lg mb-4">
                        <img src={checkResult.photoUrl} alt="Student" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900">{checkResult.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">+91 {checkResult.phone}</p>
                      </div>
                      
                      {checkResult.status === 'approved' ? (
                        <div className="space-y-4 pt-2">
                          <div className="bg-emerald-100/50 border border-emerald-200 p-4 rounded-2xl">
                            <p className="text-emerald-700 font-black text-xs uppercase tracking-widest">🎉 Status: APPROVED</p>
                            <p className="text-emerald-600/70 text-[10px] mt-1 font-bold">You can now login to your dashboard.</p>
                          </div>
                          <button 
                            type="button"
                            onClick={onLoginRequested}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-95"
                          >
                            Proceed to Login
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                          </button>
                        </div>
                      ) : checkResult.status === 'rejected' ? (
                        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                          <p className="text-red-700 font-black text-xs uppercase tracking-widest">❌ Status: REJECTED</p>
                          <p className="text-red-600/70 text-[10px] mt-2 font-medium">Sorry, your admission was not approved. Please contact the administrator.</p>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                          <div className="flex justify-center mb-3">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-blue-700 font-black text-xs uppercase tracking-widest">⏳ Status: PENDING</p>
                          <p className="text-blue-600/70 text-[10px] mt-2 font-medium leading-tight">The Developer is currently reviewing your profile. Please check back later.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 font-black text-xs uppercase tracking-widest italic">Number not found in registry.</p>
                      <button 
                        onClick={() => setViewMode('register')}
                        className="mt-4 text-blue-600 font-black text-[10px] uppercase underline underline-offset-4"
                      >
                        Click here to Register first
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 space-y-3">
                <button 
                  type="button" 
                  onClick={() => setViewMode('register')}
                  className="w-full py-4 text-gray-500 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  Back to Admission Form
                </button>
                <button type="button" onClick={onClose} className="w-full py-2 text-gray-300 font-bold hover:text-gray-500 transition-colors text-xs">
                  Close Window
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRegisterModal;
