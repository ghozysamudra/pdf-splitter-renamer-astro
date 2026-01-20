
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Upload,
  Table,
  CheckCircle,
  Download,
  FileCheck,
  AlertCircle,
  Scissors,
  X,
  Settings,
  Hash,
  Eye,
  Type,
  ChevronRight,
  ListOrdered,
  FileSearch,
  ChevronDown,
  ShieldCheck,
  Cpu,
  HelpCircle,
  Zap
} from 'lucide-react';
import { parseCsv, splitPdf, generateFileName } from '../services/pdfService';
import type { CsvRow, ProcessingStatus, FileData, NamingConfig, NamingStrategy } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

const FaqItem: React.FC<{ question: string; answer: string; icon: React.ReactNode }> = ({ question, answer, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`group rounded-3xl border-2 transition-all overflow-hidden ${isOpen ? 'border-indigo-100 bg-indigo-50/30' : 'border-gray-100 bg-white hover:border-indigo-50'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-white' : 'bg-gray-50 group-hover:bg-indigo-50'}`}>
            {icon}
          </div>
          <span className="font-bold text-gray-900">{question}</span>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-indigo-600' : ''}`} />
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-sm text-gray-500 font-medium leading-relaxed pl-14">
          {answer}
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<FileData | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<FileData | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);

  const [namingConfig, setNamingConfig] = useState<NamingConfig>({
    strategy: 'default',
    customBase: '',
    manualNames: '',
    startNumber: 1,
    padding: 2,
    numberLocation: 'suffix',
    csvColumn: '',
    csvHasHeader: true,
    addNumberToCsv: false,
    addNumberToManual: true
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [resultZip, setResultZip] = useState<Blob | null>(null);

  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [isDraggingCsv, setIsDraggingCsv] = useState(false);

  const generatePreview = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfPageCount(pdfDoc.getPageCount());

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        setPdfPreviewUrl(canvas.toDataURL());
      }
    } catch (err) {
      console.error("Failed to generate preview", err);
    }
  };

  const handlePdfUpload = (file: File | undefined) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile({ name: file.name, file });
      setResultZip(null);
      generatePreview(file);
    }
  };

  const loadCsv = async (file: File, hasHeader: boolean) => {
    try {
      const { data, columns } = await parseCsv(file, hasHeader);
      setCsvData(data);
      setCsvColumns(columns);
      setNamingConfig(prev => ({
        ...prev,
        csvColumn: columns.length > 0 ? columns[0] : ''
      }));
      setResultZip(null);
    } catch (err) {
      alert("Failed to parse CSV file. Please ensure it is valid.");
    }
  };

  const handleCsvUpload = async (file: File | undefined) => {
    if (file) {
      setCsvFile({ name: file.name, file });
      await loadCsv(file, namingConfig.csvHasHeader);
    }
  };

  useEffect(() => {
    if (csvFile) {
      loadCsv(csvFile.file, namingConfig.csvHasHeader);
    }
  }, [namingConfig.csvHasHeader]);

  const handleProcess = async () => {
    if (!pdfFile) return;
    if (namingConfig.strategy === 'csv' && !csvFile) return;

    setIsProcessing(true);
    setResultZip(null);
    try {
      const zipBlob = await splitPdf(
        pdfFile.file,
        csvData,
        namingConfig,
        (progress) => setStatus(progress)
      );
      setResultZip(zipBlob);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultZip) return;
    const url = URL.createObjectURL(resultZip);
    const link = document.createElement('a');
    link.href = url;
    link.download = `split_pdfs_${new Date().getTime()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setPdfFile(null);
    setPdfPageCount(0);
    setPdfPreviewUrl(null);
    setCsvFile(null);
    setCsvData([]);
    setCsvColumns([]);
    setNamingConfig({
      strategy: 'default',
      customBase: '',
      manualNames: '',
      startNumber: 1,
      padding: 2,
      numberLocation: 'suffix',
      csvColumn: '',
      csvHasHeader: true,
      addNumberToCsv: false,
      addNumberToManual: true
    });
    setIsProcessing(false);
    setStatus(null);
    setResultZip(null);
  };

  const previews = useMemo(() => {
    if (!pdfFile) return [];
    return [0, 1, 2].map(idx => ({
      index: idx + 1,
      name: generateFileName(idx, namingConfig, pdfFile.name, csvData) + '.pdf'
    }));
  }, [pdfFile, namingConfig, csvData]);

  const handleDragOver = (e: React.DragEvent, setDrag: (v: boolean) => void) => {
    e.preventDefault();
    setDrag(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDrag: (v: boolean) => void) => {
    e.preventDefault();
    setDrag(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'pdf' | 'csv', setDrag: (v: boolean) => void) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (type === 'pdf') handlePdfUpload(file);
    else handleCsvUpload(file);
  };

  // Determine if numbering settings should be enabled
  const isNumberingEnabled = useMemo(() => {
    if (namingConfig.strategy === 'csv') return namingConfig.addNumberToCsv;
    if (namingConfig.strategy === 'manual') return namingConfig.addNumberToManual;
    return true; // default and custom always have numbering
  }, [namingConfig]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl rotate-3 transform hover:rotate-0 transition-transform cursor-pointer">
            <Scissors className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">PDF Splitter Pro</h1>
        <p className="text-gray-500 max-w-xl mx-auto font-medium">
          Split multi-page PDFs locally. Private, fast, and secure.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">
        {/* Column 1: Source */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div
            onDragOver={(e) => handleDragOver(e, setIsDraggingPdf)}
            onDragLeave={(e) => handleDragLeave(e, setIsDraggingPdf)}
            onDrop={(e) => handleDrop(e, 'pdf', setIsDraggingPdf)}
            className={`p-6 bg-white rounded-3xl shadow-sm border-2 h-full transition-all flex flex-col ${pdfFile ? 'border-indigo-100 shadow-indigo-50/50' : isDraggingPdf ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100'
              }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                PDF Input
              </h2>
              {pdfFile && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full uppercase tracking-tighter">{pdfPageCount} Pages</span>}
            </div>

            {!pdfFile ? (
              <label className="flex flex-col items-center justify-center w-full h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all group">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 transition-colors mb-4">
                  <Upload className="w-10 h-10 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                </div>
                <span className="text-sm text-gray-500 font-bold px-4 text-center">Drop PDF or click to select</span>
                <input type="file" className="hidden" accept=".pdf" onChange={(e) => handlePdfUpload(e.target.files?.[0])} />
              </label>
            ) : (
              <div className="flex flex-col gap-6 flex-1">
                <div className="relative group overflow-hidden rounded-2xl border border-gray-100 aspect-[3/4] bg-gray-50 flex items-center justify-center">
                  {pdfPreviewUrl ? (
                    <img src={pdfPreviewUrl} alt="First page preview" className="w-full h-full object-cover" />
                  ) : (
                    <FileSearch className="w-12 h-12 text-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-white/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/30">Preview: Page 1</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-900 truncate">{pdfFile.name}</span>
                  </div>
                  <button onClick={() => setPdfFile(null)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Configuration */}
        <div className="lg:col-span-8 space-y-8">
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
                        onDragOver={(e) => handleDragOver(e, setIsDraggingCsv)}
                        onDragLeave={(e) => handleDragLeave(e, setIsDraggingCsv)}
                        onDrop={(e) => handleDrop(e, 'csv', setIsDraggingCsv)}
                        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-slate-50 transition-all ${isDraggingCsv ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'
                          }`}
                      >
                        <div className="p-3 bg-slate-50 rounded-2xl mb-3">
                          <Table className="w-8 h-8 text-slate-300" />
                        </div>
                        <span className="text-sm text-slate-500 font-bold">Drop CSV or click to select</span>
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => handleCsvUpload(e.target.files?.[0])} />
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
                          <button onClick={() => setCsvFile(null)} className="p-2 hover:bg-white rounded-xl text-indigo-400 transition-colors">
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
                  <Eye className="w-4 h-4 text-indigo-400" />
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
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col items-center">
        {!isProcessing && !status?.isComplete && (
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleProcess}
              disabled={!pdfFile || (namingConfig.strategy === 'csv' && !csvFile)}
              className={`px-16 py-6 rounded-3xl font-black text-xl text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center gap-4 transition-all transform hover:scale-105 active:scale-95 group ${(!pdfFile || (namingConfig.strategy === 'csv' && !csvFile))
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
                onClick={downloadResult}
                className="px-12 py-6 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all transform hover:scale-105 shadow-[0_15px_40px_rgba(22,163,74,0.3)]"
              >
                <Download className="w-7 h-7" />
                Download Zip
              </button>
              <button
                onClick={reset}
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

      {/* FAQ Section */}
      <section className="mt-32 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest mb-4">
            <HelpCircle className="w-4 h-4" />
            Common Questions
          </div>
          <h2 className="text-3xl font-black text-gray-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How do I use PDF Splitter Pro?",
              a: "It's simple: Upload your PDF file, choose how you want to name the resulting files (using the source name, a custom template, a manual list, or even data from a CSV), and click 'Split & Zip Locally'. The app will process everything and give you a ZIP file containing your individual pages.",
              icon: <Zap className="w-5 h-5 text-amber-500" />
            },
            {
              q: "How does the processing work?",
              a: "We use high-performance libraries like pdf-lib and pdfjs-dist powered by WebAssembly. This allows the application to read, extract, and re-generate PDF documents directly in your browser's memory without ever sending files to a server.",
              icon: <Cpu className="w-5 h-5 text-indigo-500" />
            },
            {
              q: "Is my data secure?",
              a: "Absolutely. Security is our top priority. Because all document manipulation happens locally on your device (client-side), your sensitive data never leaves your computer. We don't have a backend that stores or even sees your files.",
              icon: <ShieldCheck className="w-5 h-5 text-green-500" />
            },
            {
              q: "Is this tool really free?",
              a: "Yes! PDF Splitter Pro is completely free to use. There are no limits on the number of files you can process or the number of pages in your PDF. We believe in providing powerful, private tools for everyone.",
              icon: <CheckCircle className="w-5 h-5 text-blue-500" />
            }
          ].map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} icon={faq.icon} />
          ))}
        </div>
      </section>

      <footer className="mt-32 text-center border-t border-slate-100 pt-16">
        <div className="inline-flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl mb-4 border border-slate-100 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security: End-to-End Client Sandbox</span>
        </div>
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-slate-400 font-bold leading-loose mb-4">
            No files are uploaded to any server. This tool uses <span className="text-indigo-600">pdf-lib</span> and <span className="text-indigo-600">WebAssembly</span> technologies to perform document manipulation directly in your browser.
          </p>
          <div className="flex justify-center gap-3 mb-6">
            {['Privacy First', 'High Performance', 'Open Source Tech'].map(t => (
              <span key={t} className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-400 rounded-lg">{t}</span>
            ))}
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Vibe coded with ❤️ using Google AI Studio by <a href="https://ghozysamudra.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors">Ghozy Samudra</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
