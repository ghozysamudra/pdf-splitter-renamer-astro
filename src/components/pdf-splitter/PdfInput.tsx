import React from 'react';
import { Upload, FileSearch, FileText, X } from 'lucide-react';
import type { FileData } from '../../types';

interface PdfInputProps {
    pdfFile: FileData | null;
    pdfPageCount: number;
    pdfPreviewUrl: string | null;
    isDraggingPdf: boolean;
    onPdfUpload: (file: File | undefined) => void;
    onRemovePdf: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

const PdfInput: React.FC<PdfInputProps> = ({
    pdfFile,
    pdfPageCount,
    pdfPreviewUrl,
    isDraggingPdf,
    onPdfUpload,
    onRemovePdf,
    onDragOver,
    onDragLeave,
    onDrop
}) => {
    return (
        <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
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
                    <input type="file" className="hidden" accept=".pdf" onChange={(e) => onPdfUpload(e.target.files?.[0])} />
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
                        <button onClick={onRemovePdf} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfInput;
