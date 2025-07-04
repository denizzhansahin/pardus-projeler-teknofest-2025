
import React, { useRef } from 'react';
import { TestResult } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsModalProps {
    result: TestResult;
    onRetry: () => void;
    onNewTest: () => void;
    aiTips: string;
    isTipsLoading: boolean;
    onRequestAiTips: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
    <div className="bg-light p-4 rounded-lg text-center shadow-md">
        <p className="text-sm text-text_secondary font-medium">{label}</p>
        <p className="text-3xl font-bold text-primary">
            {value}<span className="text-xl text-text_secondary ml-1">{unit}</span>
        </p>
    </div>
);

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const renderLine = (line: string, index: number) => {
        if (line.startsWith('* ')) {
            return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith('- ')) {
            return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        return <p key={index}>{line}</p>;
    };

    return (
        <div className="prose prose-invert prose-p:my-1 prose-li:my-1">
            {text.split('\n').map(renderLine)}
        </div>
    );
};


export const ResultsModal: React.FC<ResultsModalProps> = ({ result, onRetry, onNewTest, aiTips, isTipsLoading, onRequestAiTips }) => {
    const modalContentRef = useRef<HTMLDivElement>(null);

    const exportToPdf = () => {
        const input = modalContentRef.current;
        if (input) {
            html2canvas(input, { backgroundColor: '#111827' }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                let width = pdfWidth;
                let height = width / ratio;

                if (height > pdfHeight) {
                    height = pdfHeight;
                    width = height * ratio;
                }
                
                pdf.addImage(imgData, 'PNG', (pdfWidth - width) / 2, 0, width, height);
                pdf.save(`yazma-sonucu-${result.date}.pdf`);
            });
        }
    };

    const exportToPng = () => {
        const input = modalContentRef.current;
        if (input) {
            html2canvas(input, { backgroundColor: '#111827' }).then(canvas => {
                const link = document.createElement('a');
                link.download = `yazma-sonucu-${result.date}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-medium rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div ref={modalContentRef} className="p-8">
                    <h2 className="text-3xl font-bold text-center mb-2">Test Tamamlandı!</h2>
                    <p className="text-center text-text_secondary mb-8">İşte sonuçların.</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard label="DKS" value={result.wpm} />
                        <StatCard label="Doğruluk" value={result.accuracy} unit="%" />
                        <StatCard label="Ham DKS" value={result.rawWpm} />
                        <StatCard label="Süre" value={result.timeElapsed} unit="s" />
                    </div>

                    <div className="bg-dark p-4 rounded-lg">
                         <h3 className="font-bold text-lg mb-2 text-primary">YZ Yazma Koçu</h3>
                        {aiTips ? (
                            <div className="text-text_secondary space-y-2"><MarkdownRenderer text={aiTips}/></div>
                        ) : (
                            <button
                                onClick={onRequestAiTips}
                                disabled={isTipsLoading}
                                className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-light"
                            >
                                {isTipsLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Analiz ediliyor...</span>
                                    </>
                                ) : (
                                    <span>YZ Geri Bildirimi Al</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col sm:flex-row gap-4">
                     <div className="flex-grow flex gap-4">
                        <button onClick={exportToPdf} className="w-full bg-light text-text_secondary font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">PDF'e Aktar</button>
                        <button onClick={exportToPng} className="w-full bg-light text-text_secondary font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">PNG'ye Aktar</button>
                     </div>
                     <div className="flex-grow flex gap-4">
                        <button onClick={onRetry} className="w-full bg-light text-text_primary font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">Metni Tekrarla</button>
                        <button onClick={onNewTest} className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Yeni Test</button>
                    </div>
                </div>
            </div>
        </div>
    );
};