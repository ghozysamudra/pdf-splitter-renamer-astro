import React from 'react';
import { HelpCircle, Zap, Cpu, ShieldCheck, CheckCircle, FileText } from 'lucide-react';
import FaqItem from './FaqItem';
import faqData from '../../data/faq.json';

const iconMap: Record<string, React.ReactNode> = {
    Zap: <Zap className="w-5 h-5 text-amber-500" />,
    Cpu: <Cpu className="w-5 h-5 text-indigo-500" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-green-500" />,
    CheckCircle: <CheckCircle className="w-5 h-5 text-blue-500" />,
    FileText: <FileText className="w-5 h-5 text-purple-500" />
};

const FaqSection: React.FC = () => {
    return (
        <section className="mt-32 max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest mb-4">
                    <HelpCircle className="w-4 h-4" />
                    Common Questions
                </div>
                <h2 className="text-3xl font-black text-gray-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
                {faqData.map((faq, i) => (
                    <FaqItem
                        key={i}
                        question={faq.q}
                        answer={faq.a}
                        icon={iconMap[faq.iconType]}
                    />
                ))}
            </div>
        </section>
    );
};

export default FaqSection;
