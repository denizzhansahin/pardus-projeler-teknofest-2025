import React from 'react';
import PardusLogo from './Pardus-03.png';

// Pardus-03.png is now used as the app icon
export const AppIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={PardusLogo} alt="Pardus Logo" {...props} />
);
