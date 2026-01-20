import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface FaqItemProps {
    question: string;
    answer: string;
    icon: React.ReactNode;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, icon }) => {
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

export default FaqItem;
