import React from 'react';

const Footer: React.FC = () => {
    return (
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
    );
};

export default Footer;
