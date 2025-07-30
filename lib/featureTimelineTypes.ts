export interface QuarterlyConsumption {
  planned: number;
  consumed: number;
}

export interface FeatureTimeline {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'blocked' | 'planned';
  priority: 'high' | 'medium' | 'low';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  storyPoints: number;
  consumedPoints: number;
  quarterlyConsumption: {
    Q1: QuarterlyConsumption;
    Q2: QuarterlyConsumption;
    Q3: QuarterlyConsumption;
    Q4: QuarterlyConsumption;
  };
  assignedTo: string;
  team: string;
  sprint: string;
  progress: number;
  startDate: string;
  endDate: string;
  quarters: string[];
  dependencies: string[];
  tags: string[];
  deliverables: string[];
}

export interface SizeMapping {
  range: string;
  description: string;
}

export interface Quarter {
  start: string;
  end: string;
  name: string;
}

export interface Status {
  color: string;
  label: string;
}

export interface FeatureTimelineData {
  features: FeatureTimeline[];
  sizeMapping: Record<string, SizeMapping>;
  quarters: Record<string, Quarter>;
  teams: string[];
  statuses: Record<string, Status>;
}