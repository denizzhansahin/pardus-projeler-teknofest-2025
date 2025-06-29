
import { useState, useEffect, useCallback } from 'react';
import { HistoryItem } from '../types';

const HISTORY_STORAGE_KEY = 'pardus-dream-history';

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Failed to load history from localStorage', error);
      setItems([]);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save history to localStorage', error);
      }
    }
  }, [items, isInitialized]);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: new Date().toISOString() + Math.random(),
      createdAt: new Date().toISOString(),
    };
    setItems(prevItems => [newItem, ...prevItems]);
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setItems([]);
  }, []);

  const exportHistory = useCallback(() => {
    try {
      if (items.length === 0) {
        alert('Dışa aktarılacak geçmiş verisi bulunmuyor.');
        return;
      }
      const dataStr = JSON.stringify(items, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pardus-dream-gecmis-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export history', error);
      alert('Geçmiş dışa aktarılırken bir hata oluştu.');
    }
  }, [items]);

  const importHistory = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const importedItems: HistoryItem[] = JSON.parse(result);
          // Temel doğrulama: Her öğenin gerekli alanlara sahip olduğundan emin olun
          if (Array.isArray(importedItems) && importedItems.every(item => item.id && item.prompt && item.imageUrl && item.createdAt)) {
            setItems(importedItems);
            alert(`${importedItems.length} öğe başarıyla içe aktarıldı.`);
          } else {
            throw new Error('Invalid file format');
          }
        }
      } catch (error) {
        console.error('Failed to import history', error);
        alert('Geçmiş içe aktarılırken bir hata oluştu. Lütfen geçerli bir JSON dosyası seçin.');
      }
    };
    reader.onerror = () => {
        alert('Dosya okunurken bir hata oluştu.');
    };
    reader.readAsText(file);
  }, []);

  return {
    items,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
    exportHistory,
    importHistory,
  };
}