import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Word, User, Admin, Book, PublicUser, GalleryImage, Song, Message, Video, StudentRequest, Exam, ExamSubmission, OfflinePack } from './types';
import { INITIAL_WORDS } from './constants';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import WordList from './components/WordList';
import WordFormModal from './components/WordFormModal';
import AdminPanel from './components/AdminPanel';
import SignInPage from './components/SignInPage';
import BookSection from './components/BookSection';
import BookFormModal from './components/BookFormModal';
import GallerySection from './components/GallerySection';
import GalleryFormModal from './components/GalleryFormModal';
import SongSection from './components/SongSection';
import SongFormModal from './components/SongFormModal';
import VideoSection from './components/VideoSection';
import VideoFormModal from './components/VideoFormModal';
import WelcomeScreen from './components/WelcomeScreen';
import RegisterModal from './components/RegisterModal';
import CommunityChoiceModal from './components/CommunityChoiceModal';
import StaffChoiceModal from './components/StaffChoiceModal';
import StudentRegisterModal from './components/StudentRegisterModal';
import StudentDashboard from './components/StudentDashboard';
import MessageCenter from './components/MessageCenter';
import ProfileSection from './components/ProfileSection';
import PublicStatsHeader from './components/PublicStatsHeader';
import OfflineCenter from './components/OfflineCenter';
import WikiScholar from './components/WikiScholar';
import PronunciationPracticeModal from './components/PronunciationPracticeModal';
import { syncWordsToCloud, fetchWordsFromCloud } from './services/sheetService';
import { generateWordImage } from './services/geminiService';
import { submitToFormspree } from './services/formspreeService';

const OWNER_PHONE = '6901543900';
const OWNER_NAME = 'Developer';

const INITIAL_STARTERS = [
  "Origins of Tai Khamyang",
  "Traditional Chang-Ghar architecture",
  "Poy-Sang-Ken festival",
  "Tai food culture in Assam",
  "Khamyang language preservation",
  "Buddhist Vihars of Tinsukia"
];

const App: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<PublicUser[]>([]);
  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [offlinePacks, setOfflinePacks] = useState<OfflinePack[]>([]);
  const [scholarStarters, setScholarStarters] = useState<string[]>(INITIAL_STARTERS);
  
  const [activeTab, setActiveTab] = useState<'dictionary' | 'library' | 'gallery' | 'songs' | 'profile' | 'videos' | 'dashboard' | 'offline' | 'wiki'>('dictionary');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [landingView, setLandingView] = useState<'welcome' | 'signin'>('welcome');
  const [loginIntent, setLoginIntent] = useState<'public' | 'staff' | 'developer' | 'student'>('public');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [isBookModalOpen, setIsWordModalOpen_] = useState(false); // Helper to avoid duplicate var names in this quick context
  // Fix: Renamed setter to setIsBookModalOpenActual to resolve "Cannot find name 'setIsBookModalOpenActual'" errors
  const [isBookModalOpenActual, setIsBookModalOpenActual] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isStaffChoiceModalOpen, setIsStaffChoiceModalOpen] = useState(false);
  const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [practiceWord, setPracticeWord] = useState<Word | null>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | undefined>(undefined);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [admins, setAdmins] = useState<Admin[]>([]); 
  const [activeOtp, setActiveOtp] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedWords = localStorage.getItem('dictionary_words');
    const savedBooks = localStorage.getItem('dictionary_books');
    const savedGallery = localStorage.getItem('dictionary_gallery');
    const savedSongs = localStorage.getItem('dictionary_songs');
    const savedVideos = localStorage.getItem('dictionary_videos');
    const savedAdmins = localStorage.getItem('dictionary_admins');
    const savedUsers = localStorage.getItem('dictionary_registered_users');
    const savedStudents = localStorage.getItem('dictionary_student_requests');
    const savedMessages = localStorage.getItem('dictionary_messages');
    const savedExams = localStorage.getItem('dictionary_exams');
    const savedSubmissions = localStorage.getItem('dictionary_exam_submissions');
    const savedPacks = localStorage.getItem('dictionary_offline_packs');
    const savedSession = localStorage.getItem('dictionary_current_session');
    const savedStarters = localStorage.getItem('dictionary_scholar_starters');
    
    if (savedWords) {
      try {
        const parsed = JSON.parse(savedWords);
        setWords(Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_WORDS);
      } catch (e) { setWords(INITIAL_WORDS); }
    } else { setWords(INITIAL_WORDS); }

    if (savedBooks) try { setBooks(JSON.parse(savedBooks)); } catch (e) { setBooks([]); }
    if (savedGallery) try { setGallery(JSON.parse(savedGallery)); } catch (e) { setGallery([]); }
    if (savedSongs) try { setSongs(JSON.parse(savedSongs)); } catch (e) { setSongs([]); }
    if (savedVideos) try { setVideos(JSON.parse(savedVideos)); } catch (e) { setVideos([]); }
    if (savedAdmins) try { setAdmins(JSON.parse(savedAdmins)); } catch (e) { setAdmins([]); }
    if (savedUsers) try { setRegisteredUsers(JSON.parse(savedUsers)); } catch (e) { setRegisteredUsers([]); }
    if (savedStudents) try { setStudentRequests(JSON.parse(savedStudents)); } catch (e) { setStudentRequests([]); }
    if (savedMessages) try { setMessages(JSON.parse(savedMessages)); } catch (e) { setMessages([]); }
    if (savedExams) try { setExams(JSON.parse(savedExams)); } catch (e) { setExams([]); }
    if (savedSubmissions) try { setExamSubmissions(JSON.parse(savedSubmissions)); } catch (e) { setExamSubmissions([]); }
    if (savedPacks) try { setOfflinePacks(JSON.parse(savedPacks)); } catch (e) { setOfflinePacks([]); }
    if (savedStarters) try { setScholarStarters(JSON.parse(savedStarters)); } catch (e) { setScholarStarters(INITIAL_STARTERS); }
    if (savedSession) try { setCurrentUser(JSON.parse(savedSession)); } catch (e) { setCurrentUser(null); }
  }, []);

  useEffect(() => { localStorage.setItem('dictionary_words', JSON.stringify(words)); }, [words]);
  useEffect(() => { localStorage.setItem('dictionary_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('dictionary_gallery', JSON.stringify(gallery)); }, [gallery]);
  useEffect(() => { localStorage.setItem('dictionary_songs', JSON.stringify(songs)); }, [songs]);
  useEffect(() => { localStorage.setItem('dictionary_videos', JSON.stringify(videos)); }, [videos]);
  useEffect(() => { localStorage.setItem('dictionary_admins', JSON.stringify(admins)); }, [admins]);
  useEffect(() => { localStorage.setItem('dictionary_registered_users', JSON.stringify(registeredUsers)); }, [registeredUsers]);
  useEffect(() => { localStorage.setItem('dictionary_student_requests', JSON.stringify(studentRequests)); }, [studentRequests]);
  useEffect(() => { localStorage.setItem('dictionary_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('dictionary_exams', JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem('dictionary_exam_submissions', JSON.stringify(examSubmissions)); }, [examSubmissions]);
  useEffect(() => { localStorage.setItem('dictionary_offline_packs', JSON.stringify(offlinePacks)); }, [offlinePacks]);
  useEffect(() => { localStorage.setItem('dictionary_scholar_starters', JSON.stringify(scholarStarters)); }, [scholarStarters]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('dictionary_current_session', JSON.stringify(currentUser));
    else localStorage.removeItem('dictionary_current_session');
  }, [currentUser]);

  const handleSync = async () => {
    if (!isOnline) return alert("You are offline.");
    setIsSyncing(true);
    const success = await syncWordsToCloud(words);
    if (success) {
      const cloudWords = await fetchWordsFromCloud();
      if (cloudWords && cloudWords.length > 0) setWords(cloudWords);
      alert("Heritage Cloud Sync Complete.");
    } else {
      alert("Cloud Sync Failed. Please check Sheet URL.");
    }
    setIsSyncing(false);
  };

  const handleGenerateImage = async (wordId: string) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;
    const usePro = window.confirm("Would you like to generate a High-Quality (Pro) image? \n\nNote: This requires you to select your own API key.");
    if (usePro) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) await (window as any).aistudio.openSelectKey();
    }
    try {
      const imageUrl = await generateWordImage(word.english, usePro);
      if (imageUrl) {
        setWords(prev => prev.map(w => w.id === wordId ? { ...w, imageUrl } : w));
      } else { alert("Failed to paint the visual."); }
    } catch (err: any) {
      if (err.message === "APIKEY_MISSING") { alert("Authorization needed."); await (window as any).aistudio.openSelectKey(); }
    }
  };

  const handleSendMessage = (receiverId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: Date.now(),
      status: 'sent',
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleMarkAsRead = (senderId: string) => {
    if (!currentUser) return;
    setMessages(prev => prev.map(m => 
      (m.senderId === senderId && m.receiverId === currentUser.id) ? { ...m, isRead: true, status: 'seen' } : m
    ));
  };

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;
  }, [messages, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('dictionary_current_session');
    setCurrentUser(null);
    setIsLogoutModalOpen(false);
    setLandingView('welcome');
    setActiveTab('dictionary');
  };

  const handleCreateExam = (exam: Exam) => {
    setExams(prev => [exam, ...prev]);
    submitToFormspree("New Exam Created", exam);
    if (exam.isPublished) alert("Published to Student Hall.");
    else alert("Saved as private draft.");
  };

  const handleExamSubmit = (submission: ExamSubmission) => {
    setExamSubmissions(prev => [submission, ...prev]);
    submitToFormspree("Exam Submission", submission);
  };

  const handleWordSubmit = (data: Partial<Word>) => {
    if (editingWord) {
      setWords(prev => prev.map(w => w.id === editingWord.id ? { ...w, ...data } as Word : w));
      submitToFormspree("Word Updated", data);
    } else {
      const newWord: Word = { ...data, id: Date.now().toString(), createdAt: Date.now(), addedBy: currentUser?.name || 'Unknown', category: data.category || 'General', isOfflineReady: true } as Word;
      setWords(prev => [newWord, ...prev]);
      submitToFormspree("New Word Entry", newWord);
    }
    setIsWordModalOpen(false);
    setEditingWord(undefined);
  };

  const canEditDictionary = currentUser?.role === 'owner' || !!currentUser?.permissions?.dictionary;

  if (currentUser && currentUser.role === 'student') {
    return (
      <>
        <StudentDashboard 
          user={currentUser}
          words={words}
          books={books}
          videos={videos}
          exams={exams}
          submissions={examSubmissions}
          onExamSubmit={handleExamSubmit}
          onLogout={() => setIsLogoutModalOpen(true)}
        />
        {isLogoutModalOpen && (
          <LogoutConfirmModal onCancel={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      {!currentUser ? (
        landingView === 'welcome' ? (
          <>
            <WelcomeScreen 
              onJoinClick={() => setIsChoiceModalOpen(true)} 
              onStudentJoinClick={() => setIsStudentRegisterModalOpen(true)}
              onDevLoginClick={() => setIsStaffChoiceModalOpen(true)} 
            />
            {isChoiceModalOpen && <CommunityChoiceModal onClose={() => setIsChoiceModalOpen(false)} onRegisterSelect={() => { setIsChoiceModalOpen(false); setIsRegisterModalOpen(true); }} onLoginSelect={() => { setIsChoiceModalOpen(false); setLoginIntent('public'); setLandingView('signin'); }} />}
            {isStaffChoiceModalOpen && <StaffChoiceModal onClose={() => setIsStaffChoiceModalOpen(false)} onStaffSelect={() => { setIsStaffChoiceModalOpen(false); setLoginIntent('staff'); setLandingView('signin'); }} onDeveloperSelect={() => { setIsStaffChoiceModalOpen(false); setLoginIntent('developer'); setLandingView('signin'); }} />}
            {isRegisterModalOpen && <RegisterModal onClose={() => setIsRegisterModalOpen(false)} onRegister={(n, a, p) => {
              const cleanPhone = p.replace(/\D/g, '');
              const newUser: PublicUser = { id: cleanPhone, name: n, address: a, phone: cleanPhone, registeredAt: Date.now() };
              setRegisteredUsers(prev => [...prev, newUser]);
              submitToFormspree("Community Member Registered", newUser);
              setIsRegisterModalOpen(false);
              setRegistrationSuccess(true);
              setLoginIntent('public');
              setLandingView('signin');
            }} />}
            {isStudentRegisterModalOpen && <StudentRegisterModal onClose={() => setIsStudentRegisterModalOpen(false)} onRegister={(d) => {
               const cleanPhone = d.phone.replace(/\D/g, '');
               const newReq: StudentRequest = { ...d, id: `STU-${Date.now()}`, phone: cleanPhone, status: 'pending', requestedAt: Date.now(), canAccessExam: false };
               setStudentRequests(prev => [...prev, newReq]);
               submitToFormspree("Student Admission Request", newReq);
               alert("Admission request sent.");
            }} studentRequests={studentRequests} ownerPhone={OWNER_PHONE} onLoginRequested={() => { setLoginIntent('student'); setLandingView('signin'); setIsStudentRegisterModalOpen(false); }} />}
          </>
        ) : (
          <SignInPage onClose={() => { setLandingView('welcome'); setRegistrationSuccess(false); }} onLogin={(p, o) => {
            if (!activeOtp || o !== activeOtp) { alert("Invalid code."); return; }
            const cleanPhone = p.replace(/\D/g, '');
            const isOwnerNumber = cleanPhone.endsWith(OWNER_PHONE.slice(-10));
            if (loginIntent === 'developer' && isOwnerNumber) {
               setCurrentUser({ id: cleanPhone, username: cleanPhone, name: OWNER_NAME, role: 'owner', permissions: { dictionary: true, library: true, gallery: true, songs: true, videos: true, exams: true, heritage: true } });
               setActiveTab('dashboard');
            } else if (loginIntent === 'staff') {
              const staff = admins.find(a => a.phone.endsWith(cleanPhone.slice(-10)));
              if (staff) { setCurrentUser({ id: cleanPhone, username: cleanPhone, name: staff.name, role: 'admin', permissions: staff.permissions }); setActiveTab('dashboard'); }
              else if (isOwnerNumber) { setCurrentUser({ id: cleanPhone, username: cleanPhone, name: OWNER_NAME, role: 'owner', permissions: { dictionary: true, library: true, gallery: true, songs: true, videos: true, exams: true, heritage: true } }); setActiveTab('dashboard'); }
              else alert("Staff not found.");
            } else if (loginIntent === 'student') {
              const req = studentRequests.find(r => r.phone.endsWith(cleanPhone.slice(-10)));
              if (isOwnerNumber || (req && req.status === 'approved')) {
                setCurrentUser(isOwnerNumber ? { id: cleanPhone, username: cleanPhone, name: OWNER_NAME, role: 'student', studentStatus: 'approved', canAccessExam: true } : { id: req!.id, username: cleanPhone, name: req!.name, role: 'student', studentStatus: 'approved', canAccessExam: req!.canAccessExam });
                setActiveTab('dictionary');
              } else alert("Admission not approved.");
            } else {
              const u = registeredUsers.find(usr => usr.phone.endsWith(cleanPhone.slice(-10)));
              if (u || isOwnerNumber) { setCurrentUser({ id: cleanPhone, username: cleanPhone, name: u?.name || OWNER_NAME, role: 'viewer' }); setActiveTab('dictionary'); }
              else alert("User not registered.");
            }
          }} expectedOtp={activeOtp} onOtpGenerated={setActiveOtp} intent={loginIntent} showSuccess={registrationSuccess} />
        )
      ) : (
        <>
          <Navbar user={currentUser} activeTab={activeTab} onTabChange={setActiveTab} onLoginClick={() => {}} onLogout={() => setIsLogoutModalOpen(true)} onSyncClick={handleSync} onMessagesClick={() => setIsMessageCenterOpen(true)} isSyncing={isSyncing} isOnline={isOnline} unreadCount={unreadCount} />
          <main className="max-w-6xl mx-auto px-4 mt-8">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter capitalize">
                {activeTab === 'dashboard' ? (currentUser.role === 'owner' ? 'Developer Hub' : 'Staff Portal') : (activeTab === 'wiki' ? 'Scholar AI' : activeTab)}
              </h1>
              {activeTab === 'dictionary' && canEditDictionary && <button onClick={() => setIsWordModalOpen(true)} className="mt-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all">Add New Word</button>}
            </header>

            {activeTab === 'dashboard' && (currentUser.role === 'owner' || currentUser.role === 'admin') && (
              <AdminPanel 
                user={currentUser} admins={admins} registeredUsers={registeredUsers} studentRequests={studentRequests} exams={exams}
                onSaveAdmin={(a) => {
                  setAdmins(prev => [...prev.filter(p => p.phone !== a.phone), a]);
                  submitToFormspree("Staff Appointed/Updated", a);
                }} 
                onRemoveAdmin={(p) => setAdmins(prev => prev.filter(a => a.phone !== p))} 
                onUpdateUser={(u) => setRegisteredUsers(prev => prev.map(usr => usr.id === u.id ? u : usr))}
                onDeleteUser={(id) => setRegisteredUsers(prev => prev.filter(u => u.id !== id))}
                onApproveStudent={(id) => setStudentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))}
                onRejectStudent={(id) => setStudentRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r))}
                onToggleExamAccess={(id) => setStudentRequests(prev => prev.map(r => r.id === id ? { ...r, canAccessExam: !r.canAccessExam } : r))}
                onCreateExam={handleCreateExam} onDeleteExam={(id) => setExams(prev => prev.filter(e => e.id !== id))}
                stats={{ words: words.length, books: books.length, photos: gallery.length, songs: songs.length, videos: videos.length }}
              />
            )}

            {activeTab === 'dictionary' && (
              <>
                <PublicStatsHeader stats={{ words: words.length, books: books.length, photos: gallery.length, songs: songs.length, videos: videos.length }} />
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <WordList 
                  words={words.filter(w => w.english.toLowerCase().includes(searchQuery.toLowerCase()) || w.assamese.includes(searchQuery) || w.taiKhamyang.toLowerCase().includes(searchQuery.toLowerCase()))} 
                  canEdit={canEditDictionary} 
                  canDelete={currentUser.role === 'owner'} 
                  onEdit={(w) => {setEditingWord(w); setIsWordModalOpen(true);}} 
                  onDelete={(id) => setWords(prev => prev.filter(w => w.id !== id))} 
                  onGenerateImage={handleGenerateImage} 
                  onPracticeSpeech={(w) => setPracticeWord(w)}
                  isOnline={isOnline} 
                />
              </>
            )}

            {activeTab === 'library' && <BookSection books={books} user={currentUser} onAddClick={() => setIsBookModalOpenActual(true)} onEditClick={(b) => { setEditingBook(b); setIsBookModalOpenActual(true); }} onDeleteClick={(id) => setBooks(prev => prev.filter(b => b.id !== id))} />}
            {activeTab === 'gallery' && <GallerySection images={gallery} user={currentUser} onAddClick={() => setIsGalleryModalOpen(true)} onDeleteClick={(id) => setGallery(prev => prev.filter(i => i.id !== id))} />}
            {activeTab === 'videos' && <VideoSection videos={videos} user={currentUser} onAddClick={() => setIsVideoModalOpen(true)} onDeleteClick={(id) => setVideos(prev => prev.filter(v => v.id !== id))} />}
            {activeTab === 'songs' && <SongSection songs={songs} user={currentUser} onAddClick={() => setIsSongModalOpen(true)} onDeleteClick={(id) => setSongs(prev => prev.filter(s => s.id !== id))} />}
            {activeTab === 'profile' && <ProfileSection currentUser={currentUser} registeredUsers={registeredUsers} onUpdateProfile={(d) => {
              setRegisteredUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...d } : u));
              submitToFormspree("Profile Updated", d);
            }} />}
            {activeTab === 'wiki' && <WikiScholar user={currentUser} starters={scholarStarters} onUpdateStarters={(s) => {
              setScholarStarters(s);
              submitToFormspree("Scholar Starters Customized", { starters: s });
            }} isOnline={isOnline} />}
            {activeTab === 'offline' && <OfflineCenter words={words} packs={offlinePacks} onTogglePack={(id) => setOfflinePacks(prev => prev.map(p => p.id === id ? { ...p, isDownloaded: !p.isDownloaded } : p))} isOnline={isOnline} />}
          </main>

          {isMessageCenterOpen && <MessageCenter currentUser={currentUser} users={registeredUsers} messages={messages} dictionary={words} onSendMessage={handleSendMessage} onMarkAsRead={handleMarkAsRead} onClose={() => setIsMessageCenterOpen(false)} />}
          {isLogoutModalOpen && <LogoutConfirmModal onCancel={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} />}
          {practiceWord && <PronunciationPracticeModal word={practiceWord} onClose={() => setPracticeWord(null)} />}
          
          {isWordModalOpen && <WordFormModal onClose={() => { setIsWordModalOpen(false); setEditingWord(undefined); }} onSubmit={handleWordSubmit} canDelete={currentUser.role === 'owner'} existingWords={words} isOnline={isOnline} initialData={editingWord} />}
          {isBookModalOpenActual && <BookFormModal onClose={() => { setIsBookModalOpenActual(false); setEditingBook(undefined); }} onSubmit={(d) => {
            if (editingBook) {
              setBooks(prev => prev.map(b => b.id === editingBook.id ? { ...b, ...d } as Book : b));
              submitToFormspree("Library Book Updated", d);
            } else {
              const newBook = { ...d, id: Date.now().toString(), createdAt: Date.now(), addedBy: currentUser.name } as Book;
              setBooks(prev => [newBook, ...prev]);
              submitToFormspree("New Library Book Uploaded", newBook);
            }
            setIsBookModalOpenActual(false); setEditingBook(undefined);
          }} initialData={editingBook} />}
          {isGalleryModalOpen && <GalleryFormModal onClose={() => setIsGalleryModalOpen(false)} onSubmit={(d) => {
            const newImage = { ...d, id: Date.now().toString(), createdAt: Date.now(), addedBy: currentUser.name } as GalleryImage;
            setGallery(prev => [newImage, ...prev]);
            submitToFormspree("New Photo Added to Gallery", newImage);
          }} />}
          {isSongModalOpen && <SongFormModal onClose={() => setIsSongModalOpen(false)} onSubmit={(d) => {
            const newSong = { ...d, id: Date.now().toString(), createdAt: Date.now(), addedBy: currentUser.name } as Song;
            setSongs(prev => [newSong, ...prev]);
            submitToFormspree("New Song Uploaded", newSong);
          }} />}
          {isVideoModalOpen && <VideoFormModal onClose={() => setIsVideoModalOpen(false)} onSubmit={(d) => {
            const newVideo = { ...d, id: Date.now().toString(), createdAt: Date.now(), addedBy: currentUser.name } as Video;
            setVideos(prev => [newVideo, ...prev]);
            submitToFormspree("New Video Featured", newVideo);
          }} />}
        </>
      )}
    </div>
  );
};

const LogoutConfirmModal: React.FC<{ onCancel: () => void, onConfirm: () => void }> = ({ onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white rounded-[2.5rem] w-full max-sm shadow-2xl p-10 text-center transform transition-all animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
      </div>
      <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Sign Out?</h2>
      <p className="text-gray-500 font-medium mb-10 leading-relaxed px-4">Are you sure you want to end your current session?</p>
      <div className="space-y-3">
        <button onClick={onConfirm} className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-red-200">Yes, Logout Now</button>
        <button onClick={onCancel} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl font-black text-sm transition-all">Cancel</button>
      </div>
    </div>
  </div>
);

export default App;