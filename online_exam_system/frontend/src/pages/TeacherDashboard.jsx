import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList, PlusCircle, Edit, Trash2, Eye, BookOpen,
  Users, Award, Menu, X, LogOut, ChevronDown, ChevronUp,
  Check, Circle, HelpCircle
} from 'lucide-react';
import api from '../services/api';

const TeacherSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'exams', label: 'My Exams', icon: ClipboardList },
    { id: 'create', label: 'Create Exam', icon: PlusCircle },
    { id: 'results', label: 'Results', icon: Award },
  ];
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-indigo-900 text-white z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block flex flex-col`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">ExamSystem</span>
          <button className="ml-auto lg:hidden" onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === id ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}>
              <Icon className="w-5 h-5" />{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-indigo-300 hover:bg-red-900/50 hover:text-red-400">
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

const CreateExamForm = ({ subjects, onCreated }) => {
  const [step, setStep] = useState(1);
  const [exam, setExam] = useState(null);
  const [form, setForm] = useState({
    title: '', subject: '', description: '', duration: 60,
    total_questions: 10, marks_per_question: 1, passing_percentage: 40,
    start_date: '', end_date: '', status: 'DRAFT'
  });
  const [questions, setQuestions] = useState([]);
  const [qForm, setQForm] = useState({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', explanation: ''
  });
  const [saving, setSaving] = useState(false);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/exams/exams/', form);
      setExam(res.data);
      setStep(2);
      if (onCreated) onCreated(res.data);
    } catch (err) {
      alert('Error creating exam: ' + JSON.stringify(err.response?.data));
    }
    setSaving(false);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!exam) return;
    setSaving(true);
    try {
      const res = await api.post('/exams/questions/', { ...qForm, exam: exam.id });
      setQuestions(prev => [...prev, res.data]);
      setQForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' });
    } catch (err) {
      alert('Error: ' + JSON.stringify(err.response?.data));
    }
    setSaving(false);
  };

  const handleDeleteQuestion = async (id) => {
    await api.delete(`/exams/questions/${id}/`);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handlePublish = async () => {
    if (!exam) return;
    await api.patch(`/exams/exams/${exam.id}/`, { status: 'PUBLISHED' });
    alert('Exam published!');
  };

  if (step === 2) return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Add Questions — {exam?.title}</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{questions.length}/{exam?.total_questions} Added</span>
        </div>
        <form onSubmit={handleAddQuestion} className="space-y-3">
          <textarea value={qForm.question_text} onChange={e => setQForm({ ...qForm, question_text: e.target.value })} required
            placeholder="Question text..." rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="grid grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D'].map(opt => (
              <input key={opt} value={qForm[`option_${opt.toLowerCase()}`]}
                onChange={e => setQForm({ ...qForm, [`option_${opt.toLowerCase()}`]: e.target.value })}
                placeholder={`Option ${opt}`} required
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <label className="text-sm font-medium text-slate-600">Correct:</label>
            <select value={qForm.correct_answer} onChange={e => setQForm({ ...qForm, correct_answer: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {['A','B','C','D'].map(o => <option key={o} value={o}>Option {o}</option>)}
            </select>
            <button type="submit" disabled={saving}
              className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>

      {questions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-3 p-4 border-b border-slate-50 last:border-0">
              <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{q.question_text}</p>
                <p className="text-xs text-green-600 mt-1">✓ Correct: Option {q.correct_answer}</p>
              </div>
              <button onClick={() => handleDeleteQuestion(q.id)}
                className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">← Back</button>
        <button onClick={handlePublish} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 ml-auto">
          Publish Exam
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Create Exam</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required min={1}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Questions</label>
              <input type="number" value={form.total_questions} onChange={e => setForm({ ...form, total_questions: e.target.value })} required min={1}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marks per Question</label>
              <input type="number" value={form.marks_per_question} onChange={e => setForm({ ...form, marks_per_question: e.target.value })} required min={0.5} step={0.5}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passing % </label>
              <input type="number" value={form.passing_percentage} onChange={e => setForm({ ...form, passing_percentage: e.target.value })} required min={0} max={100}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date/Time</label>
              <input type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date/Time</label>
              <input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
              {saving ? 'Creating...' : 'Next: Add Questions →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/exams/exams/').then(r => setExams(r.data));
    api.get('/exams/subjects/').then(r => setSubjects(r.data));
    api.get('/results/results/').then(r => setResults(r.data));
  }, []);

  const handleDeleteExam = async (id) => {
    if (!confirm('Delete this exam?')) return;
    await api.delete(`/exams/exams/${id}/`);
    setExams(p => p.filter(e => e.id !== id));
  };

  const handleTogglePublish = async (exam) => {
    const newStatus = exam.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await api.patch(`/exams/exams/${exam.id}/`, { status: newStatus });
    setExams(p => p.map(e => e.id === exam.id ? { ...e, status: newStatus } : e));
  };

  const publishedCount = exams.filter(e => e.status === 'PUBLISHED').length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <TeacherSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-slate-800">Teacher Dashboard</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Teacher Dashboard</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="My Exams" value={exams.length} icon={ClipboardList} color="bg-indigo-500" />
                <StatCard label="Published" value={publishedCount} icon={Check} color="bg-green-500" />
                <StatCard label="Results" value={results.length} icon={Award} color="bg-amber-500" />
                <StatCard label="Subjects" value={subjects.length} icon={BookOpen} color="bg-blue-500" />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-700 mb-4">Recent Exams</h3>
                <div className="space-y-2">
                  {exams.slice(0, 5).map(e => (
                    <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <ClipboardList className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <p className="text-xs text-slate-500">{e.duration} min • {e.total_questions} questions</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${e.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {e.status}
                      </span>
                    </div>
                  ))}
                  {exams.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No exams yet</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">My Exams</h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Duration</th>
                    <th className="px-4 py-3"></th>
                  </tr></thead>
                  <tbody>{exams.map(e => (
                    <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{e.title}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${e.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{e.duration} min</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleTogglePublish(e)}
                            className={`text-xs px-3 py-1 rounded font-medium transition-colors
                              ${e.status === 'PUBLISHED' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {e.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => handleDeleteExam(e.id)}
                            className="p-1 text-slate-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
                {exams.length === 0 && <p className="text-center py-8 text-slate-400">No exams yet</p>}
              </div>
            </div>
          )}

          {activeTab === 'create' && <CreateExamForm subjects={subjects} onCreated={e => setExams(p => [...p, e])} />}

          {activeTab === 'results' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Exam Results</h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Score</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Percentage</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  </tr></thead>
                  <tbody>{results.map(r => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">{r.obtained_marks}/{r.total_marks}</td>
                      <td className="px-4 py-3">{parseFloat(r.percentage).toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.is_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {r.is_passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
                {results.length === 0 && <p className="text-center py-8 text-slate-400">No results yet</p>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
