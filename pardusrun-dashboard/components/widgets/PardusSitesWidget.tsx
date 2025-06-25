
import React from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, SiteLink } from '../../types';
import { PARDUS_SITES } from '../../constants';
import { GlobeAltIcon } from '../icons/GlobeAltIcon';
import { ArrowTopRightOnSquareIcon } from '../icons/ArrowTopRightOnSquareIcon';

const PardusSiteItem: React.FC<{ site: SiteLink; onClick: () => void }> = ({ site, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-3.5 rounded-lg bg-gray-100 hover:bg-gray-200/80 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white"
    aria-label={`${site.name} sitesini ziyaret et`}
  >
    <div className="flex items-center space-x-3">
      <GlobeAltIcon className="w-5 h-5 text-green-600" /> 
      <span className="font-medium text-gray-700">{site.name}</span> 
    </div>
    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-500 opacity-70 group-hover:opacity-100 transition-opacity" /> 
  </button>
);

const PardusSitesWidget: React.FC<WidgetSectionProps> = ({ openModal }) => {
  const handleSiteClick = (site: SiteLink) => {
     openModal(
      site.name,
      <div className="p-4 text-center text-gray-700"> 
        <GlobeAltIcon className="w-16 h-16 mx-auto mb-4 text-green-500" /> 
        <h3 className="text-2xl font-bold mb-4">{site.name}</h3>

        <p className="mb-6 text-gray-600"> 
          {site.name} sayfasını keşfedin. Resmi sayfayı ziyaret etmek için aşağıya tıklayın.
        </p>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white" 
        >
          {site.name} Sayfasına Git <ArrowTopRightOnSquareIcon className="w-5 h-5 inline-block ml-2" />
        </a>
      </div>,
      false,
      'lg' 
    );
  };

  return (
    <WidgetCard title="Pardus Dünyası" icon={<GlobeAltIcon className="w-6 h-6 text-green-500" />}> 
      <div className="space-y-3">
        {PARDUS_SITES.map((site) => (
          <PardusSiteItem key={site.name} site={site} onClick={() => handleSiteClick(site)} />
        ))}
      </div>
    </WidgetCard>
  );
};

export default PardusSitesWidget;
