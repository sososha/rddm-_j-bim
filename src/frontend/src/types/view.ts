export type ViewType = 'floor' | 'structure' | 'mep';

export interface ViewState {
  zoom: number;
  pan: {
    x: number;
    y: number;
  };
  rotation: number;
}

export interface ViewProperties {
  name: string;
  description?: string;
  color?: string;
  [key: string]: any;
}

export interface ViewMetadata {
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface View {
  id: string;
  type: ViewType;
  state: ViewState;
  properties: ViewProperties;
  metadata: ViewMetadata;
  elementIds: string[];
}

export type CreateView = Omit<View, 'id' | 'metadata'>;
export type UpdateView = Partial<Omit<View, 'id' | 'metadata'>>; 