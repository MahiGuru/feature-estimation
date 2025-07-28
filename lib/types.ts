export interface TeamMember {
  developers: number;
  qa: number;
  po: number;
  ba: number;
  managers: number;
  deliveryManagers: number;
  architects: number;
}

export interface EstimationData {
  id: string;
  features: string[];
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