export interface TeamMember {
  developers: number;
  qa: number;
  po: number;
  ba: number;
  managers: number;
  deliveryManagers: number;
  architects: number;
}

export interface FeatureItem {
  name: string;
  description?: string;
  tshirtsize?: string;
  epic?: string;
  startDate?: string;
  endDate?: string;
  referenceAttachements?: File[];
}

export interface EstimationData {
  id: string;
  features: FeatureItem[];
  sprintSize: number;
  teamMembers: TeamMember;
  sprintVelocity: number;
  dependencies: string;
  customNotes: string;
  tshirtSize?: string;
  aiEstimation?: {
    totalStoryPoints: number;
    estimatedSprints: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    recommendations: string[];
  };
  createdAt: Date;
}