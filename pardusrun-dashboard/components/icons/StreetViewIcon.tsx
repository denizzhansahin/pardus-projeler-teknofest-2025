
import React from 'react';

// A simple representation for Street View (e.g., a person/pegman or a road with a camera)
export const StreetViewIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-6.998l4.875-2.437a.38.38 0 01.502.341v11.332a.379.379 0 01-.502.342l-4.875-2.437M3.375 19.5V8.25S4.275 7.5 6 7.5s2.625.75 2.625.75V15M3.375 19.5h17.25M3.375 19.5l4.875-2.438m0 0A48.204 48.204 0 0112 15c2.19 0 4.29.141 6.25.404m-5.125 0V6.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /> {/* Represents a camera lens or person head */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3.75" /> {/* Represents body or pole */}
  </svg>
);
