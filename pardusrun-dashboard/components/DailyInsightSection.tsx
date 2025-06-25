
import React from 'react';
import EventOfTheDayWidget from './widgets/EventOfTheDayWidget';
import QuoteOfTheDayWidget from './widgets/QuoteOfTheDayWidget';
import RecipeOfTheDayWidget from './widgets/RecipeOfTheDayWidget';

interface DailyInsightSectionProps {
  apiKeyAvailable: boolean;
}

const DailyInsightSection: React.FC<DailyInsightSectionProps> = ({ apiKeyAvailable }) => {
  if (!apiKeyAvailable) { // Optionally hide the whole section or show a message
    return (
      <section className="w-full max-w-4xl mb-8 px-4" aria-labelledby="daily-insights-title">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-lg text-sm text-center" role="alert">
          API Anahtarı yapılandırılmadığı için günlük içerikler (Günün Olayı, Sözü, Tarifi) yüklenemiyor.
        </div>
      </section>
    );
  }
  return (
    <section className="w-full max-w-4xl mb-8 px-4" aria-labelledby="daily-insights-title">
      <h2 id="daily-insights-title" className="text-lg font-semibold text-gray-700 mb-3 text-center sm:text-left">
        Günün İçerikleri
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EventOfTheDayWidget apiKeyAvailable={apiKeyAvailable} />
        <QuoteOfTheDayWidget apiKeyAvailable={apiKeyAvailable} />
        <RecipeOfTheDayWidget apiKeyAvailable={apiKeyAvailable} />
      </div>
    </section>
  );
};

export default DailyInsightSection;
