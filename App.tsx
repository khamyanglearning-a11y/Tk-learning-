
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
import PronunciationPracticeModal from './components/PronunciationPracticeModal';
import AboutSection from './components/AboutSection';
import MessageCenter from './components/MessageCenter';
import ProfileSection from './components/ProfileSection';
import PublicStatsHeader from './components/PublicStatsHeader';
import OfflineCenter from './components/OfflineCenter';
import { syncWordsToCloud, fetchWordsFromCloud } from './services/sheetService';

const OWNER_PHONE = '6901543900';
const OWNER_NAME = 'Developer';

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
  
  const [activeTab, setActiveTab] = useState<'dictionary' | 'library' | 'gallery' | 'songs' | 'about' | 'profile' | 'videos' | 'dashboard' | 'offline'>('dictionary');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [landingView, setLandingView] = useState<'welcome' | 'signin'>('welcome');
  const [loginIntent, setLoginIntent] = useState<'public' | 'staff' | 'developer' | 'student'>('public');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isStudentRegisterModalOpen, setIsStudentRegisterModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isStaffChoiceModalOpen, setIsStaffChoiceModalOpen] = useState(false);
  const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false);
  const [practicingWord, setPracticingWord] = useState<Word | null>(null);
  
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
  useEffect(() => {
    if (currentUser) localStorage.setItem('dictionary_current_session', JSON.stringify(currentUser));
    else localStorage.removeItem('dictionary_current_session');
  }, [currentUser]);

  const handleOfflineToggle = (packId: string) => {
    setOfflinePacks(prev => {
      const isCurrentlyDownloaded = prev.find(p => p.id === packId)?.isDownloaded;
      const updated = prev.map(p => p.id === packId ? { ...p, isDownloaded: !p.isDownloaded } : p);
      
      // Update words' offline status based on packs
      const updatedWords = words.map(w => {
        const belongsToPack = w.category === packId || packId === 'all';
        if (belongsToPack) {
          return { ...w, isOfflineReady: !isCurrentlyDownloaded };
        }
        return w;
      });
      setWords(updatedWords);
      return updated;
    });
  };

  const handleRegister = (name: string, address: string, phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const newUser: PublicUser = { id: cleanPhone, name, address, phone: cleanPhone, registeredAt: Date.now() };
    setRegisteredUsers(prev => [...prev, newUser]);
    setIsRegisterModalOpen(false);
    setRegistrationSuccess(true);
    setLoginIntent('public');
    setLandingView('signin');
  };

  const handleStudentRegister = (data: { name: string, phone: string, email: string, address: string, photoUrl: string }) => {
    const cleanPhone = data.phone.replace(/\D/g, '');
    const newRequest: StudentRequest = {
      ...data,
      id: `STU-${Date.now()}`,
      phone: cleanPhone,
      status: 'pending',
      requestedAt: Date.now(),
      canAccessExam: false
    };
    setStudentRequests(prev => [...prev, newRequest]);
    alert("Admission request sent to Developer. Please wait for approval before logging in.");
  };

  const handleLogin = (phoneNumber: string, otp: string) => {
    if (!activeOtp || otp !== activeOtp) { alert("Invalid code."); return; }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const isOwnerNumber = cleanPhone.endsWith(OWNER_PHONE.slice(-10));

    if (loginIntent === 'developer') {
      if (isOwnerNumber) {
        setCurrentUser({ id: cleanPhone, username: cleanPhone, name: OWNER_NAME, role: 'owner', permissions: { dictionary: true, library: true, gallery: true, songs: true, videos: true, heritage: true, exams: true } });
        setActiveTab('dashboard');
      } else { alert("Access Denied."); return; }
    } else if (loginIntent === 'staff') {
      const foundAdmin = admins.find(a => a.phone.endsWith(cleanPhone.slice(-10)));
      if (foundAdmin) {
        setCurrentUser({ id: cleanPhone, username: cleanPhone, name: foundAdmin.name, role: 'admin', permissions: foundAdmin.permissions });
        setActiveTab('dictionary');
      } else if (isOwnerNumber) {
        setCurrentUser({ id: cleanPhone, username: cleanPhone, name: OWNER_NAME, role: 'owner', permissions: { dictionary: true, library: true, gallery: true, songs: true, videos: true, heritage: true, exams: true } });
        setActiveTab('dashboard');
      } else { alert("Staff access denied."); return; }
    } else if (loginIntent === 'student') {
      if (isOwnerNumber) {
        setCurrentUser({ id: cleanPhone, username: cleanPhone, name: OWNER_NAME + " (Admin-Student)", role: 'student', studentStatus: 'approved', canAccessExam: true });
        setActiveTab('dictionary');
        return;
      }

      const foundStudent = studentRequests.find(r => r.phone.endsWith(cleanPhone.slice(-10)));
      if (foundStudent) {
        if (foundStudent.status === 'approved') {
          setCurrentUser({ id: foundStudent.id, username: cleanPhone, name: foundStudent.name, role: 'student', studentStatus: 'approved', canAccessExam: foundStudent.canAccessExam });
          setActiveTab('dictionary');
        } else if (foundStudent.status === 'pending') {
          alert("Your admission is still pending review by the Developer.");
          return;
        } else {
          alert("Your admission request was not approved.");
          return;
        }
      } else {
        alert("Student record not found. Please submit admission form first.");
        return;
      }
    } else {
      const foundUser = registeredUsers.find(u => u.phone.endsWith(cleanPhone.slice(-10)));
      if (foundUser) {
        setCurrentUser({ id: foundUser.id, username: cleanPhone, name: foundUser.name, role: 'viewer' });
        setActiveTab('dictionary');
      } else if (isOwnerNumber) {
        setCurrentUser({ id: cleanPhone, username: cleanPhone, name: OWNER_NAME, role: 'viewer' });
        setActiveTab('dictionary');
      } else { alert("User not registered."); return; }
    }
  };

  const handleApproveStudent = (requestId: string) => {
    setStudentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
    alert("Student approved successfully.");
  };

  const handleRejectStudent = (requestId: string) => {
    if (window.confirm("Reject this student application?")) {
      setStudentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    }
  };

  const handleToggleExamAccess = (requestId: string) => {
    setStudentRequests(prev => prev.map(r => r.id === requestId ? { ...r, canAccessExam: !r.canAccessExam } : r));
  };

  const handleCreateExam = (exam: Exam) => {
    setExams(prev => [exam, ...prev]);
    alert("Exam published to Exam Hall.");
  };

  const handleExamSubmit = (submission: ExamSubmission) => {
    setExamSubmissions(prev => [submission, ...prev]);
    alert("Exam answers submitted for review.");
  };

  const handleWordSubmit = (data: Partial<Word>) => {
    if (editingWord) {
      setWords(prev => prev.map(w => w.id === editingWord.id ? { ...w, ...data } as Word : w));
    } else {
      const newWord: Word = {
        ...data,
        id: Date.now().toString(),
        createdAt: Date.now(),
        addedBy: currentUser?.name || 'Unknown',
        category: data.category || 'General',
        isOfflineReady: true // Manually added words are offline by default
      } as Word;
      setWords(prev => [newWord, ...prev]);
    }
    setIsWordModalOpen(false);
    setEditingWord(undefined);
  };

  const handleBookSubmit = (data: Partial<Book>) => {
    if (editingBook) {
      setBooks(prev => prev.map(b => b.id === editingBook.id ? { ...b, ...data } as Book : b));
    } else {
      const newBook: Book = {
        ...data,
        id: Date.now().toString(),
        createdAt: Date.now(),
        addedBy: currentUser?.name || 'Unknown'
      } as Book;
      setBooks(prev => [newBook, ...prev]);
    }
    setIsBookModalOpen(false);
    setEditingBook(undefined);
  };

  const handleGallerySubmit = (data: { url: string; caption: string }) => {
    const newImage: GalleryImage = {
      ...data,
      id: Date.now().toString(),
      createdAt: Date.now(),
      addedBy: currentUser?.name || 'Unknown'
    };
    setGallery(prev => [newImage, ...prev]);
    setIsGalleryModalOpen(false);
  };

  const handleSongSubmit = (data: { title: string; artist: string; audioUrl: string }) => {
    const newSong: Song = {
      ...data,
      id: Date.now().toString(),
      createdAt: Date.now(),
      addedBy: currentUser?.name || 'Unknown'
    };
    setSongs(prev => [newSong, ...prev]);
    setIsSongModalOpen(false);
  };

  const handleVideoSubmit = (data: { title: string; youtubeUrl: string }) => {
    const newVideo: Video = {
      ...data,
      id: Date.now().toString(),
      createdAt: Date.now(),
      addedBy: currentUser?.name || 'Unknown'
    };
    setVideos(prev => [newVideo, ...prev]);
    setIsVideoModalOpen(false);
  };

  const handleUpdateUser = (updatedUser: PublicUser) => {
    setRegisteredUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Permanently remove this user?")) {
      setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleCloudSync = async () => {
    if (!currentUser || currentUser.role !== 'owner') return;
    if (!isOnline) return alert("Offline.");
    setIsSyncing(true);
    const success = await syncWordsToCloud(words);
    setIsSyncing(false);
    if (success) alert("Synced.");
  };

  const canEditDictionary = currentUser?.role === 'owner' || !!currentUser?.permissions?.dictionary;

  if (currentUser && currentUser.role === 'student') {
    return (
      <StudentDashboard 
        user={currentUser}
        words={words}
        books={books}
        videos={videos}
        exams={exams}
        submissions={examSubmissions}
        onExamSubmit={handleExamSubmit}
        onLogout={() => { setCurrentUser(null); setLandingView('welcome'); }}
      />
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
            {isRegisterModalOpen && <RegisterModal onClose={() => setIsRegisterModalOpen(false)} onRegister={handleRegister} />}
            {isStudentRegisterModalOpen && (
              <StudentRegisterModal 
                onClose={() => setIsStudentRegisterModalOpen(false)} 
                onRegister={handleStudentRegister} 
                studentRequests={studentRequests}
                ownerPhone={OWNER_PHONE}
                onLoginRequested={() => { setLoginIntent('student'); setLandingView('signin'); setIsStudentRegisterModalOpen(false); }}
              />
            )}
          </>
        ) : (
          <SignInPage onClose={() => { setLandingView('welcome'); setRegistrationSuccess(false); }} onLogin={handleLogin} expectedOtp={activeOtp} onOtpGenerated={setActiveOtp} intent={loginIntent} showSuccess={registrationSuccess} />
        )
      ) : (
        <>
          <Navbar 
            user={currentUser} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onLoginClick={() => {}} 
            onLogout={() => setCurrentUser(null)} 
            onSyncClick={handleCloudSync} 
            onMessagesClick={() => setIsMessageCenterOpen(true)} 
            isSyncing={isSyncing} 
            isOnline={isOnline} 
            unreadCount={messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length} 
          />
          <main className="max-w-6xl mx-auto px-4 mt-8">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter capitalize">
                {activeTab === 'dashboard' ? 'Developer Dashboard' : activeTab === 'offline' ? 'Offline Manager' : activeTab}
              </h1>
              {activeTab === 'dictionary' && canEditDictionary && (
                <button 
                  onClick={() => setIsWordModalOpen(true)}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 active:scale-95 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  Add New Word
                </button>
              )}
            </header>
            
            {activeTab === 'dashboard' && currentUser.role === 'owner' && (
              <AdminPanel 
                user={currentUser}
                admins={admins} 
                registeredUsers={registeredUsers}
                studentRequests={studentRequests}
                exams={exams}
                onSaveAdmin={(a) => setAdmins(prev => [...prev.filter(p => p.phone !== a.phone), a])} 
                onRemoveAdmin={(p) => setAdmins(prev => prev.filter(a => a.phone !== p))} 
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onApproveStudent={handleApproveStudent}
                onRejectStudent={handleRejectStudent}
                onToggleExamAccess={handleToggleExamAccess}
                onCreateExam={handleCreateExam}
                onDeleteExam={(id) => setExams(prev => prev.filter(e => e.id !== id))}
                stats={{
                  words: words.length,
                  books: books.length,
                  photos: gallery.length,
                  songs: songs.length,
                  videos: videos.length
                }}
              />
            )}

            {activeTab === 'dictionary' && (
              <>
                <PublicStatsHeader 
                  stats={{
                    words: words.length,
                    books: books.length,
                    photos: gallery.length,
                    songs: songs.length,
                    videos: videos.length
                  }} 
                />
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <WordList 
                  words={words.filter(w => 
                    w.english.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    w.assamese.includes(searchQuery) ||
                    w.taiKhamyang.toLowerCase().includes(searchQuery.toLowerCase())
                  )} 
                  canEdit={canEditDictionary} 
                  canDelete={currentUser.role === 'owner'} 
                  onEdit={(w) => {setEditingWord(w); setIsWordModalOpen(true);}} 
                  onDelete={(id) => setWords(prev => prev.filter(w => w.id !== id))} 
                  onGenerateImage={() => Promise.resolve()} 
                  onPractice={setPracticingWord} 
                  isOnline={isOnline} 
                />
              </>
            )}
            
            {activeTab === 'library' && <BookSection books={books} user={currentUser} onAddClick={() => setIsBookModalOpen(true)} onEditClick={(b) => { setEditingBook(b); setIsBookModalOpen(true); }} onDeleteClick={(id) => setBooks(prev => prev.filter(b => b.id !== id))} />}
            {activeTab === 'gallery' && <GallerySection images={gallery} user={currentUser} onAddClick={() => setIsStudentRegisterModalOpen(true)} onDeleteClick={(id) => setGallery(prev => prev.filter(i => i.id !== id))} />}
            {activeTab === 'about' && <AboutSection isOnline={isOnline} />}
            {activeTab === 'videos' && <VideoSection videos={videos} user={currentUser} onAddClick={() => setIsVideoModalOpen(true)} onDeleteClick={(id) => setVideos(prev => prev.filter(v => v.id !== id))} />}
            {activeTab === 'songs' && <SongSection songs={songs} user={currentUser} onAddClick={() => setIsSongModalOpen(true)} onDeleteClick={(id) => setSongs(prev => prev.filter(s => s.id !== id))} />}
            {activeTab === 'profile' && <ProfileSection currentUser={currentUser} registeredUsers={registeredUsers} onUpdateProfile={() => {}} />}
            {activeTab === 'offline' && (
              <OfflineCenter 
                words={words} 
                packs={offlinePacks} 
                onTogglePack={handleOfflineToggle}
                isOnline={isOnline} 
              />
            )}
          </main>
          
          {isMessageCenterOpen && <MessageCenter currentUser={currentUser} users={registeredUsers} messages={messages} dictionary={words} onSendMessage={() => {}} onMarkAsRead={() => {}} onClose={() => setIsMessageCenterOpen(false)} />}
          {practicingWord && <PronunciationPracticeModal word={practicingWord} onClose={() => setPracticingWord(null)} />}
          
          {isWordModalOpen && <WordFormModal onClose={() => { setIsWordModalOpen(false); setEditingWord(undefined); }} onSubmit={handleWordSubmit} canDelete={currentUser.role === 'owner'} existingWords={words} isOnline={isOnline} initialData={editingWord} />}
          {isBookModalOpen && <BookFormModal onClose={() => { setIsBookModalOpen(false); setEditingBook(undefined); }} onSubmit={handleBookSubmit} initialData={editingBook} />}
          {isGalleryModalOpen && <GalleryFormModal onClose={() => setIsGalleryModalOpen(false)} onSubmit={handleGallerySubmit} />}
          {isSongModalOpen && <SongFormModal onClose={() => setIsSongModalOpen(false)} onSubmit={handleSongSubmit} />}
          {isVideoModalOpen && <VideoFormModal onClose={() => setIsVideoModalOpen(false)} onSubmit={handleVideoSubmit} />}
        </>
      )}
    </div>
  );
};

export default App;
