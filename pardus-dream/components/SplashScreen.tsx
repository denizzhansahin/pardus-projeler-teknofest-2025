import React, { useState, useEffect } from 'react';

const SplashScreen: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFade(true), 2000); // Start fade-out after 2s
    const timer2 = setTimeout(() => {
      setShow(false);
      onFinished();
    }, 2500); // Remove from DOM after fade-out

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinished]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 animate-fade-in">
        Hayal etmeye hazır mısın?
      </h1>
    </div>
  );
};

export default SplashScreen;
