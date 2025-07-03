
import React from 'react';
import { PresentationElement, Slide, TextElement, ImageElement } from '../types';
import { AlignLeftIcon, AlignCenterIcon, AlignRightIcon, BoldIcon, ItalicIcon, UnderlineIcon, BringToFrontIcon, SendToBackIcon, TrashIcon } from './icons';

const FONT_FACES = ['Inter', 'Roboto', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro'];

type UpdatableProps = Partial<Omit<TextElement, 'id' | 'type'>> | Partial<Omit<ImageElement, 'id' | 'type'>>;

const PropertyGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-pardus-border pt-3 mt-3">
        <h4 className="text-md font-semibold text-pardus-light mb-2">{title}</h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const ElementPropertiesPanel: React.FC<{
    selectedElement: PresentationElement;
    updateElement: (id: string, props: UpdatableProps) => void;
    deleteElement: (id: string) => void;
    currentSlide: Slide;
}> = ({ selectedElement, updateElement, deleteElement, currentSlide }) => {

    const bringToFront = () => {
        const maxZ = currentSlide.userElements.reduce((max, el) => Math.max(max, el.zIndex), 0);
        updateElement(selectedElement.id, { zIndex: maxZ + 1 });
    };

    const sendToBack = () => {
        const minZ = currentSlide.userElements.reduce((min, el) => Math.min(min, el.zIndex), 0);
        updateElement(selectedElement.id, { zIndex: minZ - 1 });
    };

    const updateShadow = (prop: string, value: any) => {
        const currentShadow = (selectedElement as TextElement).textShadow || (selectedElement as ImageElement).boxShadow || { offsetX: 0, offsetY: 0, blur: 0, color: '#000000', spread: 0 };
        const newShadow = { ...currentShadow, [prop]: value };
        const propToUpdate = selectedElement.type === 'text' ? 'textShadow' : 'boxShadow';
        updateElement(selectedElement.id, { [propToUpdate]: newShadow });
    }

    if (!selectedElement) return null;

    const textEl = selectedElement.type === 'text' ? selectedElement : null;
    const imageEl = selectedElement.type === 'image' ? selectedElement : null;

    return (
        <div className="p-4 space-y-4 overflow-y-auto h-full">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-pardus-light capitalize">{selectedElement.type} Özellikleri</h3>
                <button onClick={() => deleteElement(selectedElement.id)} className="p-1 text-pardus-secondary hover:text-red-500" title="Elementi Sil"><TrashIcon className="w-5 h-5"/></button>
            </div>
            
            <PropertyGroup title="Pozisyon ve Boyut">
                <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-pardus-secondary">Genişlik (px)</label><input type="number" value={Math.round(selectedElement.size.width)} onChange={e => updateElement(selectedElement.id, { size: { width: parseInt(e.target.value) || 0, height: selectedElement.size.height } })} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                    <div><label className="text-xs text-pardus-secondary">Yükseklik (px)</label><input type="number" value={Math.round(selectedElement.size.height)} onChange={e => updateElement(selectedElement.id, { size: { width: selectedElement.size.width, height: parseInt(e.target.value) || 0 } })} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                </div>
            </PropertyGroup>

            <PropertyGroup title="Dönüşüm ve Katman">
                 <div>
                    <label className="text-xs text-pardus-secondary">Döndürme: {selectedElement.rotation}°</label>
                    <input type="range" min="-180" max="180" value={selectedElement.rotation} onChange={e => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} className="w-full h-2 bg-pardus-secondary rounded-lg appearance-none cursor-pointer" />
                </div>
                 <div>
                    <label className="text-xs text-pardus-secondary">Katman</label>
                    <div className="flex items-center gap-2">
                        <button onClick={sendToBack} className="flex-1 bg-pardus-secondary p-2 rounded-md hover:bg-pardus-border flex items-center justify-center gap-1" title="En Arkaya Gönder"><SendToBackIcon className="w-5 h-5" /></button>
                        <button onClick={bringToFront} className="flex-1 bg-pardus-secondary p-2 rounded-md hover:bg-pardus-border flex items-center justify-center gap-1" title="En Öne Getir"><BringToFrontIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </PropertyGroup>

            {textEl && (
                <>
                    <PropertyGroup title="Metin Stili">
                        <div className="flex items-center gap-1 bg-pardus-secondary rounded p-1">
                            <button onClick={() => updateElement(textEl.id, { textAlign: 'left' })} className={`flex-1 p-1 rounded ${textEl.textAlign === 'left' ? 'bg-pardus-accent' : ''}`}><AlignLeftIcon className="w-5 h-5" /></button>
                            <button onClick={() => updateElement(textEl.id, { textAlign: 'center' })} className={`flex-1 p-1 rounded ${textEl.textAlign === 'center' ? 'bg-pardus-accent' : ''}`}><AlignCenterIcon className="w-5 h-5" /></button>
                            <button onClick={() => updateElement(textEl.id, { textAlign: 'right' })} className={`flex-1 p-1 rounded ${textEl.textAlign === 'right' ? 'bg-pardus-accent' : ''}`}><AlignRightIcon className="w-5 h-5" /></button>
                            <button onClick={() => updateElement(textEl.id, { fontWeight: textEl.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`p-1 rounded ${textEl.fontWeight === 'bold' ? 'bg-pardus-accent' : ''}`}><BoldIcon className="w-5 h-5" /></button>
                            <button onClick={() => updateElement(textEl.id, { italic: !textEl.italic })} className={`p-1 rounded ${textEl.italic ? 'bg-pardus-accent' : ''}`}><ItalicIcon className="w-5 h-5" /></button>
                            <button onClick={() => updateElement(textEl.id, { underline: !textEl.underline })} className={`p-1 rounded ${textEl.underline ? 'bg-pardus-accent' : ''}`}><UnderlineIcon className="w-5 h-5" /></button>
                            <input type="color" value={textEl.color} onChange={e => updateElement(textEl.id, { color: e.target.value })} className="w-8 h-8 bg-transparent p-0 border-none cursor-pointer" title="Yazı Rengi" />
                        </div>
                        <div><label className="text-xs text-pardus-secondary">Yazı Tipi</label><select value={textEl.fontFamily} onChange={e => updateElement(textEl.id, { fontFamily: e.target.value })} className="w-full bg-pardus-secondary rounded p-2 text-sm text-pardus-light">{FONT_FACES.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-xs text-pardus-secondary">Boyut</label><input type="number" value={textEl.fontSize} onChange={e => updateElement(textEl.id, { fontSize: parseInt(e.target.value) || 0 })} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                            <div><label className="text-xs text-pardus-secondary">Satır Yük.</label><input type="number" step="0.1" value={textEl.lineHeight} onChange={e => updateElement(textEl.id, { lineHeight: parseFloat(e.target.value) || 0 })} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                        </div>
                        <div>
                           <label className="text-xs text-pardus-secondary">Harf Aralığı: {textEl.letterSpacing}em</label>
                           <input type="range" min="-0.1" max="0.3" step="0.01" value={textEl.letterSpacing} onChange={e => updateElement(textEl.id, { letterSpacing: parseFloat(e.target.value) })} className="w-full h-2 bg-pardus-secondary rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </PropertyGroup>
                     <PropertyGroup title="Metin Gölgesi">
                        <button onClick={() => updateElement(textEl.id, { textShadow: textEl.textShadow ? null : { offsetX: 2, offsetY: 2, blur: 4, color: '#00000080' }})} className="w-full text-sm bg-pardus-secondary p-2 rounded-md hover:bg-pardus-border">{textEl.textShadow ? 'Gölgeyi Kaldır' : 'Gölge Ekle'}</button>
                        {textEl.textShadow && <div className="space-y-2">
                             <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs text-pardus-secondary">X Ofset</label><input type="number" value={textEl.textShadow.offsetX} onChange={e => updateShadow('offsetX', parseInt(e.target.value))} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                                <div><label className="text-xs text-pardus-secondary">Y Ofset</label><input type="number" value={textEl.textShadow.offsetY} onChange={e => updateShadow('offsetY', parseInt(e.target.value))} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                             </div>
                             <div className="flex items-center gap-2">
                                <label className="text-xs text-pardus-secondary">Bulanıklık</label><input type="number" value={textEl.textShadow.blur} onChange={e => updateShadow('blur', parseInt(e.target.value))} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" />
                                <input type="color" value={textEl.textShadow.color} onChange={e => updateShadow('color', e.target.value)} className="w-8 h-8 flex-shrink-0 bg-transparent p-0 border-none cursor-pointer" title="Gölge Rengi" />
                            </div>
                        </div>}
                    </PropertyGroup>
                </>
            )}
            {imageEl && (
                <>
                    <PropertyGroup title="Görsel Stili">
                        <div>
                           <label className="text-xs text-pardus-secondary">Opaklık: {Math.round(imageEl.opacity * 100)}%</label>
                           <input type="range" min="0" max="1" step="0.01" value={imageEl.opacity} onChange={e => updateElement(imageEl.id, { opacity: parseFloat(e.target.value) })} className="w-full h-2 bg-pardus-secondary rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                           <label className="text-xs text-pardus-secondary">Kenar Yarıçapı: {imageEl.borderRadius}px</label>
                           <input type="range" min="0" max="200" value={imageEl.borderRadius} onChange={e => updateElement(imageEl.id, { borderRadius: parseInt(e.target.value) })} className="w-full h-2 bg-pardus-secondary rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </PropertyGroup>
                     <PropertyGroup title="Kenarlık">
                         <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-xs text-pardus-secondary">Genişlik</label><input type="number" value={imageEl.borderWidth} onChange={e => updateElement(imageEl.id, { borderWidth: parseInt(e.target.value) || 0 })} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                            <div><label className="text-xs text-pardus-secondary">Renk</label><input type="color" value={imageEl.borderColor} onChange={e => updateElement(imageEl.id, { borderColor: e.target.value })} className="w-full h-8 bg-transparent p-0 border-none cursor-pointer" /></div>
                         </div>
                    </PropertyGroup>
                    <PropertyGroup title="Kutu Gölgesi">
                        <button onClick={() => updateElement(imageEl.id, { boxShadow: imageEl.boxShadow ? null : { offsetX: 2, offsetY: 4, blur: 8, spread: 0, color: '#00000080' }})} className="w-full text-sm bg-pardus-secondary p-2 rounded-md hover:bg-pardus-border">{imageEl.boxShadow ? 'Gölgeyi Kaldır' : 'Gölge Ekle'}</button>
                        {imageEl.boxShadow && <div className="space-y-2">
                             <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs text-pardus-secondary">X Ofset</label><input type="number" value={imageEl.boxShadow.offsetX} onChange={e => updateShadow('offsetX', parseInt(e.target.value))} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                                <div><label className="text-xs text-pardus-secondary">Y Ofset</label><input type="number" value={imageEl.boxShadow.offsetY} onChange={e => updateShadow('offsetY', parseInt(e.target.value))} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <div><label className="text-xs text-pardus-secondary">Bulanıklık</label><input type="number" value={imageEl.boxShadow.blur} onChange={e => updateShadow('blur', parseInt(e.target.value))} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                                <div><label className="text-xs text-pardus-secondary">Yayılma</label><input type="number" value={imageEl.boxShadow.spread} onChange={e => updateShadow('spread', parseInt(e.target.value))} className="w-full bg-pardus-secondary rounded p-1 text-sm text-pardus-light" /></div>
                            </div>
                            <div>
                                <label className="text-xs text-pardus-secondary">Renk</label>
                                <input type="color" value={imageEl.boxShadow.color} onChange={e => updateShadow('color', e.target.value)} className="w-full h-8 bg-transparent p-0 border-none cursor-pointer" />
                            </div>
                        </div>}
                    </PropertyGroup>
                </>
            )}
        </div>
    );
};

export default ElementPropertiesPanel;