import { Node, Edge, Viewport } from 'reactflow';

export enum TaskStatus {
  ToDo = 'Yapılacak',
  InProgress = 'Devam Ediyor',
  Done = 'Tamamlandı',
}

export interface Link {
  url: string;
  title: string;
}

export type IconName = 'default' | 'code' | 'brush' | 'users' | 'bug' | 'megaphone' | 'rocket' | 'flag' | 'file';

export interface NodeData {
  label: string;
  description: string;
  status: TaskStatus;
  icon?: IconName;
  imageUrl?: string;
  links?: Link[];
  color?: string; // Kullanıcı tarafından seçilen veya durumdan gelen renk
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  data: {
    nodes: Node<NodeData>[];
    edges: Edge[];
    viewport: Viewport;
  }
}
