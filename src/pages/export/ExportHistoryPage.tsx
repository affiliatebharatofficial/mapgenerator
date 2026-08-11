import React, { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Download, Clock, Trash2, FileText, BookOpen, Plus } from 'lucide-react';
import { ExportStudioService } from '../../lib/export/exportStudioService';
import type { ExportJob } from '../../types/exportStudio';
import { useAuth } from '../../lib/supabase/authStore';

interface ExportHistoryPageProps {
  onNavigateCreate: () => void;
  onNavigateHome: () => void;
}

export const ExportHistoryPage: React.FC<ExportHistoryPageProps> = ({
  onNavigateCreate,
  onNavigateHome
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'user_current';

  const [history, setHistory] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    setLoading(true);
    const list = ExportStudioService.getExportHistory(userId);
    setHistory(list);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const handleDelete = (id: string) => {
    ExportStudioService.deleteExportJob(id);
    loadHistory();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d11] text-slate-100 font-sans select-none">
      <Header onNavigateCreate={onNavigateCreate} onNavigateHome={onNavigateHome} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-400" />
              <h1 className="font-cinzel font-bold text-2xl text-slate-100">Export History & Downloads</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Generated maps, worldbooks, and campaign PDF exports (Stored for 30 days).</p>
          </div>

          <button
            onClick={() => (window.location.pathname = '/export')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Open Export Studio
          </button>
        </div>

        {/* Exports Table / List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-amber-300 font-cinzel">Loading Export Archive...</div>
          ) : history.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3 max-w-md mx-auto">
              <FileText className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="font-cinzel font-bold text-slate-300">No Export Downloads Found</p>
              <p className="text-xs text-slate-500">You haven't generated any exports in the Export Studio yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((job) => (
                <div key={job.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {job.exportType} ({job.format.toUpperCase()})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{job.printSize} • {job.orientation}</span>
                    </div>
                    <h3 className="font-cinzel font-bold text-base text-slate-100">{job.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">Created: {new Date(job.createdAt).toLocaleDateString()} • Size: {job.fileSize}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={job.storageUrl}
                      download={`${job.title}.${job.format}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <button onClick={() => handleDelete(job.id)} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer onNavigateCreate={onNavigateCreate} />
    </div>
  );
};
