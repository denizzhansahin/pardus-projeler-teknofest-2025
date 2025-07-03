import React, { useState, useCallback, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { generatePresentationOutline, generateSlideDetails, generateImage, enhanceImagePrompt, redesignSlide } from './services/geminiService';
import { Slide, SlideOutline, TextElement, ImageElement, ChatMessage, PresentationElement, SlideDetails, Presentation } from './types';
import { TextIcon, ImageIcon, DownloadIcon, LoaderIcon, PencilIcon, BotIcon, WandIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, BoldIcon, BringToFrontIcon, SendToBackIcon, TrashIcon, HomeIcon, CogIcon } from './components/icons';
import ChatAssistant from './components/ChatAssistant';
import ElementPropertiesPanel from './components/ElementPropertiesPanel';

const FONT_FACES = ['Inter', 'Roboto', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro'];
const LOCAL_STORAGE_KEY = 'pardus-presentations-data-v2';

const PresentationHub: React.FC<{
    presentations: Presentation[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onStartWithPrompt: (prompt: string) => void;
    onStartBlank: () => void;
    onShowApiKeyModal: () => void;
}> = ({ presentations, onLoad, onDelete, onStartWithPrompt, onStartBlank, onShowApiKeyModal }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        try {
            await onStartWithPrompt(prompt);
        } finally {
            setIsLoading(false);
        }
    };
    
    const sortedPresentations = [...presentations].sort((a, b) => b.lastModified - a.lastModified);

    return (
        <div className="w-full min-h-screen bg-pardus-dark text-pardus-light p-8">
            <div className="flex justify-end mb-4">
                <button onClick={onShowApiKeyModal} className="p-2 rounded-md hover:bg-pardus-secondary" title="Ayarlar"><CogIcon className="w-6 h-6"/></button>
            </div>
            <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-5xl font-bold mb-2">Pardus Ofis Sunum</h1>
                <p className="text-xl text-pardus-secondary mb-8">Yapay zeka ile fikirlerinizi saniyeler içinde etkileyici sunumlara dönüştürün.</p>
                 <div className="bg-pardus-secondary/20 p-6 rounded-lg mb-12">
                     <h2 className="text-2xl font-semibold mb-4 text-left">Yeni Bir Sunum Oluştur</h2>
                    <div className="flex w-full mb-4">
                        <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleStart()} placeholder="Örn: 'Türkiye'nin turistik yerleri hakkında bir sunum yap'" className="w-full p-4 rounded-l-lg bg-pardus-secondary text-pardus-light placeholder-pardus-light/50 focus:outline-none focus:ring-2 focus:ring-pardus-accent" disabled={isLoading} />
                        <button onClick={handleStart} className="bg-pardus-accent text-white font-bold p-4 rounded-r-lg hover:bg-sky-500 transition-colors disabled:bg-pardus-secondary disabled:cursor-wait flex items-center" disabled={isLoading}>
                            {isLoading ? <LoaderIcon className="w-6 h-6" /> : "AI ile Oluştur"}
                        </button>
                    </div>
                    <button onClick={onStartBlank} disabled={isLoading} className="bg-pardus-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-pardus-border transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        Veya Boş Bir Sunum Başlat
                    </button>
                 </div>

                {sortedPresentations.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-left">Önceki Sunumlarınız</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedPresentations.map(p => (
                                <div key={p.id} className="bg-pardus-secondary/30 rounded-lg p-4 flex flex-col justify-between text-left hover:bg-pardus-secondary/50 transition-colors group">
                                    <div>
                                        <div className="aspect-video w-full rounded-md mb-3 bg-pardus-dark" style={{ backgroundColor: p.slides[0]?.details?.backgroundColor }}>
                                            {/* Thumbnail can be improved later */}
                                        </div>
                                        <h3 className="font-bold text-lg truncate">{p.name}</h3>
                                        <p className="text-sm text-pardus-secondary group-hover:text-pardus-light/70">Son Düzenleme: {new Date(p.lastModified).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <button onClick={() => onLoad(p.id)} className="flex-1 bg-pardus-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-500 transition-colors">Aç</button>
                                        <button onClick={() => { if(window.confirm(`'${p.name}' sunumunu silmek istediğinizden emin misiniz?`)) onDelete(p.id)}} className="p-2 rounded-md text-pardus-secondary hover:bg-red-500 hover:text-white" title="Sil"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

type UpdatableProps = Partial<Omit<TextElement, 'id'|'type'>> | Partial<Omit<ImageElement, 'id'|'type'>>;

const createBlankSlide = (pageNum: number): Slide => {
    const textDefaults = {
      rotation: 0,
      italic: false,
      underline: false,
      letterSpacing: 0,
      lineHeight: 1.2,
      textShadow: null,
    };
    
    const titleElement: TextElement = {
        id: `el-${Date.now()}-1-${pageNum}`,
        type: 'text',
        content: 'Başlık Eklemek İçin Çift Tıklayın',
        position: { top: 100, left: 140 },
        size: { width: 1000, height: 100 },
        fontSize: 48,
        color: '#1E293B',
        fontFamily: 'Inter',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 1,
        ...textDefaults
    };
    const subtitleElement: TextElement = {
        id: `el-${Date.now()}-2-${pageNum}`,
        type: 'text',
        content: 'Alt başlık eklemek için çift tıklayın',
        position: { top: 250, left: 240 },
        size: { width: 800, height: 100 },
        fontSize: 28,
        color: '#475569',
        fontFamily: 'Inter',
        fontWeight: 'normal',
        textAlign: 'center',
        zIndex: 2,
        ...textDefaults
    };
    return {
        id: `slide-${pageNum}-${Date.now()}`,
        outline: { page: pageNum, title: `Sayfa ${pageNum}`, summary: '' },
        details: {
            backgroundColor: '#FFFFFF',
        },
        userElements: [titleElement, subtitleElement],
        chatHistory: [], // Başlangıçta boş olmalı
        isGenerating: false,
        hasBeenGenerated: true,
    };
};


const App: React.FC = () => {
    const [presentations, setPresentations] = useState<Presentation[]>([]);
    const [activePresentationId, setActivePresentationId] = useState<string | null>(null);

    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [downloadStatus, setDownloadStatus] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const [rightPanelTab, setRightPanelTab] = useState<'design' | 'image' | 'chat'>('design');
    const [draggingState, setDraggingState] = useState<{ elementId: string; offset: { x: number; y: number; } } | null>(null);
    const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('pardus-gemini-api-key') || '');
    const [apiKeySaved, setApiKeySaved] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const slideContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      try {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          setPresentations(JSON.parse(savedData));
        }
      } catch (e) {
        console.error("Could not load presentations from local storage", e);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      if (!isLoading) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(presentations));
      }
    }, [presentations, isLoading]);

    const activePresentation = presentations.find(p => p.id === activePresentationId);
    const slides = activePresentation?.slides || [];
    const currentSlide = slides[currentSlideIndex];

    const updateActivePresentation = (updater: (presentation: Presentation) => Presentation, skipTimestampUpdate = false) => {
        if (!activePresentationId) return;
        setPresentations(prev => 
            prev.map(p => {
                if (p.id !== activePresentationId) return p;
                const updated = updater(p);
                if (!skipTimestampUpdate) {
                    updated.lastModified = Date.now();
                }
                return updated;
            })
        );
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setDownloadMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [downloadMenuRef]);

    const handleStartPresentation = async (prompt: string) => {
        setError(null);
        try {
            const outlines = await generatePresentationOutline(prompt);
            const initialSlides: Slide[] = outlines.map(outline => ({
                id: `slide-${outline.page}`,
                outline,
                details: null,
                userElements: [],
                chatHistory: [], // Başlangıçta boş olmalı
                isGenerating: false,
                hasBeenGenerated: false,
            }));
            
            const newPresentation: Presentation = {
              id: `pres-${Date.now()}`,
              name: prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt,
              slides: initialSlides,
              lastModified: Date.now()
            };

            setPresentations(prev => [...prev, newPresentation]);
            setActivePresentationId(newPresentation.id);
            setCurrentSlideIndex(0);

        } catch (e) {
            setError(e instanceof Error ? e.message : "Bilinmeyen bir hata oluştu.");
            throw e; // re-throw to handle loading state in hub
        }
    };
    
    const fetchSlideDetails = useCallback(async (index: number, outline: SlideOutline) => {
        updateActivePresentation(p => ({ ...p, slides: p.slides.map((s, i) => i === index ? { ...s, isGenerating: true } : s)}), true);
        try {
            const generatedData = await generateSlideDetails(outline.title, outline.summary);
            const newElements: TextElement[] = generatedData.elements.map((el, elIndex) => ({
                ...(el as Omit<TextElement, 'id' | 'zIndex'>),
                id: `el-${Date.now()}-${elIndex}`,
                zIndex: elIndex + 1,
            }));
            
            updateActivePresentation(p => ({ ...p, slides: p.slides.map((s, i) => i === index ? { 
                ...s, 
                details: { backgroundColor: generatedData.backgroundColor }, 
                userElements: newElements,
                isGenerating: false, 
                hasBeenGenerated: true 
            } : s)}));

        } catch (e) {
            setError(`Slayt ${index + 1} için detaylar oluşturulamadı.`);
            updateActivePresentation(p => ({ ...p, slides: p.slides.map((s, i) => i === index ? { ...s, isGenerating: false, hasBeenGenerated: true, details: {backgroundColor: '#FFFFFF'}, userElements: [] } : s)}));
        }
    }, [activePresentationId]); // Depends on active ID to update correctly

    useEffect(() => {
        if (!activePresentation) return;
        const slideToGenerate = slides.find(s => !s.hasBeenGenerated && !s.isGenerating);
        if (slideToGenerate) {
            const index = slides.findIndex(s => s.id === slideToGenerate.id);
            if (index !== -1) {
                fetchSlideDetails(index, slideToGenerate.outline);
            }
        }
    }, [slides, fetchSlideDetails, activePresentation]);
    
    const handleSelectSlide = (index: number) => {
        setCurrentSlideIndex(index);
        setSelectedElementId(null);
        setEditingElementId(null);
    };

    const updateElement = useCallback((elementId: string, newProps: UpdatableProps) => {
        updateActivePresentation(p => ({ ...p, slides: p.slides.map((s, i) => {
            if (i !== currentSlideIndex) return s;
            return {
                ...s,
                userElements: s.userElements.map(el => {
                    if (el.id !== elementId) return el;
                    
                    const combined = { ...el, ...newProps };
                    if (newProps.position) combined.position = { ...el.position, ...newProps.position };
                    if (newProps.size) combined.size = { ...el.size, ...newProps.size };
                    
                    if (el.type === 'text' && 'textShadow' in newProps && newProps.textShadow) {
                      (combined as TextElement).textShadow = { ...(el as TextElement).textShadow!, ...newProps.textShadow };
                    }
                    if (el.type === 'image' && 'boxShadow' in newProps && newProps.boxShadow) {
                      (combined as ImageElement).boxShadow = { ...(el as ImageElement).boxShadow!, ...newProps.boxShadow };
                    }

                    return combined as PresentationElement;
                })
            };
        })}));
    }, [currentSlideIndex, activePresentationId]);

    const addElement = (type: 'text' | 'image', options?: Partial<TextElement | ImageElement>) => {
        if (!currentSlide) return;
        
        const maxZIndex = currentSlide.userElements.reduce((max, el) => Math.max(max, el.zIndex), 0);
        
        let newElement: PresentationElement;
        const base = {
            id: `el-${Date.now()}`,
            position: { top: 40, left: 40 },
            size: { width: 300, height: 200 },
            zIndex: maxZIndex + 1,
            rotation: 0,
        };

        if (type === 'text') {
            newElement = {
                ...base,
                type: 'text',
                size: { width: 250, height: 50 },
                content: 'Yeni Metin',
                fontSize: 20,
                color: '#1E293B',
                fontFamily: 'Inter',
                fontWeight: 'normal',
                textAlign: 'left',
                italic: false,
                underline: false,
                letterSpacing: 0,
                lineHeight: 1.2,
                textShadow: null,
                ...(options as Partial<TextElement>)
            };
        } else {
            newElement = {
                ...base,
                type: 'image',
                src: `https://picsum.photos/300/200?random=${Date.now()}`,
                opacity: 1,
                borderRadius: 0,
                borderWidth: 0,
                borderColor: '#000000',
                boxShadow: null,
                ...(options as Partial<ImageElement>)
            };
        }
        
        updateActivePresentation(p => ({ ...p, slides: p.slides.map((s, i) => i === currentSlideIndex ? { ...s, userElements: [...s.userElements, newElement] } : s)}));
        setSelectedElementId(newElement.id);
    };
    
    const handleChatNewMessage = (slideId: string, message: ChatMessage) => {
        updateActivePresentation(p => ({...p, slides: p.slides.map(s => s.id === slideId ? {...s, chatHistory: [...s.chatHistory, message]} : s)}));
    };
    
    const handleChatModelResponse = (slideId: string, message: ChatMessage) => {
        updateActivePresentation(p => ({...p, slides: p.slides.map(s => s.id === slideId ? {...s, chatHistory: [...s.chatHistory, message]} : s)}));
    };

    const updateSlideDetails = (newDetails: Partial<SlideDetails>) => {
        if (!currentSlide?.details) return;
        updateActivePresentation(p => ({...p, slides: p.slides.map((s, i) => i === currentSlideIndex ? { ...s, details: { ...s.details!, ...newDetails } } : s)}));
    };

    const updateSlideBackgroundImage = (url: string) => {
        if (!currentSlide) return;
        updateActivePresentation(p => ({...p, slides: p.slides.map((s, i) => i === currentSlideIndex ? { ...s, backgroundImage: url } : s)}));
    };
    
    const updatePresentationName = (newName: string) => {
        updateActivePresentation(p => ({ ...p, name: newName }));
    };

    const processAllSlides = async <T,>(processor: (canvas: HTMLCanvasElement, slide: Slide, index: number) => Promise<T>): Promise<T[]> => {
        setIsDownloading(true);
        setIsExporting(true); // Export başlarken
        const originalIndex = currentSlideIndex;
        const results: T[] = [];
        try {
            for (let i = 0; i < slides.length; i++) {
                if (!slides[i].details && !slides[i].backgroundImage) continue;
                setDownloadStatus(`İşleniyor: Sayfa ${i + 1} / ${slides.length}`);
                setCurrentSlideIndex(i);
                setSelectedElementId(null);
                await new Promise(res => setTimeout(res, 150)); // Allow render
                const slideElement = slideContainerRef.current;
                if (slideElement) {
                    const canvas = await (window as any).html2canvas(slideElement, { useCORS: true, allowTaint: false, backgroundColor: null, scale: 2 });
                    const result = await processor(canvas, slides[i], i);
                    results.push(result);
                }
            }
        } catch (e) {
            setError(e instanceof Error ? `İndirme hatası: ${e.message}`: 'İndirme sırasında bilinmeyan bir hata oluştu.');
        } finally {
            setCurrentSlideIndex(originalIndex);
            setIsDownloading(false);
            setDownloadStatus('');
            setDownloadMenuOpen(false);
            setIsExporting(false); // Export bitti
        }
        return results;
    }

    const handleDownloadAllPdf = async () => {
        const { jsPDF } = (window as any).jspdf;
        const slideElement = slideContainerRef.current;
        if (!slideElement) return;

        const doc = new jsPDF({ 
            orientation: 'landscape', 
            unit: 'px', 
            format: [slideElement.offsetWidth, slideElement.offsetHeight] 
        });

        await processAllSlides(async (canvas, slide, index) => {
            const imgData = canvas.toDataURL('image/png');
            if (index > 0) doc.addPage();
            doc.addImage(imgData, 'PNG', 0, 0, slideElement.offsetWidth, slideElement.offsetHeight);
        });
        
        doc.save(`${activePresentation?.name || 'Pardus-Sunum'}.pdf`);
    }

    const handleDownloadAllPngZip = async () => {
        const zip = new JSZip();

        const blobs = await processAllSlides(async (canvas, slide, index) => ({
          blob: await new Promise<Blob|null>(resolve => canvas.toBlob(resolve, 'image/png')),
          name: `Sayfa-${index + 1}.png`
        }));

        for (const {blob, name} of blobs) {
            if(blob) zip.file(name, blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `${activePresentation?.name || 'Pardus-Sunum'}-PNGs.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    const handleDownloadPPTX = async () => {
        // PptxGenJS globalde window.pptxgen veya window.PptxGenJS olabilir
        let PptxGenJS = (window as any).pptxgen || (window as any).PptxGenJS;
        if (!PptxGenJS) {
            setError('pptxgenjs kütüphanesi yüklenemedi. Lütfen pptxgenjs scriptinin yüklü olduğundan emin olun.');
            return;
        }
        // Hem fonksiyon hem constructor olabilir
        let pptx;
        try {
            pptx = typeof PptxGenJS === 'function' && PptxGenJS.prototype && PptxGenJS.prototype.addSlide ? new PptxGenJS() : PptxGenJS();
        } catch (e) {
            pptx = PptxGenJS();
        }
        pptx.layout = 'LAYOUT_16x9';

        await processAllSlides(async (canvas) => {
            const dataUrl = canvas.toDataURL('image/png');
            const slide = pptx.addSlide();
            slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
        });
        
        pptx.writeFile({ fileName: `${activePresentation?.name || 'Pardus-Sunum'}.pptx` });
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            setError("Dosya boyutu 50MB'ı geçemez.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target?.result as string;
            if (src) {
                addElement('image', { src });
            }
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Reset input
    };

    const handleMouseDownOnElement = (e: React.MouseEvent<HTMLDivElement>, element: PresentationElement) => {
        e.stopPropagation();

        if (e.detail === 2 && element.type === 'text') {
            e.preventDefault();
            setEditingElementId(element.id);
            setSelectedElementId(element.id);
            setDraggingState(null);
            return;
        }

        e.preventDefault();
        setSelectedElementId(element.id);

        if (editingElementId) {
            setEditingElementId(null);
        }
        
        const slideCanvas = slideContainerRef.current!.getBoundingClientRect();
        setDraggingState({
            elementId: element.id,
            offset: {
                x: e.clientX - slideCanvas.left - element.position.left,
                y: e.clientY - slideCanvas.top - element.position.top,
            }
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingState || !slideContainerRef.current) return;
        const slideCanvas = slideContainerRef.current.getBoundingClientRect();
        const newPos = {
            left: e.clientX - slideCanvas.left - draggingState.offset.x,
            top: e.clientY - slideCanvas.top - draggingState.offset.y,
        };
        updateElement(draggingState.elementId, { position: newPos });
    };

    const handleMouseUp = () => {
        setDraggingState(null);
    };
    
    const handleStartBlankPresentation = () => {
        const newPresentation: Presentation = {
            id: `pres-${Date.now()}`,
            name: 'Başlıksız Sunum',
            slides: [createBlankSlide(1)],
            lastModified: Date.now()
        };
        setPresentations(prev => [...prev, newPresentation]);
        setActivePresentationId(newPresentation.id);
        setCurrentSlideIndex(0);
    };

    const goToHub = () => {
        setActivePresentationId(null);
        setCurrentSlideIndex(0);
        setSelectedElementId(null);
        setEditingElementId(null);
    }
    
    const handleDeletePresentation = (id: string) => {
        setPresentations(prev => prev.filter(p => p.id !== id));
    };

    const addNewSlide = () => {
        const newSlide = createBlankSlide(slides.length + 1);
        updateActivePresentation(p => ({...p, slides: [...p.slides, newSlide]}));
        setCurrentSlideIndex(slides.length);
    };

    const deleteSlide = (indexToDelete: number) => {
        if (slides.length <= 1) {
            setError("Son slaytı silemezsiniz.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        updateActivePresentation(p => {
            const newSlides = p.slides.filter((_, i) => i !== indexToDelete);
            return { ...p, slides: newSlides.map((s, i) => ({ ...s, outline: { ...s.outline, page: i + 1, title: s.outline.title.startsWith("Sayfa") ? `Sayfa ${i+1}`: s.outline.title }})) };
        });
        
        if (currentSlideIndex >= indexToDelete) {
            setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
        }
    };
    
    const deleteElement = (elementId: string) => {
        updateActivePresentation(p => ({...p, slides: p.slides.map((s, i) => {
            if (i !== currentSlideIndex) return s;
            return {
                ...s,
                userElements: s.userElements.filter(el => el.id !== elementId)
            };
        })}));
        setSelectedElementId(null);
    };

    const handleSlideDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedSlideIndex(index);
    };

    const handleSlideDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleSlideDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedSlideIndex === null || draggedSlideIndex === dropIndex) {
            setDraggedSlideIndex(null);
            return;
        }

        const newSlides = [...slides];
        const [draggedItem] = newSlides.splice(draggedSlideIndex, 1);
        newSlides.splice(dropIndex, 0, draggedItem);
        
        const finalSlides = newSlides.map((s, i) => ({
            ...s,
            outline: {
                ...s.outline,
                page: i + 1,
                title: s.outline.title.match(/^Sayfa \d+$/) ? `Sayfa ${i + 1}` : s.outline.title
            }
        }));

        updateActivePresentation(p => ({...p, slides: finalSlides}));
        setCurrentSlideIndex(dropIndex);
        setDraggedSlideIndex(null);
    };

    const selectedElement = currentSlide?.userElements.find(el => el.id === selectedElementId);

    const handleSaveApiKey = () => {
        localStorage.setItem('pardus-gemini-api-key', apiKeyInput.trim());
        setApiKeySaved(true);
    };
    const handleReload = () => {
        window.location.reload();
    };

    if (isLoading) return <div className="w-full h-screen flex justify-center items-center bg-pardus-dark"><LoaderIcon className="w-12 h-12"/></div>
    if (!activePresentation) return (
        <>
            {/* API Key Modal (for hub) */}
            {showApiKeyModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                        <button onClick={() => setShowApiKeyModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
                        <h2 className="text-2xl font-bold mb-4 text-pardus-dark">API Anahtarını Ayarla</h2>
                        <p className="mb-4 text-pardus-dark">Google Gemini API anahtarınızı girin. Anahtarınız tarayıcınızda güvenli bir şekilde saklanacaktır.</p>
                        <input type="text" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} className="w-full p-3 border rounded mb-4" placeholder="API Key" />
                        <button onClick={handleSaveApiKey} className="w-full bg-pardus-accent text-white font-bold p-3 rounded hover:bg-sky-500 transition-colors">Kaydet</button>
                        {apiKeySaved && (
                            <div className="mt-4 flex flex-col items-center gap-2">
                                <p className="text-green-600">Kaydedildi! Devam etmek için sayfayı yenileyin.</p>
                                <button onClick={handleReload} className="bg-pardus-accent text-white font-bold px-4 py-2 rounded hover:bg-sky-500 transition-colors">Sayfayı Yenile</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <PresentationHub 
                presentations={presentations} 
                onLoad={setActivePresentationId} 
                onDelete={handleDeletePresentation} 
                onStartBlank={handleStartBlankPresentation} 
                onStartWithPrompt={handleStartPresentation}
                onShowApiKeyModal={() => setShowApiKeyModal(true)}
            />
        </>
    );

    return (
        <div className="w-full h-screen bg-pardus-dark flex flex-col font-sans" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <header className="flex-shrink-0 bg-gray-900/50 flex justify-between items-center p-2 border-b border-pardus-border">
                <div className="flex items-center gap-4">
                  <button onClick={goToHub} className="p-2 rounded-md hover:bg-pardus-secondary" title="Ana Sayfa"><HomeIcon className="w-5 h-5"/></button>
                  {isEditingTitle ? (
                    <input 
                      type="text"
                      value={activePresentation.name}
                      onChange={e => updatePresentationName(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)}
                      autoFocus
                      className="text-xl font-bold bg-pardus-secondary rounded-md px-2 py-1"
                    />
                  ) : (
                    <h1 onClick={() => setIsEditingTitle(true)} className="text-xl font-bold text-pardus-light cursor-pointer hover:bg-pardus-secondary/50 rounded-md px-2 py-1">{activePresentation.name}</h1>
                  )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => addElement('text')} className="p-2 rounded-md hover:bg-pardus-secondary" title="Metin Ekle"><TextIcon className="w-5 h-5"/></button>
                    <button onClick={() => addElement('image')} className="p-2 rounded-md hover:bg-pardus-secondary" title="Resim Ekle"><ImageIcon className="w-5 h-5"/></button>
                    <div className="relative" ref={downloadMenuRef}>
                        <button onClick={() => setDownloadMenuOpen(!downloadMenuOpen)} className="p-2 rounded-md hover:bg-pardus-secondary" title="İndir"><DownloadIcon className="w-5 h-5"/></button>
                         {downloadMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-pardus-dark border border-pardus-border rounded-md shadow-lg z-20">
                                <a onClick={handleDownloadAllPdf} className="block px-4 py-2 text-sm text-pardus-light hover:bg-pardus-secondary cursor-pointer">Tüm Sunumu PDF İndir</a>
                                <a onClick={handleDownloadAllPngZip} className="block px-4 py-2 text-sm text-pardus-light hover:bg-pardus-secondary cursor-pointer">Tüm Sunumu PNG (.zip) İndir</a>
                                <a onClick={handleDownloadPPTX} className="block px-4 py-2 text-sm text-pardus-light hover:bg-pardus-secondary cursor-pointer">Deneysel(Çalışmıyor) - Tüm Sunumu PPTX İndir</a>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setShowApiKeyModal(true)} className="p-2 rounded-md hover:bg-pardus-secondary" title="Ayarlar"><CogIcon className="w-5 h-5"/></button>
                </div>
            </header>
            <main className="flex-1 flex overflow-hidden">
                <aside className="w-48 bg-pardus-dark/70 p-2 overflow-y-auto space-y-2 border-r border-pardus-border" onDragOver={handleSlideDragOver}>
                    {slides.map((slide, index) => (
                        <div key={slide.id} 
                             onClick={() => handleSelectSlide(index)} 
                             className={`relative group w-full aspect-video rounded-md cursor-pointer border-2 transition-all ${currentSlideIndex === index ? 'border-pardus-accent' : 'border-pardus-border'} ${draggedSlideIndex === index ? 'opacity-50' : 'opacity-100'}`}
                             style={{ backgroundColor: slide.details?.backgroundColor || '#334155' }}
                             draggable="true"
                             onDragStart={(e) => handleSlideDragStart(e, index)}
                             onDrop={(e) => handleSlideDrop(e, index)}
                             onDragEnd={() => setDraggedSlideIndex(null)}
                        >
                             <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none'}}>
                                <div className="w-full h-full flex flex-col items-center justify-center p-1 text-xs text-white/80 bg-black/20 pointer-events-none">
                                    <span className="font-bold">{index + 1}</span>
                                    <span className="text-center truncate w-full">{slide.outline.title}</span>
                                    {slide.isGenerating && <LoaderIcon className="w-4 h-4 mt-1"/>}
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteSlide(index); }} className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600/80 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity z-10" title="Slaytı Sil">
                                <TrashIcon className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
                    <button onClick={addNewSlide} className="w-full aspect-video rounded-md border-2 border-dashed border-pardus-border flex items-center justify-center text-pardus-secondary hover:bg-pardus-secondary hover:text-pardus-light transition-colors" title="Yeni Slayt Ekle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </aside>
                
                <section className="flex-1 flex items-center justify-center p-8 bg-black/20 overflow-hidden">
                    <div id="slide-canvas" ref={slideContainerRef} className="aspect-video w-full max-w-6xl bg-white shadow-2xl relative" style={{ backgroundColor: currentSlide?.details?.backgroundColor, backgroundImage: currentSlide?.backgroundImage ? `url(${currentSlide.backgroundImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) {setSelectedElementId(null); setEditingElementId(null); }}}>
                      {currentSlide?.isGenerating && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><LoaderIcon className="w-12 h-12 text-white" /></div>}
                      {currentSlide?.userElements.map(el => {
                        const isSelected = selectedElementId === el.id;
                        const isEditing = editingElementId === el.id;
                        const elementStyle: React.CSSProperties = {
                           top: `${el.position.top}px`,
                           left: `${el.position.left}px`,
                           width: `${el.size.width}px`,
                           height: `${el.size.height}px`,
                           zIndex: el.zIndex,
                           transform: `rotate(${el.rotation}deg)`,
                        };
                        const textShadow = el.type === 'text' && el.textShadow ? `${el.textShadow.offsetX}px ${el.textShadow.offsetY}px ${el.textShadow.blur}px ${el.textShadow.color}` : 'none';
                        const boxShadow = el.type === 'image' && el.boxShadow ? `${el.boxShadow.offsetX}px ${el.boxShadow.offsetY}px ${el.boxShadow.blur}px ${el.boxShadow.spread}px ${el.boxShadow.color}` : 'none';

                        const wrapperClass = `absolute group ${isEditing ? 'outline-pardus-accent outline-2 outline z-20' : isSelected ? 'outline-dashed outline-2 outline-pardus-accent z-10' : 'hover:outline-dashed hover:outline-1 hover:outline-pardus-accent/50'}`;
                        
                        return (
                          <div key={el.id} onMouseDown={isEditing || isExporting ? undefined : (e) => handleMouseDownOnElement(e, el)} className={`${wrapperClass} ${isEditing ? 'cursor-auto' : 'cursor-move'}`} style={elementStyle}>
                            {el.type === 'text' ? (
                                isExporting ? (
                                    <div
                                        className="w-full h-full p-1"
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: isExporting ? toHex6(el.color) : el.color,
                                            fontSize: `${el.fontSize}px`,
                                            fontFamily: el.fontFamily,
                                            fontWeight: el.fontWeight,
                                            textAlign: el.textAlign,
                                            fontStyle: el.italic ? 'italic' : 'normal',
                                            textDecoration: el.underline ? 'underline' : 'none',
                                            letterSpacing: `${el.letterSpacing}em`,
                                            lineHeight: el.lineHeight,
                                            textShadow: el.textShadow ? `${el.textShadow.offsetX}px ${el.textShadow.offsetY}px ${el.textShadow.blur}px ${toHex6(el.textShadow.color)}` : 'none',
                                            overflow: 'hidden',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            cursor: 'default',
                                        }}
                                    >
                                        {el.content}
                                    </div>
                                ) : (
                                    <textarea 
                                        value={el.content} 
                                        onChange={(e) => updateElement(el.id, { content: e.target.value })} 
                                        readOnly={!isEditing}
                                        onBlur={() => setEditingElementId(null)}
                                        autoFocus={isEditing}
                                        className="w-full h-full resize-none p-1 focus:outline-none" 
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: el.color, 
                                            fontSize: `${el.fontSize}px`, 
                                            fontFamily: el.fontFamily, 
                                            fontWeight: el.fontWeight, 
                                            textAlign: el.textAlign,
                                            fontStyle: el.italic ? 'italic' : 'normal',
                                            textDecoration: el.underline ? 'underline' : 'none',
                                            letterSpacing: `${el.letterSpacing}em`,
                                            lineHeight: el.lineHeight,
                                            textShadow: textShadow,
                                            cursor: isEditing ? 'text' : 'inherit',
                                        }} 
                                    />
                                )
                            ) : (
                                <img 
                                    src={el.src} 
                                    className="w-full h-full object-cover pointer-events-none" 
                                    alt="user-upload" 
                                    style={{
                                        opacity: el.opacity,
                                        borderRadius: `${el.borderRadius}px`,
                                        border: isExporting ? `1px solid ${toHex6(el.borderColor)}` : `${el.borderWidth}px solid ${el.borderColor}`,
                                        boxShadow: el.boxShadow ? `${el.boxShadow.offsetX}px ${el.boxShadow.offsetY}px ${el.boxShadow.blur}px ${el.boxShadow.spread}px ${toHex6(el.boxShadow.color)}` : 'none',
                                    }} 
                                />
                            )}
                          </div>
                        )
                      })}
                    </div>
                </section>
                
                <aside className="w-80 bg-pardus-dark border-l border-pardus-border flex flex-col h-full">
                    {selectedElement ? (
                        <ElementPropertiesPanel selectedElement={selectedElement} updateElement={updateElement} deleteElement={deleteElement} currentSlide={currentSlide} />
                    ) : (
                        <SlideToolsPanel currentSlide={currentSlide} addElement={addElement} updateSlideDetails={updateSlideDetails} updateSlideBackgroundImage={updateSlideBackgroundImage} onNewMessage={handleChatNewMessage} onModelResponse={handleChatModelResponse} fileInputRef={fileInputRef} handleImageUpload={handleImageUpload} tab={rightPanelTab} setTab={setRightPanelTab} updateActivePresentation={updateActivePresentation} setError={setError} />
                    )}
                </aside>
            </main>
        </div>
    );
};

const SlideToolsPanel: React.FC<{
    currentSlide: Slide | null, addElement: (type: 'text' | 'image', options?: Partial<PresentationElement>) => void,
    updateSlideDetails: (d: Partial<SlideDetails>) => void, updateSlideBackgroundImage: (url: string) => void,
    onNewMessage: (id: string, msg: ChatMessage) => void, onModelResponse: (id: string, msg: ChatMessage) => void,
    fileInputRef: React.RefObject<HTMLInputElement>, handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
    tab: 'design' | 'image' | 'chat', setTab: (t: 'design' | 'image' | 'chat') => void,
    updateActivePresentation: (updater: (p: Presentation) => Presentation) => void, setError: (e: string | null) => void
}> = (props) => {
    const [imageGenPrompt, setImageGenPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedesigning, setIsRedesigning] = useState(false);
    const [error, setError] = useState('');

    const handleRedesign = async () => {
        if (!props.currentSlide) return;
        setIsRedesigning(true);
        setError('');
        try {
            const title = props.currentSlide.outline.title;
            const summary = props.currentSlide.userElements
                .filter(el => el.type === 'text')
                .map(el => (el as TextElement).content)
                .join('\n');
            const generatedData = await redesignSlide(title, summary || props.currentSlide.outline.summary);
            const newElements: PresentationElement[] = generatedData.elements.map((el, elIndex) => ({
                ...(el as Omit<TextElement, 'id' | 'zIndex'>),
                id: `el-${Date.now()}-${elIndex}`,
                zIndex: elIndex + 1,
            }));

             props.updateActivePresentation(p => ({ ...p, slides: p.slides.map(s => s.id === props.currentSlide?.id ? {
                 ...s,
                 details: { backgroundColor: generatedData.backgroundColor },
                 backgroundImage: undefined,
                 userElements: newElements
             } : s)}));

        } catch (e) {
            props.setError(e instanceof Error ? `Redesign failed: ${e.message}` : 'Failed to redesign slide');
        } finally {
            setIsRedesigning(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!imageGenPrompt) return;
        setIsProcessing(true);
        setError('');
        setGeneratedImage('');
        try {
            const base64 = await generateImage(imageGenPrompt);
            setGeneratedImage(`data:image/jpeg;base64,${base64}`);
        } catch (e) { setError(e instanceof Error ? e.message : 'Resim oluşturulamadı'); } finally { setIsProcessing(false); }
    };
    
    const handleEnhancePrompt = async () => {
        if (!imageGenPrompt) return;
        setIsProcessing(true);
        setError('');
        try {
            const enhanced = await enhanceImagePrompt(imageGenPrompt);
            setImageGenPrompt(enhanced);
        } catch (e) { setError(e instanceof Error ? e.message : 'Prompt geliştirilemedi'); } finally { setIsProcessing(false); }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex border-b border-pardus-border flex-shrink-0">
                <button onClick={() => props.setTab('design')} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${props.tab === 'design' ? 'bg-pardus-dark text-pardus-light' : 'text-pardus-secondary hover:bg-pardus-secondary/20'}`}><PencilIcon className="w-4 h-4"/> Tasarım</button>
                <button onClick={() => props.setTab('image')} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${props.tab === 'image' ? 'bg-pardus-dark text-pardus-light' : 'text-pardus-secondary hover:bg-pardus-secondary/20'}`}><ImageIcon className="w-4 h-4"/> Resim</button>
                <button onClick={() => props.setTab('chat')} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${props.tab === 'chat' ? 'bg-pardus-dark text-pardus-light' : 'text-pardus-secondary hover:bg-pardus-secondary/20'}`}><BotIcon className="w-4 h-4"/> Asistan</button>
            </div>

            {props.tab === 'design' && props.currentSlide && (
                <div className="p-4 space-y-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-pardus-light">Sayfa Tasarımı</h3>
                    <div><label className="text-sm text-pardus-secondary block mb-2">Arka Plan Rengi</label><input type="color" value={props.currentSlide.details?.backgroundColor || '#ffffff'} onChange={(e) => props.updateSlideDetails({ backgroundColor: e.target.value })} className="w-full h-10 bg-transparent p-0 border-none cursor-pointer rounded-lg" disabled={!props.currentSlide.details || !!props.currentSlide.backgroundImage}/></div>
                    <div><label className="text-sm text-pardus-secondary block mb-2">Arka Plan Resmi (URL)</label><input type="text" placeholder="https://.../image.png" value={props.currentSlide.backgroundImage || ''} onChange={(e) => props.updateSlideBackgroundImage(e.target.value)} className="w-full bg-pardus-secondary rounded-lg p-2 text-sm text-pardus-light focus:outline-none focus:ring-2 focus:ring-pardus-accent"/></div>
                    <div className="border-t border-pardus-border pt-4 mt-4 space-y-2">
                        <h4 className="text-md font-semibold text-pardus-light">AI Tasarım Araçları</h4>
                        <button onClick={handleRedesign} disabled={isRedesigning} className="w-full bg-pardus-accent text-white font-bold p-2 rounded-lg hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 disabled:bg-pardus-secondary disabled:cursor-wait">
                            {isRedesigning ? <LoaderIcon className="w-5 h-5"/> : <WandIcon className="w-5 h-5"/>}
                            {isRedesigning ? 'Tasarım Yenileniyor...' : 'AI ile Yeniden Tasarla'}
                        </button>
                    </div>
                </div>
            )}
            {props.tab === 'image' && (
                 <div className="p-4 space-y-4 overflow-y-auto flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-pardus-light">Resim Araçları</h3>
                    <div><button onClick={() => props.fileInputRef.current?.click()} className="w-full bg-pardus-accent text-white font-bold p-2 rounded-lg hover:bg-sky-500 transition-colors">Bilgisayardan Yükle (Max 50MB)</button><input type="file" ref={props.fileInputRef} onChange={props.handleImageUpload} accept="image/*" className="hidden" /></div>
                    <div className="border-t border-pardus-border pt-4 mt-4 space-y-2">
                        <h4 className="text-md font-semibold text-pardus-light">AI ile Resim Oluştur</h4>
                        {error && <p className="text-red-400 text-xs">{error}</p>}
                        <textarea value={imageGenPrompt} onChange={e => setImageGenPrompt(e.target.value)} placeholder="Oluşturmak istediğiniz resmi tanımlayın..." className="w-full bg-pardus-secondary rounded-lg p-2 text-sm text-pardus-light resize-none" rows={3} disabled={isProcessing}/>
                        <div className="flex gap-2"><button onClick={handleEnhancePrompt} className="flex-1 text-xs bg-pardus-secondary p-2 rounded-md hover:bg-pardus-border flex items-center justify-center gap-1" disabled={isProcessing}><WandIcon className="w-4 h-4"/> Prompt'u Geliştir</button><button onClick={handleGenerateImage} className="flex-1 bg-pardus-accent p-2 rounded-md hover:bg-sky-500" disabled={isProcessing || !imageGenPrompt}>{isProcessing ? <LoaderIcon className="w-5 h-5 mx-auto"/> : 'Oluştur'}</button></div>
                        {(generatedImage || isProcessing) && <div className="aspect-square bg-black/20 rounded-lg mt-2 flex items-center justify-center">{isProcessing ? <LoaderIcon className="w-8 h-8"/> : <img src={generatedImage} alt="Generated" className="max-h-full max-w-full rounded"/>}</div>}
                        {generatedImage && !isProcessing && <button onClick={() => props.addElement('image', {src: generatedImage})} className="w-full bg-green-600 text-white font-bold p-2 rounded-lg hover:bg-green-500 transition-colors mt-2">Slayta Ekle</button>}
                    </div>
                 </div>
            )}
            {props.tab === 'chat' && (
                <ChatAssistant currentSlide={props.currentSlide} onNewMessage={props.onNewMessage} onModelResponse={props.onModelResponse} />
            )}
        </div>
    );
};

// HEX renkleri #rrggbb formatına zorlamak için yardımcı fonksiyon
function toHex6(color: string): string {
    if (!color) return '#000000';
    if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
    if (/^#[0-9a-fA-F]{8}$/.test(color)) return color.slice(0, 7); // alpha'yı at
    if (/^#[0-9a-fA-F]{3}$/.test(color)) return '#' + color[1]+color[1]+color[2]+color[2]+color[3]+color[3];
    // rgb/rgba desteği eklenebilir
    return '#000000';
}

export default App;