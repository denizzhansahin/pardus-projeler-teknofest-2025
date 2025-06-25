
import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { DailyRecipe } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { ClipboardDocumentListIcon } from '../icons/ClipboardDocumentListIcon'; // Assume this exists

interface RecipeOfTheDayWidgetProps {
    apiKeyAvailable: boolean;
}

const RecipeOfTheDayWidget: React.FC<RecipeOfTheDayWidgetProps> = ({ apiKeyAvailable }) => {
  const [recipeData, setRecipeData] = useState<DailyRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
     if (!apiKeyAvailable) {
        setError("API Anahtarı eksik.");
        return;
    }
    const fetchRecipe = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await geminiService.fetchRecipeOfTheDay();
        setRecipeData(data);
      } catch (err) {
        console.error("Günün tarifi alınırken hata:", err);
        setError("Günün tarifi alınamadı.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();
  }, [apiKeyAvailable]);

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-full flex flex-col">
      <div className="flex items-center mb-2">
        <ClipboardDocumentListIcon className="w-5 h-5 text-orange-500 mr-2" />
        <h3 className="text-md font-semibold text-gray-700">Günün Yemek Tarifi</h3>
      </div>
      {isLoading && <LoadingSpinner size="w-6 h-6" />}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {recipeData && !isLoading && !error && (
        <div className="text-sm text-gray-600 flex-grow overflow-y-auto max-h-48">
          <h4 className="font-semibold mb-1">{recipeData.name}</h4>
          {recipeData.prepTime && <p className="text-xs text-gray-500 mb-1">Hazırlık: {recipeData.prepTime}</p>}
          <strong className="text-xs">Malzemeler:</strong>
          <ul className="list-disc list-inside text-xs ml-2 mb-1">
            {recipeData.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
          <strong className="text-xs">Hazırlanışı:</strong>
          <p className="text-xs whitespace-pre-line">{recipeData.instructions}</p>
        </div>
      )}
      {!recipeData && !isLoading && !error && apiKeyAvailable && (
         <p className="text-xs text-gray-400">Günün tarifi bulunamadı.</p>
      )}
    </div>
  );
};

export default RecipeOfTheDayWidget;
