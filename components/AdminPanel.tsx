
import React, { useState, useRef } from 'react';
import { Admin, AdminPermissions, PublicUser, StudentRequest, User, Exam, ExamQuestion } from '../types';

interface AdminPanelProps {
  user: User;
  admins: Admin[];
  registeredUsers: PublicUser[];
  studentRequests: StudentRequest[];
  exams: Exam[];
  onSaveAdmin: (admin: Admin) => void;
  onRemoveAdmin: (phoneNumber: string) => void;
  onUpdateUser: (user: PublicUser) => void;
  onDeleteUser: (userId: string) => void;
  onApproveStudent: (requestId: string) => void;
  onRejectStudent: (requestId: string) => void;
  onToggleExamAccess: (requestId: string) => void;
  onCreateExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  stats: {
    words: number;
    books: number;
    photos: number;
    songs: number;
    videos: number;
  };
}

const DEFAULT_PERMISSIONS: AdminPermissions = {
  dictionary: true,
  library: false,
  gallery: false,
  songs: false,
  videos: false,
  heritage: false,
  exams: false
};

export default function AdminPanel({ 
  user,
  admins, 
  registeredUsers, 
  studentRequests,
  exams,
  onSaveAdmin, 
  onRemoveAdmin,
  onUpdateUser,
  onDeleteUser,
  onApproveStudent,
  onRejectStudent,
  onToggleExamAccess,
  onCreateExam,
  onDeleteExam,
  stats
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'registry' | 'staff' | 'students' | 'exams'>('overview');

  // Exam Builder State
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [examQuestions, setExamQuestions] = useState<Partial<ExamQuestion>[]>([]);
  const [isExamBuilderOpen, setIsExamBuilderOpen] = useState(false);

  // Question Recording State
  const [isRecording, setIsRecording] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Staff States
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [permissions, setPermissions] = useState<AdminPermissions>(DEFAULT_PERMISSIONS);

  // User States
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const isOwner = user.role === 'owner';
  const hasExamPermission = isOwner || !!user.permissions?.exams;

  const startQuestionRecording = async (qId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setExamQuestions(prev => prev.map(q => q.id === qId ? { ...q, audioUrl: base64 } : q));
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(qId);
    } catch (err) { alert("Mic access denied"); }
  };

  const stopQuestionRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(null);
  };

  const addQuestion = () => {
    setExamQuestions(prev => [...prev, { id: Date.now().toString(), word: '', meaning: '' }]);
  };

  const removeQuestion = (id: string) => {
    setExamQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveExam = () => {
    if (!examTitle || examQuestions.length === 0) return alert("Exam must have a title and at least one question.");
    const newExam: Exam = {
      id: Date.now().toString(),
      title: examTitle,
      description: examDesc,
      questions: examQuestions as ExamQuestion[],
      createdBy: user.name,
      createdAt: Date.now(),
      timeLimitMinutes: 30
    };
    onCreateExam(newExam);
    setIsExamBuilderOpen(false);
    setExamTitle(''); setExamDesc(''); setExamQuestions([]);
  };

  const handleEditStaff = (admin: Admin) => {
    setStaffName(admin.name);
    setStaffPhone(admin.phone);
    setPermissions({ ...DEFAULT_PERMISSIONS, ...admin.permissions });
    setEditingPhone(admin.phone);
    setActiveSubTab('staff');
  };

  const handleSaveStaff = () => {
    if (staffName.length < 2 || staffPhone.length !== 10) return alert('Check name and 10-digit phone.');
    onSaveAdmin({ name: staffName, phone: staffPhone, permissions });
    setStaffName(''); setStaffPhone(''); setEditingPhone(null); setPermissions(DEFAULT_PERMISSIONS);
  };

  const handleSelectUser = (u: PublicUser) => {
    setSelectedUserId(u.id);
    setUserName(u.name);
    setUserAddress(u.address);
    setUserPhone(u.phone);
  };

  const handleUpdateUserSave = () => {
    if (!selectedUserId) return;
    onUpdateUser({ id: selectedUserId, name: userName, address: userAddress, phone: userPhone, registeredAt: Date.now() });
    setSelectedUserId(null);
    alert('User profile updated.');
  };

  const mainActions = [
    { id: 'overview', label: 'Summary', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-slate-100 text-slate-600' },
    { id: 'registry', label: 'Registry', count: registeredUsers.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-emerald-100 text-emerald-600' },
    { id: 'staff', label: 'Staff', count: admins.length, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'bg-blue-100 text-blue-600' },
    { id: 'students', label: 'Students', count: studentRequests.length, icon: 'M12 14l9-5-9-5-9 5 9 5z', color: 'bg-purple-100 text-purple-600', badge: studentRequests.some(r => r.status === 'pending') },
    { id: 'exams', label: 'Exams', count: exams.length, icon: hasExamPermission ? 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' : 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', color: hasExamPermission ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400' }
  ];

  const statGrid = [
    { label: "Words", value: stats.words, color: "text-blue-600", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" },
    { label: "Books", value: stats.books, color: "text-amber-600", icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18" },
    { label: "Gallery", value: stats.photos, color: "text-indigo-600", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16" },
    { label: "Music", value: stats.songs, color: "text-emerald-600", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2" },
    { label: "Videos", value: stats.videos, color: "text-rose-600", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
      
      {/* MOBILE & DESKTOP UNIFIED MENU */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {mainActions.map((action) => (
          <button
            key={action.id}
            onClick={() => setActiveSubTab(action.id as any)}
            className={`relative p-4 md:p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center text-center gap-2 group ${
              activeSubTab === action.id 
                ? 'bg-white border-blue-600 shadow-xl shadow-blue-900/5' 
                : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${action.color}`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={action.icon} />
              </svg>
            </div>
            <div className="mt-1">
              <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">
                {action.id === 'exams' && !hasExamPermission ? 'Locked' : action.label}
              </div>
              {action.count !== undefined && (
                <div className="text-lg font-black text-gray-900">{action.count}</div>
              )}
            </div>
            {action.badge && (
              <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
            {activeSubTab === action.id && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="h-[1px] bg-gray-200/60 w-full"></div>

      {/* OVERVIEW SECTION */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {statGrid.map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm group hover:shadow-lg transition-all hover:-translate-y-1">
                   <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${s.color}`}>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={s.icon} />
                     </svg>
                   </div>
                   <div className={`text-3xl font-black ${s.color} tracking-tighter mb-1`}>{s.value}</div>
                   <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
           </div>
           
           <div className="bg-indigo-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="text-center md:text-left space-y-2">
                    <h3 className="text-3xl font-black tracking-tighter">System Health: Optimal</h3>
                    <p className="text-indigo-200 font-medium max-w-sm">All language packs and media endpoints are functioning correctly. Lead Developer root mode active.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                       <div className="text-2xl font-black">1.2ms</div>
                       <div className="text-[8px] font-bold uppercase opacity-60">Sync Latency</div>
                    </div>
                    <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                       <div className="text-2xl font-black">100%</div>
                       <div className="text-[8px] font-bold uppercase opacity-60">Uptime</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* REGISTRY SECTION */}
      {activeSubTab === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Member Registry</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {registeredUsers.length === 0 ? (
                <div className="col-span-full p-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                  <p className="text-gray-300 font-bold italic">Registry Empty</p>
                </div>
              ) : (
                registeredUsers.map(user => (
                  <div key={user.id} onClick={() => handleSelectUser(user)} className={`p-5 rounded-[2.5rem] border-2 transition-all cursor-pointer relative group ${selectedUserId === user.id ? 'bg-white border-emerald-500 shadow-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 truncate">{user.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{user.address}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteUser(user.id); }} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-emerald-100 h-fit sticky top-24">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">Modify Entry</h3>
            {selectedUserId ? (
              <div className="space-y-4">
                <input className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-bold focus:border-emerald-500 outline-none transition-all" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Full Name" />
                <input className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-bold focus:border-emerald-500 outline-none transition-all" value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="Phone" />
                <textarea className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-medium focus:border-emerald-500 outline-none transition-all h-24" value={userAddress} onChange={e => setUserAddress(e.target.value)} placeholder="Address" />
                <div className="flex gap-2">
                  <button onClick={() => setSelectedUserId(null)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-xs">Cancel</button>
                  <button onClick={handleUpdateUserSave} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs">Update Profile</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4 opacity-30">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <p className="text-sm font-bold italic">Select a member to edit details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAFF SECTION */}
      {activeSubTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-blue-900/5 border border-blue-100 h-fit">
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">{editingPhone ? 'Update Staff' : 'Authorize Staff'}</h3>
            <div className="space-y-4">
              <input className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-bold focus:border-blue-500 outline-none transition-all" value={staffName} onChange={e => setStaffName(e.target.value)} placeholder="Full Name" />
              <input className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl font-bold focus:border-blue-500 outline-none transition-all" disabled={!!editingPhone} value={staffPhone} onChange={e => setStaffPhone(e.target.value)} placeholder="10-digit Phone" />
              <div className="space-y-2 pt-4">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(permissions) as Array<keyof AdminPermissions>).map(k => (
                    <button key={k} onClick={() => setPermissions(p => ({...p, [k]: !p[k]}))} className={`px-3 py-2.5 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${permissions[k] ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-transparent text-gray-400'} ${k === 'exams' && permissions[k] ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}>
                      {k} {k === 'exams' && permissions[k] && '⚡'}
                    </button>
                  ))}
                </div>
              </div>
              {isOwner ? (
                <button onClick={handleSaveStaff} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all mt-4">{editingPhone ? 'Save Updates' : 'Grant Access'}</button>
              ) : (
                <p className="text-[9px] text-red-500 font-bold text-center mt-4 uppercase">Only Lead Developer can authorize staff</p>
              )}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Current Authorized Staff</h3>
            <div className="space-y-3">
              {admins.map(admin => (
                <div key={admin.phone} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-blue-100">{admin.name.charAt(0)}</div>
                    <div>
                      <div className="flex flex-col">
                        <div className="font-black text-gray-900 text-lg flex items-center gap-2">
                          {admin.name}
                        </div>
                        <div className="text-xs font-bold text-gray-400">+91 {admin.phone}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* SPECIFIC EXAM STATUS VISIBILITY FIX */}
                  <div className="flex flex-wrap gap-2 sm:justify-end items-center">
                     {admin.permissions.exams && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-900/10 scale-110">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                          <span className="text-[10px] font-black uppercase tracking-widest">Exam Controller</span>
                        </div>
                     )}
                     
                     <div className="flex flex-wrap gap-1 sm:justify-end max-w-[200px]">
                        {Object.entries(admin.permissions).filter(([k, v]) => v && k !== 'exams').map(([k]) => (
                          <span key={k} className="px-2 py-1 bg-gray-50 text-[8px] font-black text-gray-400 uppercase rounded-md border border-gray-100">{k}</span>
                        ))}
                     </div>
                  </div>

                  {isOwner && (
                    <div className="flex gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <button onClick={() => handleEditStaff(admin)} className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-colors">Edit</button>
                      <button onClick={() => onRemoveAdmin(admin.phone)} className="flex-1 sm:flex-none px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-colors">Revoke</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS SECTION */}
      {activeSubTab === 'students' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Student Applications</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentRequests.length === 0 ? (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="text-gray-300 font-bold italic text-lg">No Applications Found</p>
              </div>
            ) : (
              studentRequests.sort((a, b) => b.requestedAt - a.requestedAt).map(request => (
                <div key={request.id} className={`p-6 bg-white rounded-[3rem] border-2 flex flex-col gap-6 transition-all hover:shadow-2xl ${request.status === 'approved' ? 'border-emerald-100' : 'border-purple-100 shadow-xl shadow-purple-900/5'}`}>
                  <div className="flex gap-4">
                    <div className="w-20 h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0 shadow-inner border-2 border-white">
                      <img src={request.photoUrl} alt={request.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-gray-900 text-lg leading-tight truncate">{request.name}</h4>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 inline-block ${request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {request.status}
                      </span>
                      <p className="text-[10px] font-bold text-gray-400">+91 {request.phone}</p>
                      <p className="text-[10px] font-bold text-gray-400 truncate">{request.email}</p>
                    </div>
                  </div>
                  
                  {request.status === 'approved' ? (
                    <div className="pt-4 border-t border-gray-50">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Exam Hall Access</span>
                         <div className={`w-3 h-3 rounded-full ${request.canAccessExam ? 'bg-emerald-500 animate-pulse' : 'bg-gray-200'}`}></div>
                      </div>
                      {isOwner && (
                        <button 
                          onClick={() => onToggleExamAccess(request.id)}
                          className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 border-2 ${
                            request.canAccessExam 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                              : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600'
                          }`}
                        >
                          {request.canAccessExam ? 'Access Granted' : 'Grant Exam Access'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => onApproveStudent(request.id)} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase transition-all shadow-xl shadow-emerald-100">Approve</button>
                      <button onClick={() => onRejectStudent(request.id)} className="px-5 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase transition-all">Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EXAMS SECTION */}
      {activeSubTab === 'exams' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          {!hasExamPermission ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-dashed border-gray-100 shadow-inner">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Exam Hall Restricted</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2 font-medium">You do not have staff authorization to manage exams. Please request the Lead Developer to grant you the <b>"Exams"</b> permission.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Active Assessments</h3>
                <button onClick={() => setIsExamBuilderOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-900/10 flex items-center justify-center gap-2 transition-all active:scale-95">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg> New Exam
                </button>
              </div>

              {isExamBuilderOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl overflow-y-auto">
                  <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-8 md:p-12 my-10 relative space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-white/20">
                    <button onClick={() => setIsExamBuilderOpen(false)} className="absolute top-10 right-10 p-3 text-gray-300 hover:text-gray-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                    <div className="text-center md:text-left">
                      <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Exam Builder</h2>
                      <p className="text-gray-500 text-sm font-medium mt-2">Design an academic vocabulary challenge.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Exam Name</label>
                        <input className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold focus:bg-white focus:border-orange-500 outline-none transition-all" placeholder="e.g. Unit 1 Quiz" value={examTitle} onChange={e => setExamTitle(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Instructions</label>
                        <input className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-medium focus:bg-white focus:border-orange-500 outline-none transition-all" placeholder="Complete in 30 mins..." value={examDesc} onChange={e => setExamDesc(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Words ({examQuestions.length})</h4>
                        <button onClick={addQuestion} className="text-orange-600 font-black text-xs uppercase tracking-tighter hover:underline">Add Word</button>
                      </div>
                      {examQuestions.map((q, idx) => (
                        <div key={q.id} className="p-6 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 space-y-4 relative group">
                          <button onClick={() => removeQuestion(q.id!)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase">Word</label>
                              <input className="w-full px-4 py-2.5 bg-white rounded-xl font-bold border-2 border-transparent focus:border-orange-500 outline-none" value={q.word} onChange={e => setExamQuestions(prev => prev.map(item => item.id === q.id ? { ...item, word: e.target.value } : item))} />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase">Correct Meaning</label>
                              <input className="w-full px-4 py-2.5 bg-white rounded-xl font-bold border-2 border-transparent focus:border-orange-500 outline-none" value={q.meaning} onChange={e => setExamQuestions(prev => prev.map(item => item.id === q.id ? { ...item, meaning: e.target.value } : item))} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pt-2">
                            <button onClick={() => isRecording === q.id ? stopQuestionRecording() : startQuestionRecording(q.id!)} className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${isRecording === q.id ? 'bg-red-600 text-white animate-pulse' : q.audioUrl ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'bg-gray-900 text-white shadow-xl shadow-gray-900/10'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                              {isRecording === q.id ? 'Listening...' : q.audioUrl ? 'Recording Finalized' : 'Record Voice Prompt'}
                            </button>
                            {q.audioUrl && !isRecording && <button onClick={() => { const a = new Audio(q.audioUrl); a.play(); }} className="p-3 text-emerald-600 bg-emerald-50 rounded-xl"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-8 border-t border-gray-100">
                      <button onClick={() => setIsExamBuilderOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-3xl font-black uppercase text-xs tracking-widest transition-colors hover:bg-gray-200">Discard</button>
                      <button onClick={handleSaveExam} className="flex-1 py-5 bg-orange-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-900/20 active:scale-95 transition-all">Publish to Students</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.length === 0 ? (
                  <div className="col-span-full py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner">
                    <p className="text-gray-300 font-bold italic text-lg">Exam Hall is Empty</p>
                  </div>
                ) : (
                  exams.map(ex => (
                    <div key={ex.id} className="bg-white p-8 rounded-[3rem] border-2 border-transparent shadow-sm flex flex-col justify-between group hover:border-orange-500 hover:shadow-2xl transition-all h-[340px]">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-inner border border-orange-100">{ex.questions.length}</div>
                          <button onClick={() => onDeleteExam(ex.id)} className="p-3 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                        <h4 className="text-2xl font-black text-gray-900 leading-tight mb-2 truncate">{ex.title}</h4>
                        <p className="text-sm text-gray-400 font-medium line-clamp-3 leading-relaxed">{ex.description}</p>
                      </div>
                      <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin: {ex.createdBy}</span>
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">30 Min Limit</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
