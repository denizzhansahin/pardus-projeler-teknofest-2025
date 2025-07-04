import React from 'react';

interface KeyboardProps {
  activeKey: { key: string; correct: boolean } | null;
}

const KEY_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i', 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç', '.', '/', 'Shift'],
  [' '],
];

const SPECIAL_KEYS: { [key: string]: string } = {
    ' ': 'Space',
    'backspace': 'Backspace',
    'tab': 'Tab',
    'capslock': 'CapsLock',
    'enter': 'Enter',
    'shift': 'Shift'
};


export const Keyboard: React.FC<KeyboardProps> = ({ activeKey }) => {
  const getKeyStyle = (key: string) => {
    let baseStyle = 'h-12 rounded-md flex items-center justify-center font-mono text-sm transition-all duration-100';
    let specificStyle = 'bg-light text-text_primary';

    if (activeKey) {
        const activeKeyChar = activeKey.key.toLowerCase();
        const keyChar = key.toLowerCase();
        const isActive = activeKeyChar === keyChar || (keyChar === 'space' && activeKeyChar === ' ');
      
        if (isActive) {
            specificStyle = activeKey.correct 
                ? 'bg-correct text-white scale-110' 
                : 'bg-incorrect text-white scale-110';
        }
    }

    if (key.length > 1) { // Special keys like 'Backspace', 'Tab'
      baseStyle += ' px-2';
      if(key === 'Space') baseStyle += ' col-span-10'; // Space bar
      else baseStyle += ' col-span-2';
    } else {
        baseStyle += ' w-12';
    }

    return `${baseStyle} ${specificStyle}`;
  };

  return (
    <div className="bg-dark p-4 rounded-lg shadow-inner">
      <div className="space-y-2">
        {KEY_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className={`flex justify-center gap-2 ${rowIndex === 4 ? 'px-40' : ''}`}>
            {row.map((key) => (
              <div key={key} className={getKeyStyle(SPECIAL_KEYS[key.toLowerCase()] || key)}>
                {SPECIAL_KEYS[key.toLowerCase()] || key}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};