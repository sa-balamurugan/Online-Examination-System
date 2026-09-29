import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Award, TrendingUp, Home } from 'lucide-react';

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No result data found.</p>
          <button onClick={() => navigate('/student')} className="text-blue-600 hover:underline">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const percentage = parseFloat(result.percentage).toFixed(1);
  const isPassed = result.is_passed;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-4">
        {/* Result Header */}
        <div className={`rounded-2xl p-6 text-center text-white ${isPassed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {isPassed
                ? <CheckCircle className="w-9 h-9 text-white" />
                : <XCircle className="w-9 h-9 text-white" />}
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1">{isPassed ? 'Congratulations!' : 'Better Luck Next Time'}</h1>
          <p className="text-white/80 text-sm">{isPassed ? 'You passed the exam!' : 'You did not pass this time.'}</p>
          {state?.auto && <p className="mt-2 text-white/70 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">⏰ Auto-submitted when timer expired</p>}
        </div>

        {/* Score Circle */}
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
          <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-8 mx-auto
            ${isPassed ? 'border-green-400' : 'border-red-400'}`}>
            <span className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>{percentage}%</span>
            <span className="text-xs text-slate-400">Score</span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-800">{result.obtained_marks} / {result.total_marks}</p>
          <p className="text-sm text-slate-500">Marks Obtained</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-100">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-green-600">{result.correct_answers}</p>
            <p className="text-xs text-slate-500">Correct</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-100">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xl font-bold text-red-600">{result.incorrect_answers}</p>
            <p className="text-xs text-slate-500">Incorrect</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-100">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xl font-bold text-slate-600">{result.unanswered_questions}</p>
            <p className="text-xs text-slate-500">Skipped</p>
          </div>
        </div>

        <button onClick={() => navigate('/student')}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          <Home className="w-5 h-5" /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
