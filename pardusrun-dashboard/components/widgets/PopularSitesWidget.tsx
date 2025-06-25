
import React from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, SiteLink } from '../../types';
import { POPULAR_SITES } from '../../constants';
import { ArrowTopRightOnSquareIcon } from '../icons/ArrowTopRightOnSquareIcon';
import { HeartIcon } from '../icons/HeartIcon';

// Component for items directly on the card (opens intermediate modal)
const PopularSiteItemInteractive: React.FC<{ site: SiteLink; onClick: () => void }> = ({ site, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-lg ${site.bgColor || 'bg-gray-100'} 
               hover:opacity-90 transition-all duration-200 group focus:outline-none focus:ring-2 
               focus:ring-offset-2 focus:ring-offset-white`}
    style={{ borderColor: site.bgColor ? site.bgColor : '#a78bfa' }}
    aria-label={`${site.name} sitesini ziyaret et`}
  >
    <div className="flex items-center space-x-3">
      {site.icon && <site.icon className={`w-5 h-5 ${site.textColor || 'text-purple-600'}`} />}
      <span className={`font-medium ${site.textColor || 'text-gray-700'}`}>{site.name}</span>
    </div>
    <ArrowTopRightOnSquareIcon className={`w-4 h-4 ${site.textColor || 'text-gray-500'} opacity-70 group-hover:opacity-100 transition-opacity`} />
  </button>
);

// New component for direct linking items in the "View All" modal
const DirectPopularSiteItem: React.FC<{ site: SiteLink }> = ({ site }) => (
  <a
    href={site.url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${site.name} sitesini ziyaret et`}
    className={`w-full flex items-center justify-between p-3 rounded-lg ${site.bgColor || 'bg-gray-100'} 
               hover:opacity-90 transition-all duration-200 group focus:outline-none focus:ring-2 
               focus:ring-offset-2 focus:ring-offset-white`}
    style={{ borderColor: site.bgColor ? site.bgColor : '#a78bfa' }}
  >
    <div className="flex items-center space-x-3">
      {site.icon && <site.icon className={`w-5 h-5 ${site.textColor || 'text-purple-600'}`} />}
      <span className={`font-medium ${site.textColor || 'text-gray-700'}`}>{site.name}</span>
    </div>
    <ArrowTopRightOnSquareIcon className={`w-4 h-4 ${site.textColor || 'text-gray-500'} opacity-70 group-hover:opacity-100 transition-opacity`} />
  </a>
);


const PopularSitesWidget: React.FC<WidgetSectionProps> = ({ openModal }) => {
  const handleSiteClickInteractive = (site: SiteLink) => {
    openModal(
      site.name,
      <div className="p-4 text-center text-gray-700">
        <h3 className="text-2xl font-bold mb-4">{site.name}</h3>
        {site.icon && <site.icon className={`w-16 h-16 mx-auto mb-4 ${site.textColor || 'text-purple-600'}`} />}
        <p className="mb-6 text-gray-600">
          {site.name} sitesini ziyaret etmek üzeresiniz. Devam etmek için aşağıdaki butona tıklayın.
        </p>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white"
        >
          {site.name} Sitesine Git <ArrowTopRightOnSquareIcon className="w-5 h-5 inline-block ml-2" />
        </a>
      </div>,
      false,
      'lg'
    );
  };
  
  return (
    <WidgetCard title="Popüler Siteler" icon={<HeartIcon className="w-6 h-6" />}>
      <div className="space-y-3">
        {POPULAR_SITES.slice(0, 3).map((site) => (
           <PopularSiteItemInteractive key={site.name} site={site} onClick={() => handleSiteClickInteractive(site)} />
        ))}
      </div>
       {POPULAR_SITES.length > 3 && (
        <button 
        onClick={() => openModal("Tüm Popüler Siteler", 
            <div className="space-y-3 p-2">
                {POPULAR_SITES.map(site => <DirectPopularSiteItem key={site.name} site={site} />)}
            </div>,
            false,
            'xl' 
        )}
        className="mt-4 w-full text-sm text-purple-600 hover:text-purple-700 transition-colors py-2.5 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-white font-medium"
        >
            Tümünü Görüntüle ({POPULAR_SITES.length})
        </button>
       )}
    </WidgetCard>
  );
};

export default PopularSitesWidget;
