import { useState, useCallback } from 'react';
import { FileSystemNode, AICommand } from '../types';

// Add this declaration to extend the Window interface with the File System Access API method.
declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

// Type guards for File System Access API handles
const isFileHandle = (handle: FileSystemHandle): handle is FileSystemFileHandle => handle.kind === 'file';
const isDirectoryHandle = (handle: FileSystemHandle): handle is FileSystemDirectoryHandle => handle.kind === 'directory';

export const useLocalFS = () => {
  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [rootNode, setRootNode] = useState<FileSystemNode | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  const scanDirectory = useCallback(async (dirHandle: FileSystemDirectoryHandle): Promise<FileSystemNode> => {
    const children: FileSystemNode[] = [];
    for await (const handle of dirHandle.values()) {
        const childNode: FileSystemNode = {
            name: handle.name,
            kind: handle.kind,
            handle: handle,
        };
        if (isDirectoryHandle(handle)) {
            // To avoid errors on restricted folders, wrap in try-catch
            try {
                // We won't recursively scan here for performance, but we could
                 childNode.children = []; 
            } catch (e) {
                console.warn(`Dizine erişilemedi: ${handle.name}`, e);
                childNode.children = [];
            }
        }
        children.push(childNode);
    }
    // Sort directories first, then files, then alphabetically
    children.sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'directory' ? -1 : 1;
    });

    return {
      name: dirHandle.name,
      kind: 'directory',
      handle: dirHandle,
      children: children,
    };
  }, []);
  
  const refreshFileTree = useCallback(async () => {
      if (!rootHandle) return;
      let currentHandle: FileSystemDirectoryHandle = rootHandle;
      for (const part of currentPath) {
          currentHandle = await currentHandle.getDirectoryHandle(part);
      }
      const tree = await scanDirectory(currentHandle);
      
      // A bit of a hack to merge with the root node structure
      if (currentPath.length === 0) {
          setRootNode(tree);
      } else {
          // This part is tricky; for now, we just refresh the whole tree from root
          // A more optimized approach would be to update only the changed part of the tree
          const fullTree = await scanDirectory(rootHandle);
          setRootNode(fullTree);
      }
  }, [rootHandle, currentPath, scanDirectory]);

  const selectRootDirectory = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setRootHandle(handle);
      setCurrentPath([]);
      const tree = await scanDirectory(handle);
      setRootNode(tree);
      setIsReady(true);
      console.log("Dizin seçildi, isReady true olacak");
    } catch (err) {
      console.error("Kullanıcı dizin seçimini iptal etti veya bir hata oluştu:", err);
      setIsReady(false);
    }
  }, [scanDirectory]);
  
  const getHandleForPath = useCallback(async (pathStr: string, create = false) => {
      if (!rootHandle) throw new Error("Kök dizin seçilmedi.");

      const parts = pathStr.split('/').filter(p => p && p !== '.');
      let currentHandle: FileSystemDirectoryHandle = rootHandle;
      
      // Navigate to the parent directory
      for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          currentHandle = await currentHandle.getDirectoryHandle(part, { create });
      }
      
      return { parentHandle: currentHandle, name: parts[parts.length - 1] };

  }, [rootHandle]);

  const getPathString = useCallback(() => `~/${currentPath.join('/')}`, [currentPath]);

  const executeCommand = useCallback(async (cmd: AICommand): Promise<{success: boolean, output?: string}> => {
    if (!rootHandle) return { success: false, output: 'Hata: Dizin seçilmedi.' };
    
    try {
      if (cmd.type === 'bash' && cmd.command) {
        const [action, ...args] = cmd.command.split(' ');
        const path = args.join(' ');
        
        let currentHandle: FileSystemDirectoryHandle = rootHandle;
        for (const part of currentPath) {
             currentHandle = await currentHandle.getDirectoryHandle(part);
        }

        switch (action) {
          case 'ls': {
              const targetPath = args[0] || '.';
              let targetHandle = currentHandle;
              if (targetPath !== '.') {
                  targetHandle = await currentHandle.getDirectoryHandle(targetPath);
              }
              let output = `./${getPathString()}/${targetPath} içeriği:\n`;
              const items = [];
              for await (const entry of targetHandle.values()) {
                  items.push(`${entry.kind === 'directory' ? entry.name + '/' : entry.name}`);
              }
              output += items.join('\n');
              return { success: true, output };
          }
          case 'cat': {
              const fileHandle = await currentHandle.getFileHandle(path);
              const file = await fileHandle.getFile();
              const content = await file.text();
              return { success: true, output: content };
          }
          case 'mkdir':
            await currentHandle.getDirectoryHandle(path, { create: true });
            break;
          case 'rm':
            await currentHandle.removeEntry(path, { recursive: true }); // Use recursive for convenience
            break;
          case 'cd':
            const newPath = [...currentPath];
            if(path === '..') {
                if(newPath.length > 0) newPath.pop();
            } else if (path !== '.') {
                // Verify dir exists before changing
                await currentHandle.getDirectoryHandle(path);
                newPath.push(path);
            }
            setCurrentPath(newPath);
            break;
          default:
            return { success: false, output: `Hata: Bilinmeyen bash komutu "${action}"`};
        }
      } else if (cmd.type === 'file_operation' && cmd.filename) {
          let currentHandle: FileSystemDirectoryHandle = rootHandle;
          for (const part of currentPath) {
              currentHandle = await currentHandle.getDirectoryHandle(part);
          }
        
          const fileHandle = await currentHandle.getFileHandle(cmd.filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(cmd.content || '');
          await writable.close();
      }
      
      await refreshFileTree();
      return { success: true, output: `"${cmd.command || cmd.filename}" komutu çalıştırıldı.` };

    } catch (e) {
        console.error("Dosya Sistemi Komutu başarısız oldu:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        return { success: false, output: `Hata: ${errorMessage}` };
    }
  }, [rootHandle, currentPath, refreshFileTree, getPathString]);

  const treeToString = (node: FileSystemNode, prefix = ''): string => {
    let result = `${prefix}${node.kind === 'directory' ? node.name + '/' : node.name}\n`;
    if (node.kind === 'directory' && node.children) {
        for (const child of node.children) {
            result += treeToString(child, prefix + '  ');
        }
    }
    return result;
  };
  
  const getTreeString = useCallback(() => {
    if (!rootNode) return "Dizin yüklenmedi.";
    return treeToString(rootNode);
  }, [rootNode]);

  return { rootNode, rootHandle, currentPath, isReady, selectRootDirectory, executeCommand, getPathString, getTreeString };
};