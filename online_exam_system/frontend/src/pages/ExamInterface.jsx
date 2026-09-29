import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { AlertTriangle, CheckCircle, Clock, Flag, ArrowLeft, ArrowRight, X } from 'lucide-react';

// ---------------------------
// EXAM INTERFACE (Timer + MCQ)
// ---------------------------
const ExamInterface = () => {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId: { selected_option, is_marked_for_review, answerId }
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [examRes, questionsRes] = await Promise.all([
        api.get(`/exams/exams/${examId}/`),
        api.get(`/exams/questions/?exam=${examId}`)
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);
      setTimeLeft(examRes.data.duration * 60);
    };
    load();
  }, [examId]);

  const submitExam = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const res = await api.post(`/results/attempts/${attemptId}/submit/`);
      navigate(`/student/result/${res.data.id}`, { state: { result: res.data, exam, auto } });
    } catch (err) {
      alert('Error submitting exam');
      setSubmitting(false);
    }
  }, [attemptId, navigate, exam, submitting]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { submitExam(true); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft === null]);

  const handleAnswer = async (questionId, option) => {
    const existing = answers[questionId];
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], selected_option: option } }));
    try {
      if (existing?.answerId) {
        await api.patch(`/results/answers/${existing.answerId}/`, { selected_option: option });
      } else {
        const res = await api.post('/results/answers/', {
          attempt: attemptId, question: questionId, selected_option: option
        });
        setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], answerId: res.data.id } }));
      }
    } catch {}
  };

  const handleMarkReview = async (questionId) => {
    const existing = answers[questionId];
    const newVal = !existing?.is_marked_for_review;
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], is_marked_for_review: newVal } }));
    if (existing?.answerId) {
      await api.patch(`/results/answers/${existing.answerId}/`, { is_marked_for_review: newVal });
    }
  };

  const handleClearAnswer = async (questionId) => {
    const existing = answers[questionId];
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], selected_option: null } }));
    if (existing?.answerId) {
      await api.patch(`/results/answers/${existing.answerId}/`, { selected_option: null });
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId) => {
    const a = answers[questionId];
    if (!a) return 'unanswered';
    if (a.is_marked_for_review) return 'review';
    if (a.selected_option) return 'answered';
    return 'unanswered';
  };

  if (!exam || !questions.length) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Loading exam...</p>
      </div>
    </div>
  );

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ?.id];
  const answeredCount = Object.values(answers).filter(a => a.selected_option).length;
  const reviewCount = Object.values(answers).filter(a => a.is_marked_for_review).length;
  const isWarning = timeLeft !== null && timeLeft < 300;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <h1 className="font-bold text-slate-800 text-sm sm:text-base truncate">{exam.title}</h1>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold
            ${isWarning ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
            <Clock className="w-4 h-4 flex-shrink-0" />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full gap-4 p-4">
        {/* Main Question Area */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Question {currentIndex + 1} of {questions.length}
              </span>
              {currentAnswer?.is_marked_for_review && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Marked for Review
                </span>
              )}
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-800 mb-6">{currentQ.question_text}</p>
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map(opt => {
                const val = currentQ[`option_${opt.toLowerCase()}`];
                const selected = currentAnswer?.selected_option === opt;
                return (
                  <button key={opt} onClick={() => handleAnswer(currentQ.id, opt)}
                    className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                      ${selected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                    <span className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold
                      ${selected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{opt}</span>
                    <span className={`text-sm ${selected ? 'text-blue-700 font-medium' : 'text-slate-700'}`}>{val}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              <button onClick={() => handleMarkReview(currentQ.id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${currentAnswer?.is_marked_for_review
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-300'}`}>
                <Flag className="w-4 h-4" /> Mark Review
              </button>
              <button onClick={() => handleClearAnswer(currentQ.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <X className="w-4 h-4" /> Clear
              </button>
            </div>
            <div className="flex gap-2">
              <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i - 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>
              {currentIndex < questions.length - 1
                ? <button onClick={() => setCurrentIndex(i => i + 1)}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                : <button onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-4 h-4" /> Submit
                  </button>
              }
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="lg:w-72 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Progress</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{answeredCount}</p>
                <p className="text-xs text-slate-500">Answered</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-lg font-bold text-slate-500">{questions.length - answeredCount - reviewCount}</p>
                <p className="text-xs text-slate-500">Unanswered</p>
              </div>
              <div className="text-center p-2 bg-amber-50 rounded-lg">
                <p className="text-lg font-bold text-amber-500">{reviewCount}</p>
                <p className="text-xs text-slate-500">Review</p>
              </div>
            </div>
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Questions</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const status = getQuestionStatus(q.id);
                return (
                  <button key={q.id} onClick={() => setCurrentIndex(i)}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all
                      ${i === currentIndex ? 'ring-2 ring-blue-500' : ''}
                      ${status === 'answered' ? 'bg-green-500 text-white' :
                        status === 'review' ? 'bg-amber-400 text-white' :
                        'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded" />Answered</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-400 rounded" />Marked for Review</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-200 rounded" />Not Answered</div>
            </div>
          </div>
          <button onClick={() => setShowConfirm(true)}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors text-sm">
            Submit Exam
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Submit Exam?</h3>
            <div className="text-sm text-slate-500 text-center mb-1">Answered: {answeredCount}/{questions.length}</div>
            {answeredCount < questions.length && (
              <p className="text-xs text-red-500 text-center mb-4">
                {questions.length - answeredCount} questions unanswered
              </p>
            )}
            <p className="text-sm text-slate-500 text-center mb-6">You cannot change answers after submission.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => { setShowConfirm(false); submitExam(false); }} disabled={submitting}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamInterface;
