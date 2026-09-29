import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, BookOpen, FileText, Award, BarChart2, ChevronRight,
  GraduationCap, ClipboardList, Settings, Menu, X, LogOut,
  PlusCircle, Trash2, Edit, Search, CheckCircle, XCircle, Eye
} from 'lucide-react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'teachers', label: 'Teachers', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'exams', label: 'Exams', icon: ClipboardList },
    { id: 'results', label: 'Results', icon: Award },
  ];
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block flex flex-col`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
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
                ${activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <Icon className="w-5 h-5" />{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-900/50 hover:text-red-400 transition-colors">
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

const AdminDashboardHome = ({ stats, chartData }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Students" value={stats.students} icon={GraduationCap} color="bg-blue-500" />
      <StatCard label="Total Teachers" value={stats.teachers} icon={Users} color="bg-indigo-500" />
      <StatCard label="Total Exams" value={stats.exams} icon={ClipboardList} color="bg-emerald-500" />
      <StatCard label="Total Results" value={stats.results} icon={Award} color="bg-amber-500" />
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h3 className="font-semibold text-slate-700 mb-4">Results Overview</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="passed" fill="#3b82f6" radius={[4,4,0,0]} name="Passed" />
          <Bar dataKey="failed" fill="#f87171" radius={[4,4,0,0]} name="Failed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const UsersTable = ({ users, role, onToggle, onDelete }) => {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">{role}s</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${role}s...`}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>{filtered.map(u => (
            <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium">{u.first_name || u.username}</td>
              <td className="px-4 py-3 text-slate-500">{u.email}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <button onClick={() => onToggle(u.id, !u.is_active)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors">
                    {u.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => onDelete(u.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-slate-400">No {role}s found</p>}
      </div>
    </div>
  );
};

const SubjectsTab = () => {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/exams/subjects/').then(r => setSubjects(r.data)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/exams/subjects/', form);
      setSubjects(prev => [...prev, res.data]);
      setForm({ name: '', code: '', description: '' });
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    await api.delete(`/exams/subjects/${id}/`);
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Subjects</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold mb-4 text-slate-700">Add Subject</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
            placeholder="Subject name" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
            placeholder="Code (e.g. CS101)" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            {loading ? 'Adding...' : 'Add Subject'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Code</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>{subjects.map(s => (
            <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{s.name}</td>
              <td className="px-4 py-3 text-slate-500">{s.code || '–'}</td>
              <td className="px-4 py-3">
                <button onClick={() => handleDelete(s.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors float-right">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {subjects.length === 0 && <p className="text-center py-8 text-slate-400">No subjects yet</p>}
      </div>
    </div>
  );
};

const ExamsTab = ({ exams, onDelete }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-slate-800">All Exams</h2>
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
                ${e.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                  e.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                {e.status}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-500">{e.duration} min</td>
            <td className="px-4 py-3">
              <button onClick={() => onDelete(e.id)}
                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 float-right">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        ))}</tbody>
      </table>
      {exams.length === 0 && <p className="text-center py-8 text-slate-400">No exams yet</p>}
    </div>
  </div>
);

const ResultsTab = ({ results }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-slate-800">All Results</h2>
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-auto">
      <table className="w-full text-sm">
        <thead><tr className="bg-slate-50 border-b border-slate-100">
          <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
          <th className="text-left px-4 py-3 font-medium text-slate-600">Exam</th>
          <th className="text-left px-4 py-3 font-medium text-slate-600">Score</th>
          <th className="text-left px-4 py-3 font-medium text-slate-600">%</th>
          <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
        </tr></thead>
        <tbody>{results.map(r => (
          <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
            <td className="px-4 py-3 font-medium">{r.attempt?.student_name || r.attempt}</td>
            <td className="px-4 py-3 text-slate-500">{r.attempt?.exam_title || '–'}</td>
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
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/accounts/users/').then(r => {
      setStudents(r.data.filter(u => u.role === 'STUDENT'));
      setTeachers(r.data.filter(u => u.role === 'TEACHER'));
    });
    api.get('/exams/exams/').then(r => setExams(r.data));
    api.get('/results/results/').then(r => setResults(r.data));
  }, []);

  const handleToggleUser = async (id, is_active) => {
    await api.patch(`/accounts/users/${id}/`, { is_active });
    const update = list => list.map(u => u.id === id ? { ...u, is_active } : u);
    setStudents(update); setTeachers(update);
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/accounts/users/${id}/`);
    setStudents(p => p.filter(u => u.id !== id));
    setTeachers(p => p.filter(u => u.id !== id));
  };

  const handleDeleteExam = async (id) => {
    if (!confirm('Delete this exam?')) return;
    await api.delete(`/exams/exams/${id}/`);
    setExams(p => p.filter(e => e.id !== id));
  };

  const stats = { students: students.length, teachers: teachers.length, exams: exams.length, results: results.length };
  const chartData = exams.slice(0, 5).map(e => ({
    name: e.title.substring(0, 12) + '...',
    passed: results.filter(r => r.is_passed && r.attempt?.exam === e.id).length,
    failed: results.filter(r => !r.is_passed && r.attempt?.exam === e.id).length,
  }));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6 text-slate-600" /></button>
          <span className="font-bold text-slate-800">ExamSystem</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'dashboard' && <AdminDashboardHome stats={stats} chartData={chartData} />}
          {activeTab === 'students' && <UsersTable users={students} role="Student" onToggle={handleToggleUser} onDelete={handleDeleteUser} />}
          {activeTab === 'teachers' && <UsersTable users={teachers} role="Teacher" onToggle={handleToggleUser} onDelete={handleDeleteUser} />}
          {activeTab === 'subjects' && <SubjectsTab />}
          {activeTab === 'exams' && <ExamsTab exams={exams} onDelete={handleDeleteExam} />}
          {activeTab === 'results' && <ResultsTab results={results} />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
