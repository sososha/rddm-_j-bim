export type ElementType = 'room' | 'opening' | 'wall';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Geometry {
  position: Point;
  size: Size;
  rotation: number;
}

export interface Properties {
  name: string;
  color: string;
  [key: string]: any;
}

export interface Metadata {
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Element {
  id: string;
  type: ElementType;
  geometry: Geometry;
  properties: Properties;
  metadata: Metadata;
}

export type CreateElement = Omit<Element, 'id' | 'metadata'>;
export type UpdateElement = Partial<Omit<Element, 'id' | 'metadata'>>; 