
import React from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, ModalProps as CustomModalProps } from '../../types'; 

interface PlaceholderWidgetProps extends WidgetSectionProps {
  title: string;
  icon: React.ReactNode;
  contentMessage: string;
  modalContent?: React.ReactNode; 
  iframeSrc?: string;
  modalTitle?: string; 
  modalSize?: CustomModalProps['size']; 
}

const PlaceholderWidget: React.FC<PlaceholderWidgetProps> = ({ openModal, title, icon, contentMessage, modalContent, iframeSrc, modalTitle, modalSize, apiKeyAvailable }) => {
  const handleClick = () => {
    const finalModalTitle = modalTitle || title;
    const sizeForModal = modalSize || (iframeSrc ? '5xl' : (React.isValidElement(modalContent) ? 'xl' : 'lg') ); // Adjust size for React elements

    if (iframeSrc) {
      openModal(
        finalModalTitle, 
        <div className="aspect-video bg-gray-900 rounded-lg">
          <iframe 
            src={iframeSrc} 
            title={finalModalTitle} 
            className="w-full h-full border-0 rounded-lg"
            allow="geolocation" 
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>,
        false, 
        sizeForModal
      );
    } else if (modalContent) {
      openModal(finalModalTitle, modalContent, false, sizeForModal);
    } else {
      openModal(finalModalTitle, <p className="text-gray-600">{contentMessage}</p>, false, sizeForModal);
    }
  };

  let styledIcon = icon;
  if (React.isValidElement(icon)) {
    const currentIconProps = (icon as React.ReactElement<any>).props;
    const iconColorClass = currentIconProps.className?.includes('text-') ? '' : 'text-purple-600'; 
    styledIcon = React.cloneElement(icon as React.ReactElement<any>, { 
      className: `${currentIconProps.className || ''} ${iconColorClass} group-hover:scale-110 transition-transform duration-300` 
    });
  }


  return (
    <WidgetCard title={title} icon={styledIcon} onCardClick={handleClick}>
      <div 
        className="flex flex-col items-center justify-center h-full text-center p-4 group"
      >
        <div className="mb-3 transform transition-transform duration-300 group-hover:scale-110">{styledIcon}</div>
        <p className="text-sm text-gray-500 mb-3">{contentMessage}</p>
        <button 
          onClick={(e) => {
            // Prevent card's onCardClick from firing if modalContent might have its own interactive elements
            // Or ensure modalContent itself handles its interactions correctly.
            // For simple cases, stopping propagation is fine.
            e.stopPropagation(); 
            handleClick();
          }}
          className="text-xs text-purple-600 hover:text-purple-700 transition-colors py-1.5 px-3.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-gray-100/70 font-medium"
        >
          {iframeSrc ? "Görüntüle" : (modalContent ? "Detayları Gör" : "Daha Fazla Bilgi")}
        </button>
      </div>
    </WidgetCard>
  );
};

export default PlaceholderWidget;
