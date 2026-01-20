import React from 'react';
import { Scissors, FileCheck, Download, AlertCircle, ChevronRight } from 'lucide-react';
import type { ProcessingStatus } from '../../types';

interface ActionControlsProps {
    isProcessing: boolean;
    status: ProcessingStatus | null;
    resultZip: Blob | null;
    onProcess: () => void;
    onDownload: () => void;
    onReset: () => void;
    canProcess: boolean;
}

const ActionControls: React.FC<ActionControlsProps> = ({
    isProcessing,
    status,
    resultZip,
    onProcess,
    onDownload,
    onReset,
    canProcess
}) => {
    return (
        <div className="flex flex-col items-center">
            {!isProcessing && !status?.isComplete && (
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={onProcess}
                        disabled={!canProcess}
                        className={`px-16 py-6 rounded-3xl font-black text-xl text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center gap-4 transition-all transform hover:scale-105 active:scale-95 group ${!canProcess
                            ? 'bg-slate-200 cursor-not-allowed opacity-50 shadow-none grayscale'
                            : 'bg-indigo-600 hover:bg-indigo-700 ring-8 ring-indigo-50'
                            }`}
                    >
                        <Scissors className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                        Split & Zip Locally
                    </button>
                    <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Client-Side Processing Only</span>
                    </div>
                </div>
            )}

            {/* Processing State */}
            {isProcessing && status && (
                <div className="w-full max-w-2xl bg-white p-10 rounded-[2rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden">
                    <div className="flex justify-between items-end mb-6">
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">Executing Pipeline</span>
                            <span className="text-2xl font-black text-slate-900 leading-none">{status.message}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-4xl font-black text-indigo-100 leading-none mb-1">{Math.round((status.current / (status.total || 1)) * 100)}%</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{status.current} of {status.total} pages</span>
                        </div>
                    </div>

                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-8 p-1">
                        <div
                            className="h-full bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all duration-500 ease-out"
                            style={{ width: `${(status.current / (status.total || 1)) * 100}%` }}
                        />
                    </div>

                    <div className="bg-slate-900 rounded-[1.5rem] p-6 font-mono text-[10px] space-y-2 max-h-48 overflow-y-auto shadow-inner border border-slate-800">
                        {status.log?.map((line, i) => (
                            <div key={i} className="flex items-start gap-3 text-slate-400 border-l border-slate-800 pl-4 ml-1">
                                <ChevronRight className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                <span className={line.startsWith('ERROR') ? 'text-red-400 font-black' : 'text-slate-300'}>{line}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Success View */}
            {status?.isComplete && resultZip && (
                <div className="w-full max-w-2xl bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-green-100 border-4 border-green-50 text-center animate-in fade-in zoom-in duration-700">
                    <div className="flex justify-center mb-8">
                        <div className="w-28 h-28 bg-green-100 rounded-[2rem] flex items-center justify-center ring-8 ring-green-50 rotate-3 animate-bounce">
                            <FileCheck className="w-14 h-14 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Processing Complete</h3>
                    <p className="text-slate-500 mb-10 font-medium">Split {status.total} pages into individual PDF files successfully.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={onDownload}
                            className="px-12 py-6 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all transform hover:scale-105 shadow-[0_15px_40px_rgba(22,163,74,0.3)]"
                        >
                            <Download className="w-7 h-7" />
                            Download Zip
                        </button>
                        <button
                            onClick={onReset}
                            className="px-10 py-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-3xl font-black transition-all"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            )}

            {/* Error View */}
            {status?.error && (
                <div className="w-full max-w-xl mt-4 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center gap-6 text-red-800 shadow-xl shadow-red-100 animate-in shake duration-500">
                    <div className="p-4 bg-red-100 rounded-2xl">
                        <AlertCircle className="w-8 h-8 flex-shrink-0" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest mb-1">Fatal Error</span>
                        <span className="text-sm font-bold opacity-90">{status.error}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionControls;
