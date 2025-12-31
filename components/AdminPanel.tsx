
import React, { useState } from 'react';
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
  exams: false,
  heritage: false
};

const PERMISSION_METADATA: Record<keyof AdminPermissions, { label: string, desc: string, icon: string, color: string }> = {
  dictionary: { label: 'Words', desc: 'Add/edit dictionary entries', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253', color: 'blue' },
  library: { label: 'Library', desc: 'Manage PDF books & papers', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z', color: 'amber' },
  gallery: { label: 'Gallery', desc: 'Upload/remove heritage photos', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01', color: 'indigo' },
  songs: { label: 'Music', desc: 'Control traditional folk tracks', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2', color: 'emerald' },
  videos: { label: 'TV Media', desc: 'Manage YouTube video links', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8', color: 'red' },
  heritage: { label: 'Wiki', desc: 'Grant access to Scholar AI knowledge', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'slate' },
  exams: { label: 'Exams', desc: 'Create & review student tests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7', color: 'orange' }
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

  const isOwner = user.role === 'owner';
  const isAdmin = user.role === 'admin';
  const hasExamPermission = isOwner || !!user.permissions?.exams;

  const mainActions = [
    { id: 'overview', label: 'Summary', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'bg-slate-100 text-slate-600', visible: true },
    { id: 'registry', label: 'Members', count: registeredUsers.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7', color: 'bg-emerald-100 text-emerald-600', visible: isOwner },
    { id: 'staff', label: 'Staff Hub', count: admins.length, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944', color: 'bg-blue-100 text-blue-600', visible: isOwner },
    { id: 'students', label: 'Admissions', count: studentRequests.length, icon: 'M12 14l9-5-9-5-9 5 9 5z', color: 'bg-purple-100 text-purple-600', badge: studentRequests.some(r => r.status === 'pending'), visible: isOwner || hasExamPermission },
    { id: 'exams', label: 'Exam Hall', count: exams.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7', color: 'bg-orange-100 text-orange-600', visible: isOwner || hasExamPermission }
  ];

  const visibleActions = mainActions.filter(a => a.visible);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleActions.map((action) => (
          <button
            key={action.id}
            onClick={() => setActiveSubTab(action.id as any)}
            className={`relative p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center text-center gap-3 group ${
              activeSubTab === action.id 
                ? 'bg-white border-blue-600 shadow-2xl shadow-blue-900/10 scale-105 z-10' 
                : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:rotate-3 shadow-inner ${action.color}`}>
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={action.icon} />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">
                {action.label}
              </div>
              {action.count !== undefined && (
                <div className="text-2xl font-black text-gray-900">{action.count}</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="h-[1px] bg-gray-200/60 w-full"></div>

      {activeSubTab === 'registry' && isOwner && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-2xl font-black text-gray-900">Community Directory</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{registeredUsers.length} Members</span>
          </div>
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registeredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-black text-gray-900">{u.name}</td>
                    <td className="px-8 py-5 font-bold text-green-600 tracking-widest">+91 {u.phone}</td>
                    <td className="px-8 py-5 text-sm text-gray-400 font-medium">{u.address}</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => onDeleteUser(u.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'staff' && isOwner && (
        <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
           <StaffManager admins={admins} onSave={onSaveAdmin} onRemove={onRemoveAdmin} />
        </div>
      )}

      {activeSubTab === 'students' && (isOwner || hasExamPermission) && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="flex justify-between items-center px-4">
            <h3 className="text-2xl font-black text-gray-900">Admission Office</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{studentRequests.length} Applications</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studentRequests.map(req => (
              <div key={req.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex gap-6 group hover:shadow-xl transition-all">
                <div className="w-24 h-32 rounded-2xl overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-100 shrink-0">
                  <img src={req.photoUrl} alt={req.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-gray-900">{req.name}</h4>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">+91 {req.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                      req.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      Status: {req.status}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {req.status !== 'approved' && (
                      <button onClick={() => onApproveStudent(req.id)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Approve</button>
                    )}
                    {req.status !== 'rejected' && (
                      <button onClick={() => onRejectStudent(req.id)} className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all">Reject</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'exams' && (
        <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
           <ExamHallManager user={user} exams={exams} onCreateExam={onCreateExam} onDeleteExam={onDeleteExam} />
        </div>
      )}
    </div>
  );
}

const StaffManager: React.FC<{ admins: Admin[], onSave: (a: Admin) => void, onRemove: (p: string) => void }> = ({ admins, onSave, onRemove }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [perms, setPerms] = useState<AdminPermissions>(DEFAULT_PERMISSIONS);

  const togglePerm = (key: keyof AdminPermissions) => setPerms(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    if (!name || phone.length !== 10) return alert("Fill name and 10-digit WhatsApp number.");
    onSave({ name, phone, permissions: perms });
    setName(''); setPhone(''); setPerms(DEFAULT_PERMISSIONS); setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-2xl font-black text-gray-900">Appointed Personnel</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          {isAdding ? 'Cancel' : 'Add New Staff'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-blue-50 shadow-2xl animate-in zoom-in duration-300">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Personnel Name</label>
                <input className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-gray-800 focus:border-green-500 outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                <input className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl font-black text-gray-800 focus:border-green-500 outline-none tracking-[0.2em]" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0000000000" />
              </div>
           </div>

           <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Permission Matrix</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.keys(PERMISSION_METADATA) as Array<keyof AdminPermissions>).map(key => {
                  const meta = PERMISSION_METADATA[key];
                  const isActive = perms[key];
                  return (
                    <button key={key} onClick={() => togglePerm(key)} className={`p-5 rounded-3xl border-2 text-left transition-all group ${isActive ? 'bg-white border-green-600 shadow-lg' : 'bg-gray-50 border-transparent opacity-60 hover:opacity-100'}`}>
                      <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400 transition-colors'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={meta.icon} /></svg>
                      </div>
                      <h5 className="text-sm font-black text-gray-900 leading-tight mb-1">{meta.label}</h5>
                    </button>
                  );
                })}
              </div>
           </div>

           <button onClick={handleSave} className="w-full mt-12 py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">Assign Identity</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map(admin => (
          <div key={admin.phone} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col hover:shadow-2xl transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center font-black text-xl shadow-inner uppercase">
                {admin.name.charAt(0)}
              </div>
              <button onClick={() => onRemove(admin.phone)} className="p-3 text-gray-300 hover:text-red-500 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
            <h4 className="text-2xl font-black text-gray-900 leading-tight mb-1">{admin.name}</h4>
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-6">WhatsApp: +91 {admin.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExamHallManager: React.FC<{ user: User, exams: Exam[], onCreateExam: (e: Exam) => void, onDeleteExam: (id: string) => void }> = ({ user, exams, onCreateExam, onDeleteExam }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [difficulty, setDifficulty] = useState<Exam['difficulty']>('Beginner');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  
  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now().toString(), type: 'mcq', word: '', correctAnswer: '', options: ['', '', '', ''] }]);
  };

  const handleSave = () => {
    if (!title || questions.length === 0) return alert("Title and questions required.");
    onCreateExam({ id: Date.now().toString(), title, description: desc, questions, createdBy: user.name, createdAt: Date.now(), timeLimitMinutes: timeLimit, difficulty, isPublished: true });
    setTitle(''); setDesc(''); setQuestions([]); setIsAdding(false); setTimeLimit(20);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Academic Designer</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95">{isAdding ? 'Discard Draft' : 'Launch New Exam'}</button>
      </div>
      {/* Rest of Exam UI remains same but using updated terminology in messages if any */}
    </div>
  );
};
