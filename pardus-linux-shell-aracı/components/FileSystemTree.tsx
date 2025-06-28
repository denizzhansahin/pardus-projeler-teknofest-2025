import React, { useState } from 'react';
import { FileSystemNode } from '../types';
import FolderIcon from './icons/FolderIcon';
import FileIcon from './icons/FileIcon';

interface FileSystemTreeProps {
  node: FileSystemNode;
}

const FileSystemTree: React.FC<FileSystemTreeProps> = ({ node }) => {
  const [isOpen, setIsOpen] = useState(node.name === '~' || node.name.startsWith('.'));

  const isDirectory = node.kind === 'directory';

  const handleToggle = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="font-mono text-sm">
      <div
        className={`flex items-center space-x-2 py-1 px-2 rounded-md ${isDirectory ? 'cursor-pointer hover:bg-gray-800' : ''}`}
        onClick={handleToggle}
      >
        {isDirectory ? (
          <FolderIcon isOpen={isOpen} />
        ) : (
          <FileIcon />
        )}
        <span>{node.name}</span>
      </div>
      {isOpen && isDirectory && node.children && (
        <div className="pl-6 border-l border-gray-700">
          {node.children
            .map(child => (
              <FileSystemTree key={child.name} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileSystemTree;