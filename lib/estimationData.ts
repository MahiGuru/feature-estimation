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

export const PREDEFINED_EPICS = [
  'User Management Epic',
  'E-commerce Platform Epic',
  'Analytics & Reporting Epic',
  'Mobile Application Epic',
  'Security & Compliance Epic',
  'Payment Processing Epic',
  'Content Management Epic',
  'Integration Platform Epic'
];

export const generateAIEstimation = async (data: Partial<EstimationData & { 
  uploadedFiles?: Array<{ name: string; features: string[] }>,
  jiraEpics?: Array<{ key: string; fields: { summary: string } }>
}>) => {
  try {
    // Helper function to detect epics (same logic as frontend)
    const isEpic = (item: string) => {
      return (
        /\[EPIC-\d+\]/.test(item) || // JIRA epic pattern
        (data.jiraEpics && data.jiraEpics.some((epic) => `[${epic.key}] ${epic.fields.summary}` === item)) || // JIRA epic match
        PREDEFINED_EPICS.includes(item) // Predefined epic
      );
    };

    // Separate epics and features from selected items
    const selectedItems = data.features || [];
    const epicsOnly = selectedItems.filter(item => isEpic(item.feature));
    const featuresOnly = selectedItems.filter(item => !isEpic(item.feature));

    const response = await fetch('/api/generate-estimation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        features: featuresOnly.map(featureObj => ({
          feature: featureObj.feature,
          description: featureObj.description || ''
        })),
        epics: epicsOnly.map(epicObj => ({
          feature: epicObj.feature,
          description: epicObj.description || ''
        })),
        t_shirt_sizing: data.tshirtSize || '',
        old_reference_sheet: (data.uploadedFiles || []).map(file => ({
          fileName: file.name,
          features: file.features,
          uploadedAt: new Date().toISOString()
        })),
        dependencies: data.dependencies || '',
        sprint_configuration: {
          duration: data.sprintSize || 2,
          velocity: data.sprintVelocity || 20
        },
        team_composition: {
          developers: data.teamMembers?.developers || 0,
          qa: data.teamMembers?.qa || 0,
          po: data.teamMembers?.po || 0,
          ba: data.teamMembers?.ba || 0,
          managers: data.teamMembers?.managers || 0,
          delivery_managers: data.teamMembers?.deliveryManagers || 0,
          architects: data.teamMembers?.architects || 0,
        },
        additional_notes: data.customNotes || ''
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to generate AI estimation:', error);
    throw new Error('Failed to generate AI estimation. Please try again.');
  }
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