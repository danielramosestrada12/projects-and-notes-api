export type ProjectType = {
  id: string;
  name: string;
  notes?: NoteType[];
};

export type NoteType = {
  id: string;
  projectId: string;
  text: string;
  createdAt: Date;
};

export type CacheOptions = {
  ttl?: number;
  prefix?: string;
};

export type CacheStats = {
  hits: number;
  misses: number;
  keys: number;
  ksize: number;
  vsize: number;
};
