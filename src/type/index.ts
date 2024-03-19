export interface SphereDataType {
  id: number;
  coord: number[];
  child?: { id: string; text: string }[];
  parentId?: number;
}
