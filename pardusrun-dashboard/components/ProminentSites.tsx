// @ts-nocheck
import React from 'react';
import { SiteLink } from '../types';
import { POPULAR_SITES } from '../constants'; 
import { Facebook, Instagram, Newspaper, Tv, Globe, Bot } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'Pardus': <Globe className="w-12 h-12 sm:w-14 sm:h-14 mb-2 text-yellow-500" />,
  'Facebook': <Facebook className="w-12 h-12 sm:w-14 sm:h-14 mb-2 text-blue-600" />,
  'Instagram': <Instagram className="w-12 h-12 sm:w-14 sm:h-14 mb-2 text-pink-500" />,
  'Gemini': <Bot className="w-12 h-12 sm:w-14 sm:h-14 mb-2 text-purple-500" />,
  'TRT Haber': <Newspaper className="w-12 h-12 sm:w-14 sm:h-14 mb-2 text-red-600" />,
  'TRT Spor': <Tv className="w-12 h-12 sm:w-14 sm:h-14 mb-2 text-green-600" />,
};

interface ProminentSitesProps {}

const prominentSitesToShow: SiteLink[] = POPULAR_SITES.filter(site => 
  ["Pardus", "Facebook", "Instagram", "Gemini", "TRT Haber", "TRT Spor"].includes(site.name)
).slice(0, 6);

const ProminentSiteCard: React.FC<{ site: SiteLink }> = ({ site }) => {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${site.name} sitesini ziyaret et`}
      className={`flex flex-col items-center justify-center p-4 rounded-xl w-32 h-32 sm:w-36 sm:h-36
                  transform transition-all duration-300 ease-in-out
                  hover:scale-105 hover:shadow-2xl group focus:outline-none focus:ring-4 focus:ring-opacity-50`}
      style={{ 
        backgroundColor: site.bgColor || '#334155', 
        color: site.textColor || '#f1f5f9', 
        boxShadow: `0 4px 15px -3px ${site.bgColor ? site.bgColor+'99' : '#7c3aed99'}`, 
        borderColor: site.bgColor ? site.bgColor : '#7c3aed', 
      }}
    >
      {ICON_MAP[site.name]}
      <span className="text-sm sm:text-base font-semibold text-center mt-1 truncate w-full">{site.name}</span>
    </a>
  );
};

const ProminentSites: React.FC<ProminentSitesProps> = () => { 
  if (!prominentSitesToShow.length) {
    return null;
  }

  return (
    <section className="w-full max-w-4xl mb-10 sm:mb-12" aria-labelledby="prominent-sites-title">
      <h2 id="prominent-sites-title" className="sr-only">Popüler Siteler</h2>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {prominentSitesToShow.map((site) => (
          <ProminentSiteCard key={site.name} site={site} />
        ))}
      </div>
    </section>
  );
};

export default ProminentSites;
