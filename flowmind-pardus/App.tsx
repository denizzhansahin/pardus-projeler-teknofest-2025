import React, { useState, useCallback, memo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Controls,
  Background,
  Handle,
  Position,
  NodeProps,
  useReactFlow,
  Viewport,
} from 'reactflow';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { TaskStatus, NodeData, Link, IconName, Project } from './types';
import { getTaskBreakdown, AiTaskResponse, enhanceTask, summarizeWorkflow } from './services/geminiService';
import {
    MagicWandIcon, LogoIcon, SpinnerIcon, PlusIcon, TrashIcon, LinkIcon,
    DocumentTextIcon, SpeakerWaveIcon, XCircleIcon, SaveIcon, FolderOpenIcon,
    DocumentPlusIcon, PhotoIcon, DocumentArrowDownIcon, CodeBracketIcon, PaintBrushIcon,
    UsersIcon, BugAntIcon, MegaphoneIcon, RocketLaunchIcon, FlagIcon, FileIcon
} from './components/Icons';
import { Settings } from './components/Settings';
import { CustomEdge } from './components/CustomEdge';
import PardusLogo from './assets/Pardus-02.png';

// --- Proje Depolama Yardımcısı ---
const projectStorage = {
  getProjects: (): Project[] => {
    try {
      const projects = localStorage.getItem('flowmind_projects');
      return projects ? JSON.parse(projects) : [];
    } catch (error) {
      console.error("Failed to parse projects from localStorage", error);
      return [];
    }
  },
  saveProjects: (projects: Project[]) => {
    try {
      localStorage.setItem('flowmind_projects', JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save projects to localStorage", error);
    }
  },
  getLastProjectId: (): string | null => {
    return localStorage.getItem('flowmind_last_project_id');
  },
  saveLastProjectId: (id: string | null) => {
    if (id) {
        localStorage.setItem('flowmind_last_project_id', id);
    } else {
        localStorage.removeItem('flowmind_last_project_id');
    }
  },
};


// --- İkon Haritası ---
const ICONS: Record<IconName, React.FC<{ className?: string }>> = {
  default: FileIcon,
  code: CodeBracketIcon,
  brush: PaintBrushIcon,
  users: UsersIcon,
  bug: BugAntIcon,
  megaphone: MegaphoneIcon,
  rocket: RocketLaunchIcon,
  flag: FlagIcon,
  file: FileIcon
};

const getIcon = (name?: IconName) => {
    return ICONS[name || 'default'] || FileIcon;
};

// --- Durum Renkleri ---
const statusColors: { [key in TaskStatus]: { bg: string; text: string; } } = {
  [TaskStatus.ToDo]: { bg: 'bg-slate-600', text: 'text-slate-300' },
  [TaskStatus.InProgress]: { bg: 'bg-sky-600', text: 'text-sky-300' },
  [TaskStatus.Done]: { bg: 'bg-emerald-600', text: 'text-emerald-300' },
};

// --- NodeTypes objesi component DIŞINDA tanımlı ---
const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const colorInfo = statusColors[data.status] || statusColors[TaskStatus.ToDo];
  const NodeIcon = getIcon(data.icon);
  const nodeBg = data.color || colorInfo.bg;

  return (
    <div
      className={`w-72 rounded-lg shadow-lg transition-all duration-150 ${
        selected ? 'ring-2 ring-cyan-400 scale-105 shadow-cyan-500/20' : 'ring-1 ring-slate-700'
      } relative`}
      style={{ backgroundColor: nodeBg }}
    >
      {data.imageUrl && <img src={data.imageUrl} alt={data.label} className="w-full h-32 object-cover rounded-t-lg" />}
      <div className={`p-3 rounded-t-lg text-white font-bold flex items-center gap-2 ${data.imageUrl ? 'rounded-t-none' : ''}`}
        style={{ backgroundColor: nodeBg }}>
        <NodeIcon className="w-5 h-5 opacity-80" />
        <span className="flex-1">{data.label}</span>
      </div>
      <div className="p-3 text-slate-300 text-sm space-y-3">
        <p>{data.description}</p>
        {data.links && data.links.length > 0 && (
            <div className="space-y-1">
                {data.links.map((link, index) => (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 hover:underline text-xs">
                        <LinkIcon className="w-4 h-4" />
                        <span>{link.title || link.url}</span>
                    </a>
                ))}
            </div>
        )}
      </div>
      <div className={`px-3 pb-2 text-xs font-semibold ${colorInfo.text}`}>Durum: {data.status}</div>
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-3 !h-3" />
    </div>
  );
});

// nodeTypes objesi burada tanımlanmalı:
const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

// --- Ana Uygulama Bileşeni ---
export const App: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [modals, setModals] = useState({ save: false, load: false, confirm: false });
  const [confirmation, setConfirmation] = useState({ title: '', message: '', onConfirm: () => {} });
  const [summaryData, setSummaryData] = useState<{ text: string; isLoading: boolean } | null>(null);
  const { setViewport, fitView, getViewport } = useReactFlow();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const lastId = projectStorage.getLastProjectId();
    if (lastId) {
      loadProject(lastId);
    }
  }, []);
  
  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#64748b', strokeWidth: 2 } }, eds)), [setEdges]);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, data: { ...node.data, ...newData } };
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [setNodes, selectedNode]);
  
  const addNode = () => {
    const { x, y, zoom } = getViewport();
    const position = { x: -x/zoom + 150/zoom, y: -y/zoom + 150/zoom };
    const newNodeId = createNodeId(`yeni-gorev-${nodes.length + 1}`);
    const newNode: Node<NodeData> = {
        id: newNodeId,
        type: 'custom',
        position,
        data: { label: 'Yeni Görev', description: 'Açıklama girin.', status: TaskStatus.ToDo, links: [], imageUrl: '', icon: 'default' },
    };
    setNodes(nds => [...nds, newNode]);
    setTimeout(() => setSelectedNode(newNode), 50);
  };
  
  const deleteNode = useCallback((nodeId: string) => {
      setNodes(nds => nds.filter(n => n.id !== nodeId));
      setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
      if (selectedNode?.id === nodeId) {
          setSelectedNode(null);
      }
  }, [selectedNode, setNodes, setEdges]);
  
  const addAiGeneratedTasks = useCallback((aiResponse: AiTaskResponse) => {
    let basePosition = { x: 200, y: 100 };
    if (nodes.length > 0) {
        const yPositions = nodes.map(n => n.position.y);
        basePosition = { x: nodes[0].position.x, y: Math.max(...yPositions) + 250 };
    }

    const newNodes: Node<NodeData>[] = aiResponse.newTasks.map((task, index) => ({
      id: task.id,
      type: 'custom',
      position: { x: basePosition.x + (index % 2) * 400, y: basePosition.y + Math.floor(index / 2) * 250 },
      data: { label: task.title, description: task.description, status: TaskStatus.ToDo, icon: 'default' },
    }));

    const newEdges: Edge[] = aiResponse.dependencies.map(dep => ({
        id: `e-${dep.source}-${dep.target}`,
        source: dep.source,
        target: dep.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#64748b', strokeWidth: 2 },
    }));
    
    const allNodes = [...nodes, ...newNodes];
    const allNodeIds = new Set(allNodes.map(n => n.id));

    const validEdges = newEdges.filter(edge => allNodeIds.has(edge.source) && allNodeIds.has(edge.target));

    setNodes(allNodes);
    setEdges(eds => [...eds.filter(e => !validEdges.find(ne => ne.id === e.id)), ...validEdges]);

    setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100);
  }, [nodes, setNodes, setEdges, fitView]);
  
  const newProjectAction = () => {
      setNodes([]);
      setEdges([]);
      setCurrentProject(null);
      projectStorage.saveLastProjectId(null);
      setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 500});
  };

  const handleNewProject = () => {
    setConfirmation({
        title: "Yeni Proje",
        message: "Mevcut projedeki kaydedilmemiş değişiklikler kaybolacak. Yeni bir proje oluşturmak istediğinizden emin misiniz?",
        onConfirm: () => newProjectAction(),
    });
    setModals(m => ({...m, confirm: true}));
  };

  const saveProject = (name: string) => {
      const projects = projectStorage.getProjects();
      const viewport = getViewport();
      
      if (currentProject) {
        const updatedProjects = projects.map(p => p.id === currentProject.id ? { ...p, name, data: { nodes, edges, viewport } } : p);
        projectStorage.saveProjects(updatedProjects);
      } else {
        const newProjectData: Project = {
            id: Date.now().toString(),
            name,
            createdAt: new Date().toISOString(),
            data: { nodes, edges, viewport },
        };
        projectStorage.saveProjects([...projects, newProjectData]);
        setCurrentProject(newProjectData);
        projectStorage.saveLastProjectId(newProjectData.id);
      }
      setModals(m => ({ ...m, save: false }));
  }

  const loadProject = (id: string) => {
      const projects = projectStorage.getProjects();
      const projectToLoad = projects.find(p => p.id === id);
      if (projectToLoad) {
          setNodes(projectToLoad.data.nodes || []);
          setEdges(projectToLoad.data.edges || []);
          setCurrentProject(projectToLoad);
          projectStorage.saveLastProjectId(id);
          const { x, y, zoom } = projectToLoad.data.viewport || { x:0, y:0, zoom:1 };
          setTimeout(() => setViewport({x, y, zoom}, { duration: 800 }), 100);
      }
      setModals(m => ({ ...m, load: false }));
  }

  const deleteProjectAction = (id: string) => {
      const projects = projectStorage.getProjects();
      const updatedProjects = projects.filter(p => p.id !== id);
      projectStorage.saveProjects(updatedProjects);
      if (currentProject?.id === id) {
          newProjectAction();
      }
  };

  const handleDeleteProject = (id: string) => {
    setConfirmation({
        title: "Projeyi Sil",
        message: "Bu projeyi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
        onConfirm: () => deleteProjectAction(id),
    });
    setModals(m => ({...m, confirm: true}));
  };


  const handleSummarize = async () => {
      setSummaryData({ text: '', isLoading: true });
      try {
          const result = await summarizeWorkflow(nodes, edges);
          setSummaryData({ text: result.summary, isLoading: false });
      } catch (error) {
          alert(`Özet oluşturulurken bir hata oluştu: ${(error as Error).message}`);
          setSummaryData(null);
      }
  };

  const handleExport = (type: 'png' | 'pdf') => {
      const flowEl = document.querySelector('.react-flow__viewport');
      if (!flowEl) return;
      
      toPng(flowEl as HTMLElement, { 
          backgroundColor: '#0f172a',
          width: (flowEl as HTMLElement).clientWidth,
          height: (flowEl as HTMLElement).clientHeight,
      }).then((dataUrl) => {
          if (type === 'png') {
              const a = document.createElement('a');
              a.setAttribute('download', `${currentProject?.name || 'proje'}-akisi.png`);
              a.setAttribute('href', dataUrl);
              a.click();
          } else {
              const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [ (flowEl as HTMLElement).clientWidth, (flowEl as HTMLElement).clientHeight] });
              pdf.addImage(dataUrl, 'PNG', 0, 0, (flowEl as HTMLElement).clientWidth, (flowEl as HTMLElement).clientHeight);
              pdf.save(`${currentProject?.name || 'proje'}-akisi.pdf`);
          }
      });
  };

  // Edge silme fonksiyonu
  const handleDeleteEdge = (id: string) => {
    setEdges(eds => eds.filter(e => e.id !== id));
  };

  return (
    <div className="w-screen h-screen flex bg-slate-900 text-white">
      <main className="flex-grow h-full relative">
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 z-50 bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded shadow"
        >Ayarlar</button>
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="relative">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white text-2xl"
                aria-label="Kapat"
              >×</button>
              <Settings />
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges.map(e => ({ ...e, type: 'custom', data: { ...e.data, onDelete: handleDeleteEdge } }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onPaneClick={() => setSelectedNode(null)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={!projectStorage.getLastProjectId()}
          fitViewOptions={{ padding: 0.2 }}
          className="bg-slate-900"
        >
          <Background color="#475569" gap={16} />
          <Controls />
        </ReactFlow>
        {summaryData && <SummaryModal summaryData={summaryData} onClose={() => setSummaryData(null)} />}
        {modals.save && <SaveProjectModal currentName={currentProject?.name} onSave={saveProject} onClose={() => setModals(m => ({...m, save: false}))} />}
        {modals.load && <LoadProjectModal onOpen={loadProject} onDelete={handleDeleteProject} onClose={() => setModals(m => ({...m, load: false}))} />}
        {modals.confirm && <ConfirmationModal {...confirmation} onClose={() => setModals(m => ({...m, confirm: false}))} />}
      </main>

      <Sidebar 
        selectedNode={selectedNode}
        onUpdateNode={updateNodeData}
        onClearSelection={() => setSelectedNode(null)}
        onDeleteNode={deleteNode}
        nodes={nodes}
        onAiGenerated={addAiGeneratedTasks}
        onAddNode={addNode}
        onSummarize={handleSummarize}
        onNewProject={handleNewProject}
        onSaveProject={() => setModals(m => ({...m, save: true}))}
        onLoadProject={() => setModals(m => ({...m, load: true}))}
        onExport={handleExport}
        currentProjectName={currentProject?.name}
      />
    </div>
  );
};


// --- Kenar Çubuğu (Sidebar) ve Alt Bileşenleri ---
interface SidebarProps {
    selectedNode: Node<NodeData> | null;
    onUpdateNode: (id: string, data: Partial<NodeData>) => void;
    onClearSelection: () => void;
    onDeleteNode: (id: string) => void;
    nodes: Node<NodeData>[];
    onAiGenerated: (res: AiTaskResponse) => void;
    onAddNode: () => void;
    onSummarize: () => void;
    onNewProject: () => void;
    onSaveProject: () => void;
    onLoadProject: () => void;
    onExport: (type: 'png' | 'pdf') => void;
    currentProjectName?: string;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
    return (
        <aside className="w-[400px] h-full bg-slate-950/70 backdrop-blur-sm border-l border-slate-700/50 shadow-2xl flex flex-col">
            <header className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src={PardusLogo}
                        alt="Pardus Logo"
                        className="w-8 h-8 rounded bg-slate-800 object-contain"
                        style={{ background: 'transparent' }}
                    />
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">FlowMind Pardus</h1>
                        <p className="text-xs text-slate-400 -mt-1">{props.currentProjectName || "İsimsiz Proje"}</p>
                    </div>
                </div>
            </header>
            <div className="flex-grow p-4 overflow-y-auto">
                {props.selectedNode ? (
                    <NodeEditor key={props.selectedNode.id} node={props.selectedNode} onUpdate={props.onUpdateNode} onClearSelection={props.onClearSelection} onDelete={props.onDeleteNode} />
                ) : (
                    <ControlPanel 
                        nodes={props.nodes}
                        onAiGenerated={props.onAiGenerated}
                        onAddNode={props.onAddNode}
                        onSummarize={props.onSummarize}
                        onNewProject={props.onNewProject}
                        onSaveProject={props.onSaveProject}
                        onLoadProject={props.onLoadProject}
                        onExport={props.onExport}
                    />
                )}
            </div>
            <footer className="p-4 border-t border-slate-800">
                <p className="text-center text-xs text-slate-500">&copy; {new Date().getFullYear()} FlowMind Pardus</p>
            </footer>
        </aside>
    );
}

const ControlPanel: React.FC<Omit<SidebarProps, 'selectedNode' | 'onUpdateNode' | 'onClearSelection' | 'onDeleteNode'>> = 
({ nodes, onAiGenerated, onAddNode, onSummarize, onNewProject, onSaveProject, onLoadProject, onExport }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || isLoading) return;
       
        setIsLoading(true);
        setError(null);
        try {
            const response = await getTaskBreakdown(prompt, nodes);
            onAiGenerated(response);
            setPrompt('');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
             <h3 className="text-md font-semibold text-slate-300 mb-2">Proje Yönetimi</h3>
             <div className="grid grid-cols-3 gap-2">
                <button onClick={onNewProject} className="flex flex-col items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-2 rounded-md transition-colors duration-200 text-xs"><DocumentPlusIcon className="w-5 h-5"/> Yeni</button>
                <button onClick={onSaveProject} className="flex flex-col items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-2 rounded-md transition-colors duration-200 text-xs"><SaveIcon className="w-5 h-5"/> Kaydet</button>
                <button onClick={onLoadProject} className="flex flex-col items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-2 rounded-md transition-colors duration-200 text-xs"><FolderOpenIcon className="w-5 h-5"/> Yükle</button>
             </div>
             <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={() => onExport('png')} disabled={nodes.length === 0} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-800 disabled:text-slate-500"><PhotoIcon className="w-5 h-5"/> PNG İndir</button>
                <button onClick={() => onExport('pdf')} disabled={nodes.length === 0} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 text-xs disabled:bg-slate-800 disabled:text-slate-500"><DocumentArrowDownIcon className="w-5 h-5"/> PDF İndir</button>
             </div>
        </div>

        <div>
            <div className="text-center mb-4">
                <MagicWandIcon className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
                <h2 className="text-lg font-semibold text-slate-200">Yapay Zeka Asistanı</h2>
                <p className="text-sm text-slate-400">Bir hedef tanımlayın, sizin için iş akışı oluşturayım.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Örn: 'Ürünümüz için yeni bir pazarlama kampanyası başlat'" rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50" disabled={isLoading}/>
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={isLoading || !prompt}>
                    {isLoading ? <><SpinnerIcon className="w-5 h-5"/> Oluşturuluyor...</> : 'İş Akışı Oluştur'}
                </button>
            </form>
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md text-sm mt-3"><p className="font-bold">Hata:</p><p>{error}</p></div>}
        </div>
        <div className="border-t border-slate-800 pt-6 space-y-3">
             <h3 className="text-md font-semibold text-slate-300 text-center mb-3">Genel Kontroller</h3>
             <button onClick={onAddNode} className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                <PlusIcon className="w-5 h-5"/> Manuel Görev Ekle
             </button>
             <button onClick={onSummarize} disabled={nodes.length === 0} className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
                <DocumentTextIcon className="w-5 h-5"/> Projeyi Yapay Zeka ile Özetle
             </button>
        </div>
      </div>
    );
};

const NodeEditor: React.FC<{
    node: Node<NodeData>;
    onUpdate: (id: string, data: Partial<NodeData>) => void;
    onClearSelection: () => void;
    onDelete: (id: string) => void;
}> = ({ node, onUpdate, onClearSelection, onDelete }) => {
    const [data, setData] = useState(node.data);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [color, setColor] = useState(data.color || '#64748b');

    // Debounce update to improve performance
    useEffect(() => {
        if (JSON.stringify(node.data) !== JSON.stringify(data)) {
            const handler = setTimeout(() => {
                onUpdate(node.id, data);
            }, 500);

            return () => {
                clearTimeout(handler);
            };
        }
    }, [data, node.id, node.data, onUpdate]);
    
    useEffect(() => {
        let newColor = color;
        if (data.status === 'Done') newColor = '#22c55e'; // yeşil
        else if (data.status === 'ToDo') newColor = '#ef4444'; // kırmızı
        setColor(newColor);
        if (data.color !== newColor) handleChange('color' as keyof NodeData, newColor);
        // eslint-disable-next-line
    }, [data.status]);

    const handleChange = (field: keyof NodeData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e?.target?.value || '#64748b';
        setColor(value);
        handleChange('color' as keyof NodeData, value);
    };

    const handleLinkChange = (index: number, field: 'title'|'url', value: string) => {
        const newLinks = [...(data.links || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        handleChange('links', newLinks);
    };

    const addLink = () => {
        const newLinks = [...(data.links || []), {title: '', url: ''}];
        handleChange('links', newLinks);
    };

    const removeLink = (index: number) => {
        const newLinks = (data.links || []).filter((_, i) => i !== index);
        handleChange('links', newLinks);
    };

    const handleEnhance = async () => {
        setIsEnhancing(true);
        try {
            const result = await enhanceTask(data.label, data.description);
            handleChange('description', result.newDescription);
        } catch (error) {
            alert(`İçerik geliştirilirken hata oluştu: ${(error as Error).message}`);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            alert('Maksimum dosya boyutu 50MB olmalı!');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            handleChange('imageUrl', reader.result as string);
        };
        reader.readAsDataURL(file);
    };
    
    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-200">Görevi Düzenle</h2>
                <button onClick={onClearSelection} className="text-sm text-slate-400 hover:text-white">&times; Kapat</button>
            </div>
            
            <InputField label="Görev Başlığı" value={data.label} onChange={val => handleChange('label', val)} />
            <TextareaField label="Açıklama" value={data.description} onChange={val => handleChange('description', val)} rows={4}/>
            
            <button onClick={handleEnhance} disabled={isEnhancing} className="w-full flex items-center justify-center gap-2 text-sm bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-600">
                {isEnhancing ? <><SpinnerIcon className="w-5 h-5"/> Geliştiriliyor...</> : <><MagicWandIcon className="w-5 h-5"/> Yapay Zeka ile Geliştir</>}
            </button>
            
            <IconSelector label="İkon Seç" selected={data.icon} onSelect={icon => handleChange('icon', icon)} />

            <SelectField label="Durum" value={data.status} onChange={val => handleChange('status', val as TaskStatus)} options={Object.values(TaskStatus)} />
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-1">Renk Seç (Deneysel)</label>
              <input type="color" value={typeof color === 'string' ? color : '#64748b'} onChange={handleColorChange} className="w-12 h-8 p-0 border-none bg-transparent cursor-pointer" />
              <span className="text-xs text-slate-400 ml-2">Bu özellik geliştirme aşamasındadır.</span>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-400 block mb-1">Görsel Yükle (max 50MB)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100" />
            </div>
            
            <div>
                <label className="text-sm font-medium text-slate-400 block mb-2">Bağlantılar</label>
                <div className="space-y-2">
                    {(data.links || []).map((link, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-md">
                            <LinkIcon className="w-5 h-5 text-slate-400"/>
                            <input type="text" placeholder="Başlık" value={link.title} onChange={e => handleLinkChange(i, 'title', e.target.value)} className="w-1/3 bg-slate-700 border-slate-600 rounded p-1 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"/>
                            <input type="text" placeholder="URL" value={link.url} onChange={e => handleLinkChange(i, 'url', e.target.value)} className="flex-grow bg-slate-700 border-slate-600 rounded p-1 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"/>
                            <button onClick={() => removeLink(i)} className="text-slate-500 hover:text-red-400"><XCircleIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                 <button onClick={addLink} className="mt-2 text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300"> <PlusIcon className="w-4 h-4"/> Bağlantı Ekle</button>
            </div>
            <button onClick={() => onDelete(node.id)} className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                <TrashIcon className="w-5 h-5"/> Görevi Sil
            </button>
        </div>
    );
};

// --- Form Elemanı Bileşenleri ---
const InputField = ({ label, value, onChange, ...props }: any) => (
    <div>
        <label className="text-sm font-medium text-slate-400 block mb-1">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none" {...props} />
    </div>
);
const TextareaField = ({ label, value, onChange, ...props }: any) => (
    <div>
        <label className="text-sm font-medium text-slate-400 block mb-1">{label}</label>
        <textarea value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none" {...props} />
    </div>
);
const SelectField = ({ label, value, onChange, options, ...props }: any) => (
    <div>
        <label className="text-sm font-medium text-slate-400 block mb-1">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:outline-none" {...props}>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const IconSelector: React.FC<{ label: string, selected?: IconName, onSelect: (name: IconName) => void }> = ({ label, selected, onSelect }) => (
    <div>
        <label className="text-sm font-medium text-slate-400 block mb-1">{label}</label>
        <div className="grid grid-cols-8 gap-2 p-2 bg-slate-800/50 rounded-md">
            {Object.keys(ICONS).map(name => {
                const Icon = ICONS[name as IconName];
                return (
                    <button key={name} onClick={() => onSelect(name as IconName)} className={`p-2 rounded-md transition-colors ${selected === name ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                        <Icon className="w-5 h-5 mx-auto" />
                    </button>
                )
            })}
        </div>
    </div>
);


// --- Modal Bileşenleri ---
const Modal: React.FC<{ children: React.ReactNode, title: string, onClose: () => void, size?: 'md' | 'lg' }> = ({ children, title, onClose, size = 'md' }) => (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onMouseDown={onClose}>
        <div className={`bg-slate-800 rounded-lg shadow-xl w-full ${size === 'lg' ? 'max-w-lg' : 'max-w-md'}`} onMouseDown={e => e.stopPropagation()}>
            <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
            </header>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

const SaveProjectModal: React.FC<{ currentName?: string, onSave: (name: string) => void, onClose: () => void }> = ({ currentName, onSave, onClose }) => {
    const [name, setName] = useState(currentName || '');
    return (
        <Modal title={currentName ? "Projeyi Güncelle" : "Projeyi Kaydet"} onClose={onClose} size="lg">
            <form onSubmit={(e) => { e.preventDefault(); onSave(name); }} className="space-y-4">
                <InputField label="Proje Adı" value={name} onChange={setName} placeholder="Pazarlama Kampanyası Q3" />
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">İptal</button>
                    <button type="submit" disabled={!name} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-700">Kaydet</button>
                </div>
            </form>
        </Modal>
    );
};

const LoadProjectModal: React.FC<{ onOpen: (id: string) => void, onDelete: (id: string) => void, onClose: () => void }> = ({ onOpen, onDelete, onClose }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    
    useEffect(() => {
        setProjects(projectStorage.getProjects().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, []);

    const handleDelete = (id: string) => {
        onDelete(id);
        setProjects(p => p.filter(proj => proj.id !== id));
    };

    return (
        <Modal title="Kayıtlı Projeyi Yükle" onClose={onClose} size="lg">
            <div className="max-h-96 overflow-y-auto space-y-2">
                {projects.length === 0 && <p className="text-slate-400 text-center py-4">Kaydedilmiş proje bulunamadı.</p>}
                {projects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md">
                        <div>
                            <p className="font-semibold text-slate-100">{p.name}</p>
                            <p className="text-xs text-slate-400">Oluşturulma: {new Date(p.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => onOpen(p.id)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1 px-3 rounded-md text-sm">Yükle</button>
                             <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 p-1"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

const SummaryModal: React.FC<{ summaryData: { text: string; isLoading: boolean }, onClose: () => void }> = ({ summaryData, onClose }) => {
    
    const handleSpeak = () => {
        if ('speechSynthesis' in window && summaryData.text) {
            const utterance = new SpeechSynthesisUtterance(summaryData.text);
            utterance.lang = 'tr-TR';
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Tarayıcınız metin okuma özelliğini desteklemiyor.');
        }
    };

    return (
        <Modal title="Proje Özeti" onClose={onClose} size="lg">
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
                {summaryData.isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <SpinnerIcon className="w-8 h-8 text-cyan-400"/>
                        <p className="mt-2 text-slate-300">Özet oluşturuluyor...</p>
                    </div>
                ) : (
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{summaryData.text}</p>
                )}
            </div>
            <footer className="pt-4 mt-4 border-t border-slate-700 flex justify-end gap-3">
                <button onClick={handleSpeak} disabled={summaryData.isLoading} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-slate-600">
                    <SpeakerWaveIcon className="w-5 h-5"/> Sesli Oku
                </button>
                <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                    Kapat
                </button>
            </footer>
        </Modal>
    );
};

const ConfirmationModal: React.FC<{ title: string, message: string, onConfirm: () => void, onClose: () => void }> = ({ title, message, onConfirm, onClose }) => {
    return (
        <Modal title={title} onClose={onClose}>
            <div className="space-y-4">
                <p className="text-slate-300">{message}</p>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        İptal
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Onayla
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- Yardımcı Fonksiyonlar ---
const createNodeId = (label: string) => {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 5);
};