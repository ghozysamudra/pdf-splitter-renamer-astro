import React from 'react';
import { Scissors } from 'lucide-react';

const Header: React.FC = () => {
    return (
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
    );
};

export default Header;
