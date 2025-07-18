import { EstimationData } from './types';

export const PREDEFINED_FEATURES = [
  'User Authentication',
  'Dashboard Development',
  'API Integration',
  'Database Setup',
  'UI/UX Design',
  'Testing & QA',
  'Deployment Setup',
  'Performance Optimization',
  'Security Implementation',
  'Mobile Responsiveness',
  'Analytics Integration',
  'Payment Gateway',
  'Admin Panel',
  'Reporting System',
  'Search Functionality'
];

export const generateAIEstimation = async (data: Partial<EstimationData>) => {
  // Mock AI estimation logic
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  
  const baseStoryPoints = data.features?.length || 0;
  const complexityMultiplier = data.teamMembers ? 
    (data.teamMembers.developers + data.teamMembers.architects) / 5 : 1;
  const totalStoryPoints = Math.round(baseStoryPoints * complexityMultiplier * 8);
  
  const estimatedSprints = Math.ceil(totalStoryPoints / (data.sprintVelocity || 20));
  
  const riskLevel = estimatedSprints > 10 ? 'High' : 
                   estimatedSprints > 5 ? 'Medium' : 'Low';
  
  const recommendations = [
    'Consider breaking down complex features into smaller user stories',
    'Ensure proper test coverage for all features',
    'Plan for regular stakeholder reviews',
    'Consider potential blockers and dependencies early'
  ];
  
  if (data.dependencies && data.dependencies.length > 0) {
    recommendations.push('Pay special attention to external dependencies');
  }
  
  return {
    totalStoryPoints,
    estimatedSprints,
    riskLevel: riskLevel as 'Low' | 'Medium' | 'High',
    recommendations
  };
};

export const saveEstimationData = (data: EstimationData) => {
  const existingData = getEstimationData();
  const updatedData = [...existingData, data];
  localStorage.setItem('estimationData', JSON.stringify(updatedData));
};

export const getEstimationData = (): EstimationData[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('estimationData');
  return data ? JSON.parse(data) : [];
};