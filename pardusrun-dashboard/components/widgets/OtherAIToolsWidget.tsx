
import React from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, AISiteLink } from '../../types';
import { OTHER_AI_TOOLS } from '../../constants';
import { WrenchScrewdriverIcon } from '../icons/WrenchScrewdriverIcon'; 
import { ArrowTopRightOnSquareIcon } from '../icons/ArrowTopRightOnSquareIcon';

const AIToolItem: React.FC<{ tool: AISiteLink }> = ({ tool }) => (
  <a
    href={tool.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block p-3 rounded-lg bg-gray-100 hover:bg-gray-200/80 transition-colors group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 focus:ring-offset-white"
    aria-label={`${tool.name} sitesini ziyaret et`}
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium text-gray-700">{tool.name}</h4>
        {tool.description && <p className="text-xs text-gray-500">{tool.description}</p>}
      </div>
      <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors flex-shrink-0 ml-2" />
    </div>
  </a>
);

const OtherAIToolsWidget: React.FC<WidgetSectionProps> = ({ apiKeyAvailable }) => {
  return (
    <WidgetCard title="Diğer AI Araçları" icon={<WrenchScrewdriverIcon className="w-6 h-6 text-teal-600" />}>
      {OTHER_AI_TOOLS.length > 0 ? (
        <div className="space-y-2.5">
          {OTHER_AI_TOOLS.map((tool) => (
            <AIToolItem key={tool.name} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Listelenecek AI aracı bulunamadı.</p>
      )}
       <p className="text-xs text-gray-400 mt-3 text-center">
        Bu araçlar harici web siteleridir.
      </p>
    </WidgetCard>
  );
};

export default OtherAIToolsWidget;
