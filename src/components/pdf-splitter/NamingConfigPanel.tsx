import React from 'react';
import { Settings, AlertCircle, Table, X, ChevronRight, ListOrdered, Hash, CheckCircle } from 'lucide-react';
import type { NamingConfig, NamingStrategy, FileData, CsvRow } from '../../types';

interface NamingConfigPanelProps {
    namingConfig: NamingConfig;
    setNamingConfig: React.Dispatch<React.SetStateAction<NamingConfig>>;
    csvFile: FileData | null;
    csvColumns: string[];
    isDraggingCsv: boolean;
    isNumberingEnabled: boolean;
    onCsvUpload: (file: File | undefined) => void;
    onRemoveCsv: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    pdfFile: FileData | null;
    pdfPageCount: number;
    previews: { index: number; name: string }[];
}

const NamingConfigPanel: React.FC<NamingConfigPanelProps> = ({
    namingConfig,
    setNamingConfig,
    csvFile,
    csvColumns,
    isDraggingCsv,
    isNumberingEnabled,
    onCsvUpload,
    onRemoveCsv,
    onDragOver,
    onDragLeave,
    onDrop,
    pdfFile,
    pdfPageCount,
    previews
}) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <Settings className="w-6 h-6 text-indigo-600" />
                    Naming & Logic
                </h2>
            </div>

            <div className="p-8">
                <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 overflow-x-auto">
                    {(['default', 'custom', 'csv', 'manual'] as NamingStrategy[]).map((strat) => (
                        <button
                            key={strat}
                            onClick={() => setNamingConfig(prev => ({ ...prev, strategy: strat }))}
                            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-sm font-black transition-all capitalize whitespace-nowrap ${namingConfig.strategy === strat
                                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {strat === 'default' ? 'Source' : strat === 'custom' ? 'Template' : strat === 'csv' ? 'CSV File' : 'Manual List'}
                        </button>
                    ))}
                </div>

                <div className="space-y-8 min-h-[220px]">
                    {namingConfig.strategy === 'custom' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2.5 tracking-widest">Base Name Template</label>
                            <input
                                type="text"
                                placeholder="e.g. Monthly_Report_2024"
                                value={namingConfig.customBase}
                                onChange={(e) => setNamingConfig(prev => ({ ...prev, customBase: e.target.value }))}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base text-slate-900 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                            />
                            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" />
                                We will apply automatic numbering based on settings below.
                            </div>
                        </div>
                    )}

                    {namingConfig.strategy === 'manual' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2.5 tracking-widest">Manual Name List</label>
                                <textarea
                                    rows={6}
                                    placeholder={`Name for page 1\nName for page 2\nName for page 3...`}
                                    value={namingConfig.manualNames}
                                    onChange={(e) => setNamingConfig(prev => ({ ...prev, manualNames: e.target.value }))}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm text-slate-900 font-mono focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-300"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer select-none group">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${namingConfig.addNumberToManual ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                        {namingConfig.addNumberToManual && <CheckCircle className="w-4 h-4 text-white" />}
                                        <input
                                            type="checkbox"
                                            checked={namingConfig.addNumberToManual}
                                            onChange={(e) => setNamingConfig(prev => ({ ...prev, addNumberToManual: e.target.checked }))}
                                            className="hidden"
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Add numbering prefix/suffix</span>
                                </label>
                                <p className="text-[11px] text-slate-400 font-medium italic">Line 1 = Page 1</p>
                            </div>
                        </div>
                    )}

                    {namingConfig.strategy === 'csv' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            {!csvFile ? (
                                <label
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-slate-50 transition-all ${isDraggingCsv ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'
                                        }`}
                                >
                                    <div className="p-3 bg-slate-50 rounded-2xl mb-3">
                                        <Table className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <span className="text-sm text-slate-500 font-bold">Drop CSV or click to select</span>
                                    <input type="file" className="hidden" accept=".csv" onChange={(e) => onCsvUpload(e.target.files?.[0])} />
                                </label>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="p-2 bg-indigo-100 rounded-xl">
                                                <Table className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-black text-indigo-900 truncate">{csvFile.name}</span>
                                        </div>
                                        <button onClick={onRemoveCsv} className="p-2 hover:bg-white rounded-xl text-indigo-400 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2.5 tracking-widest">Select Column</label>
                                            <div className="relative">
                                                <select
                                                    value={namingConfig.csvColumn}
                                                    onChange={(e) => setNamingConfig(prev => ({ ...prev, csvColumn: e.target.value }))}
                                                    className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm text-slate-900 font-bold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                                                >
                                                    {csvColumns.map(col => (
                                                        <option key={col} value={col}>
                                                            {namingConfig.csvHasHeader ? col : `Column ${parseInt(col) + 1}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-end gap-3">
                                            <label className="flex items-center gap-3 cursor-pointer select-none group">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${namingConfig.csvHasHeader ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                                    {namingConfig.csvHasHeader && <CheckCircle className="w-4 h-4 text-white" />}
                                                    <input
                                                        type="checkbox"
                                                        checked={namingConfig.csvHasHeader}
                                                        onChange={(e) => setNamingConfig(prev => ({ ...prev, csvHasHeader: e.target.checked }))}
                                                        className="hidden"
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">CSV includes header row</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer select-none group">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${namingConfig.addNumberToCsv ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                                    {namingConfig.addNumberToCsv && <CheckCircle className="w-4 h-4 text-white" />}
                                                    <input
                                                        type="checkbox"
                                                        checked={namingConfig.addNumberToCsv}
                                                        onChange={(e) => setNamingConfig(prev => ({ ...prev, addNumberToCsv: e.target.checked }))}
                                                        className="hidden"
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Force numbering prefix/suffix</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Common Numbering Settings */}
                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-100 transition-all ${!isNumberingEnabled ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2.5 tracking-widest flex items-center gap-2">
                                <ListOrdered className="w-4 h-4" /> Position
                            </label>
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                                <button
                                    onClick={() => setNamingConfig(p => ({ ...p, numberLocation: 'prefix' }))}
                                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${namingConfig.numberLocation === 'prefix' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-500'}`}
                                >
                                    Front
                                </button>
                                <button
                                    onClick={() => setNamingConfig(p => ({ ...p, numberLocation: 'suffix' }))}
                                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${namingConfig.numberLocation === 'suffix' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-500'}`}
                                >
                                    End
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2.5 tracking-widest flex items-center gap-2">
                                <Hash className="w-4 h-4" /> Start Number
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={namingConfig.startNumber}
                                onChange={(e) => setNamingConfig(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 0 }))}
                                className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm text-slate-900 font-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2.5 tracking-widest flex items-center gap-2">
                                <Hash className="w-4 h-4" /> Padding Digits
                            </label>
                            <div className="relative">
                                <select
                                    value={namingConfig.padding}
                                    onChange={(e) => setNamingConfig(prev => ({ ...prev, padding: parseInt(e.target.value) }))}
                                    className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm text-slate-900 font-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                                >
                                    {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p} Digits ({Array(p).fill('0').join('')}1)</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dark Mode Style Preview Area */}
            <div className="bg-slate-900 px-8 py-8 text-white">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-4 h-4 text-indigo-400">👁️</span>
                        Output Preview
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-3 py-1 rounded-lg uppercase tracking-wider">Target Filenames</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                    {pdfFile ? (
                        previews.map(p => (
                            <div key={p.index} className="flex flex-col gap-2 group">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-600 text-[9px] font-black">PG {p.index}</span>
                                    <div className="h-px bg-slate-800 flex-1"></div>
                                </div>
                                <div className="bg-slate-800/50 px-4 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 group-hover:border-indigo-500/50 group-hover:bg-slate-800 transition-all overflow-hidden">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 animate-pulse"></div>
                                    <span className="text-slate-200 text-xs font-medium truncate leading-none pt-0.5">{p.name}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10 text-slate-600 text-sm font-bold bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-800">
                            Select a PDF to see filename preview
                        </div>
                    )}
                </div>
                {pdfFile && <p className="mt-6 text-[10px] text-slate-500 text-center uppercase tracking-widest font-black">Showing first 3 of {pdfPageCount} files</p>}
            </div>
        </div>
    );
};

export default NamingConfigPanel;
