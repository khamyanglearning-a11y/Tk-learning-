
import React, { useState } from 'react';
import { User, Word, Book, Video, Exam, ExamSubmission } from '../types';
import WordList from './WordList';
import BookSection from './BookSection';
import VideoSection from './VideoSection';

interface StudentDashboardProps {
  user: User;
  words: Word[];
  books: Book[];
  videos: Video[];
  exams: Exam[];
  submissions: ExamSubmission[];
  onExamSubmit: (submission: ExamSubmission) => void;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  user, words, books, videos, exams, submissions, onExamSubmit, onLogout 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'live' | 'learning' | 'library' | 'exam' | 'videos'>('learning');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Active Exam state
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string, answer: string }[]>([]);

  const navItems = [
    { id: 'live', label: 'Live Class', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'learning', label: 'Tai Learning', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
    { id: 'library', label: 'Book Store', icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
    { id: 'exam', label: 'Exam Hall', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'videos', label: 'Learning Video', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' }
  ];

  const startExam = (exam: Exam) => {
    setTakingExam(exam);
    setCurrentQuestionIndex(0);
    setAnswers(exam.questions.map(q => ({ questionId: q.id, answer: '' })));
  };

  const handleAnswerChange = (val: string) => {
    const qId = takingExam!.questions[currentQuestionIndex].id;
    setAnswers(prev => prev.map(a => a.questionId === qId ? { ...a, answer: val } : a));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < takingExam!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitExam = () => {
    if (!window.confirm("Submit your answers now?")) return;
    const submission: ExamSubmission = {
      id: Date.now().toString(),
      examId: takingExam!.id,
      studentId: user.id,
      studentName: user.name,
      answers,
      submittedAt: Date.now()
    };
    onExamSubmit(submission);
    setTakingExam(null);
  };

  const hasSubmitted = (examId: string) => submissions.some(s => s.examId === examId && s.studentId === user.id);

  if (takingExam) {
    const question = takingExam.questions[currentQuestionIndex];
    return (
      <div className="min-h-screen bg-white p-6 md:p-20 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-12">
          <header className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{takingExam.title}</h2>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {takingExam.questions.length}</p>
            </div>
            <button onClick={() => setTakingExam(null)} className="p-3 text-gray-400 hover:text-gray-900"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
          </header>

          <div className="bg-gray-50 rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-sm space-y-10 text-center animate-in zoom-in duration-300">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-100">
                <button onClick={() => { if (question.audioUrl) { const a = new Audio(question.audioUrl); a.play(); } }}>
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                </button>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Listening Test</h3>
                <p className="text-sm text-gray-400 font-medium">Listen to the audio and write the meaning of the word.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Your Answer</label>
              <input 
                className="w-full px-8 py-5 bg-white border-2 border-transparent focus:border-blue-500 rounded-3xl outline-none text-2xl font-black text-center shadow-sm"
                placeholder="Type here..."
                autoFocus
                value={answers.find(a => a.questionId === question.id)?.answer || ''}
                onChange={e => handleAnswerChange(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center pt-8">
              <button disabled={currentQuestionIndex === 0} onClick={prevQuestion} className="px-8 py-4 bg-gray-200 text-gray-500 rounded-2xl font-black disabled:opacity-20">Back</button>
              {currentQuestionIndex === takingExam.questions.length - 1 ? (
                <button onClick={submitExam} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl">Finish Exam</button>
              ) : (
                <button onClick={nextQuestion} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl">Next Word</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col md:flex-row relative">
      <header className="md:hidden bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black shadow-md">S</div>
          <span className="font-black text-gray-900 tracking-tighter">Student Portal</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-emerald-50 rounded-xl transition-colors text-emerald-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </header>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] md:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-emerald-100 flex flex-col z-[60] transform transition-transform duration-300 ease-out md:translate-x-0 md:static md:z-20 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-emerald-50 flex flex-col relative">
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200">S</div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Student Portal</h2>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Learning Batch 2024</p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3 border border-emerald-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-emerald-600 border border-emerald-200 overflow-hidden">{user.studentStatus === 'approved' ? <span className="text-lg">🎓</span> : user.name.charAt(0)}</div>
            <div className="min-w-0">
              <p className="font-black text-sm text-gray-900 truncate">{user.name}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Student ID: {user.id.slice(-5)}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveSubTab(item.id as any); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all ${activeSubTab === item.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-700'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-emerald-50">
          <button onClick={onLogout} className="w-full py-4 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-[calc(100vh-64px)] md:h-screen custom-scrollbar">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-2"><span className="w-4 h-[2px] bg-emerald-600"></span>Academic Dashboard</div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter capitalize">{activeSubTab.replace(/([A-Z])/g, ' $1')}</h1>
          <p className="text-gray-500 font-medium mt-1">
            {activeSubTab === 'live' && "Join your daily live Tai language sessions."}
            {activeSubTab === 'learning' && "Master the Tai Khamyang vocabulary."}
            {activeSubTab === 'library' && "Read and download exclusive Tai literature."}
            {activeSubTab === 'exam' && "Test your knowledge and earn certification."}
            {activeSubTab === 'videos' && "Watch high-quality educational videos."}
          </p>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeSubTab === 'live' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col items-center justify-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                <div className="relative z-10 space-y-6">
                  <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl animate-pulse"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                  <h2 className="text-3xl font-black text-white">Join Live Classroom</h2>
                  <p className="text-gray-400 max-w-sm mx-auto font-medium">Class starting soon! Make sure your camera and microphone are working.</p>
                  <button className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-emerald-900/40">Connect Now</button>
                </div>
              </div>
              <div className="bg-white rounded-[3rem] p-8 border border-emerald-100 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-gray-900">Class Schedule</h3>
                <div className="space-y-4">
                  {[{ title: "Introduction to Tai Scripts", time: "10:00 AM", instructor: "Dev", date: "Today" }, { title: "Traditional Grammar", time: "02:30 PM", instructor: "Dev", date: "Today" }, { title: "Ancient Tai History", time: "11:00 AM", instructor: "Dev", date: "Tomorrow" }].map((cls, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-emerald-50/50 rounded-2xl border border-emerald-50 transition-all hover:bg-emerald-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-black text-xs shadow-sm border border-emerald-100">{cls.time.split(' ')[0]}</div>
                        <div>
                          <h4 className="font-black text-gray-900 text-sm">{cls.title}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cls.instructor} • {cls.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'learning' && <WordList words={words} canEdit={false} canDelete={false} onEdit={() => {}} onDelete={() => {}} onGenerateImage={async () => {}} onPractice={() => {}} isOnline={true} />}
          {activeSubTab === 'library' && <BookSection books={books} user={user} onAddClick={() => {}} onEditClick={() => {}} onDeleteClick={() => {}} />}
          {activeSubTab === 'videos' && <VideoSection videos={videos} user={user} onAddClick={() => {}} onDeleteClick={() => {}} />}

          {activeSubTab === 'exam' && (
            <div className="max-w-4xl mx-auto py-12 space-y-8">
              {!user.canAccessExam ? (
                <div className="text-center py-20 space-y-8 animate-in fade-in duration-500">
                  <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-red-100">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Exam Hall Restricted</h2>
                    <p className="text-gray-500 font-medium max-w-md mx-auto mt-2">You do not have permission to enter the Exam Hall. Please contact the Lead Developer to request access.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-100">
                        <p className="text-gray-300 font-bold italic">No exams are currently scheduled for you.</p>
                      </div>
                    ) : (
                      exams.map(ex => (
                        <div key={ex.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl transition-all h-[320px]">
                          <div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black mb-6">{ex.questions.length}</div>
                            <h4 className="text-2xl font-black text-gray-900 leading-tight mb-2">{ex.title}</h4>
                            <p className="text-sm text-gray-400 font-medium line-clamp-3 leading-relaxed">{ex.description}</p>
                          </div>
                          
                          <div className="mt-8">
                            {hasSubmitted(ex.id) ? (
                              <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-center font-black text-xs uppercase tracking-widest border border-emerald-100">Exam Submitted</div>
                            ) : (
                              <button onClick={() => startExam(ex)} className="w-full py-4 bg-gray-900 hover:bg-blue-600 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95">Take Exam Now</button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
