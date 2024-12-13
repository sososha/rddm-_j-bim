export type RelationshipType = 'connects' | 'contains' | 'adjacent';

export interface RelationshipEndpoint {
  elementId: string;
  role: string;
}

export interface RelationshipProperties {
  name: string;
  description?: string;
  [key: string]: any;
}

export interface RelationshipMetadata {
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  source: RelationshipEndpoint;
  target: RelationshipEndpoint;
  properties: RelationshipProperties;
  metadata: RelationshipMetadata;
}

export type CreateRelationship = Omit<Relationship, 'id' | 'metadata'>;
export type UpdateRelationship = Partial<Omit<Relationship, 'id' | 'metadata'>>; 