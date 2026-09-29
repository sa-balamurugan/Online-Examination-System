import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList, Award, CheckCircle, Clock, Menu, X, LogOut, BookOpen,
  Play, ChevronRight, TrendingUp, AlertCircle, History
} from 'lucide-react';
import api from '../services/api';

const StudentSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'available', label: 'Available Exams', icon: Play },
    { id: 'history', label: 'Exam History', icon: History },
    { id: 'results', label: 'My Results', icon: Award },
  ];
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block flex flex-col`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-800">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">ExamSystem</span>
          <button className="ml-auto lg:hidden" onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === id ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
              <Icon className="w-5 h-5" />{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-blue-300 hover:bg-red-900/50 hover:text-red-400">
            <LogOut className="w-5 h-5" />Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const ExamInstructions = ({ exam, onStart, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-screen overflow-y-auto">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">{exam.title}</h2>
          <p className="text-xs text-slate-500">{exam.subject_details?.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-slate-800">{exam.duration}</p>
          <p className="text-xs text-slate-500">Minutes</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-slate-800">{exam.total_questions}</p>
          <p className="text-xs text-slate-500">Questions</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-slate-800">{exam.marks_per_question}</p>
          <p className="text-xs text-slate-500">Marks/Question</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-slate-800">{exam.passing_percentage}%</p>
          <p className="text-xs text-slate-500">Pass Mark</p>
        </div>
      </div>
      <div className="bg-blue-50 rounded-lg p-4 mb-5">
        <h3 className="font-semibold text-slate-700 text-sm mb-2">Instructions</h3>
        <ul className="space-y-1 text-xs text-slate-600">
          <li>• All questions are multiple choice (MCQ)</li>
          <li>• You can navigate between questions freely</li>
          <li>• Use "Mark for Review" to revisit a question</li>
          <li>• Timer will auto-submit when it reaches zero</li>
          <li>• Once submitted, you cannot change answers</li>
          {exam.description && <li>• {exam.description}</li>}
        </ul>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">
          Cancel
        </button>
        <button onClick={onStart}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
          <Play className="w-4 h-4" /> Start Exam
        </button>
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/exams/exams/').then(r => setExams(r.data));
    api.get('/results/attempts/').then(r => setAttempts(r.data));
    api.get('/results/results/').then(r => setResults(r.data));
  }, []);

  const handleStartExam = async (exam) => {
    try {
      const res = await api.post('/results/attempts/', { exam: exam.id });
      setSelectedExam(null);
      navigate(`/student/exam/${exam.id}/attempt/${res.data.id}`);
    } catch (err) {
      alert('Could not start exam: ' + JSON.stringify(err.response?.data));
    }
  };

  // Stats
  const completedExams = attempts.filter(a => a.status !== 'IN_PROGRESS').length;
  const passedExams = results.filter(r => r.is_passed).length;
  const avgScore = results.length > 0
    ? (results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length).toFixed(1)
    : '0.0';

  // Check if student already attempted an exam
  const alreadyAttempted = (examId) => attempts.some(a => a.exam === examId && a.status !== 'IN_PROGRESS');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-slate-800">Student Dashboard</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Welcome, {user?.first_name || user?.username}! 👋</h2>
                <p className="text-slate-500 text-sm mt-1">Here's your exam overview.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Available Exams" value={exams.length} icon={ClipboardList} color="bg-blue-500" />
                <StatCard label="Completed" value={completedExams} icon={CheckCircle} color="bg-green-500" />
                <StatCard label="Avg Score" value={`${avgScore}%`} icon={TrendingUp} color="bg-indigo-500" />
                <StatCard label="Passed" value={passedExams} icon={Award} color="bg-amber-500" />
              </div>

              {/* Available exams preview */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700">Available Exams</h3>
                  <button onClick={() => setActiveTab('available')} className="text-xs text-blue-600 hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {exams.slice(0, 4).map(exam => (
                    <div key={exam.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{exam.title}</p>
                        <p className="text-xs text-slate-500">{exam.duration} min • {exam.total_questions} questions</p>
                      </div>
                      {alreadyAttempted(exam.id)
                        ? <span className="text-xs text-green-600 font-medium flex-shrink-0">Completed</span>
                        : <button onClick={() => setSelectedExam(exam)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 flex-shrink-0">Start</button>
                      }
                    </div>
                  ))}
                  {exams.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No exams available</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'available' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Available Exams</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {exams.map(exam => (
                  <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-800">{exam.title}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">Published</span>
                    </div>
                    {exam.subject_details && <p className="text-xs text-blue-600 font-medium">{exam.subject_details.name}</p>}
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.duration} min</span>
                      <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" />{exam.total_questions} Qs</span>
                      <span className="flex items-center gap-1"><Award className="w-3 h-3" />Pass: {exam.passing_percentage}%</span>
                    </div>
                    {exam.description && <p className="text-xs text-slate-500 line-clamp-2">{exam.description}</p>}
                    {alreadyAttempted(exam.id)
                      ? <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4" /> Already Completed
                        </div>
                      : <button onClick={() => setSelectedExam(exam)}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                          <Play className="w-4 h-4" /> Start Exam
                        </button>
                    }
                  </div>
                ))}
                {exams.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-slate-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No exams available right now</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Exam History</h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Exam</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  </tr></thead>
                  <tbody>{attempts.map(a => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">Attempt #{a.id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${a.status === 'SUBMITTED' || a.status === 'AUTO_SUBMITTED'
                            ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
                {attempts.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No exam history yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">My Results</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map(r => (
                  <div key={r.id} className={`bg-white rounded-xl shadow-sm border p-5 space-y-3
                    ${r.is_passed ? 'border-green-200' : 'border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${r.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {r.is_passed ? '✓ PASS' : '✗ FAIL'}
                      </span>
                      <span className={`text-2xl font-bold ${r.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(r.percentage).toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="font-bold text-slate-800">{r.obtained_marks}/{r.total_marks}</p>
                        <p className="text-slate-500">Score</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="font-bold text-green-700">{r.correct_answers}</p>
                        <p className="text-slate-500">Correct</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2">
                        <p className="font-bold text-red-600">{r.incorrect_answers}</p>
                        <p className="text-slate-500">Wrong</p>
                      </div>
                    </div>
                  </div>
                ))}
                {results.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-slate-400">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No results yet. Complete an exam to see your results!</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {selectedExam && (
        <ExamInstructions
          exam={selectedExam}
          onStart={() => handleStartExam(selectedExam)}
          onCancel={() => setSelectedExam(null)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
