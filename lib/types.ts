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
  feature: string;
  description?: string;
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