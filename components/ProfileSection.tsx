
import React, { useState, useRef } from 'react';
import { User, PublicUser } from '../types';

interface ProfileSectionProps {
  currentUser: User;
  registeredUsers: PublicUser[];
  onUpdateProfile: (updatedData: Partial<PublicUser>) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ currentUser, registeredUsers, onUpdateProfile }) => {
  const userDetails = registeredUsers.find(u => u.id === currentUser.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userDetails?.name || currentUser.name);
  const [editPhone, setEditPhone] = useState(userDetails?.phone || currentUser.id);
  const [editAddress, setEditAddress] = useState(userDetails?.address || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handlePhotoClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image too large. Please use a photo under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdateProfile({ avatarUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (editName.length < 2) return alert("Name is too short.");
    if (editPhone.length !== 10) return alert("WhatsApp number must be 10 digits.");
    
    onUpdateProfile({
      name: editName,
      phone: editPhone,
      address: editAddress
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Community Profile</h2>
        <p className="text-gray-500 font-medium">Manage your identity linked to your WhatsApp number.</p>
      </div>

      <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/5 border border-gray-100 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-50 to-transparent"></div>

        <div className="relative z-10 mb-8">
          <div 
            onClick={handlePhotoClick}
            className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white transition-all overflow-hidden ${
              isEditing ? 'cursor-pointer hover:brightness-90 hover:scale-105' : ''
            } ${userDetails?.avatarUrl ? 'bg-transparent' : 'bg-green-600 text-white'}`}
          >
            {userDetails?.avatarUrl ? (
              <img src={userDetails.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              getInitials(editName)
            )}
            
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div className="w-full space-y-6 relative z-10">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-green-600 uppercase tracking-widest ml-1">Edit Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-green-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none font-bold text-gray-800 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-green-600 uppercase tracking-widest ml-1">WhatsApp Number</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+91</span>
                   <input 
                    type="tel" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-green-100 rounded-2xl focus:border-green-500 focus:bg-white outline-none font-bold text-gray-800 tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl">Save WhatsApp Identity</button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-3xl font-black text-gray-900 leading-tight">{userDetails?.name || currentUser.name}</h3>
                <span className="inline-block mt-2 px-4 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                  Verified WhatsApp Member
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">WhatsApp</span>
                  <p className="font-bold text-gray-700">+91 {userDetails?.phone || currentUser.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Joined</span>
                  <p className="font-bold text-gray-700">
                    {userDetails ? new Date(userDetails.registeredAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-xl"
              >
                Edit My Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
