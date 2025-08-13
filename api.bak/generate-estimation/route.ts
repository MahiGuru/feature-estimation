import { NextRequest, NextResponse } from 'next/server';

interface TeamComposition {
  developers: number;
  qa: number;
  po: number;
  ba: number;
  managers: number;
  delivery_managers: number;
  architects: number;
}

interface SprintConfiguration {
  duration: number;
  velocity: number;
}

interface OldReferenceSheet {
  fileName: string;
  features: string[];
  uploadedAt: string;
}

interface EstimationRequest {
  features: { [key: string]: string };
  epics: { [key: string]: string };
  t_shirt_sizing: string;
  old_reference_sheet: OldReferenceSheet[];
  dependencies: string;
  sprint_configuration: SprintConfiguration;
  team_composition: TeamComposition;
  additional_notes: string;
}

interface EstimationResponse {
  totalStoryPoints: number;
  estimatedSprints: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  breakdown: {
    featuresAnalysis: Array<{
      feature: string;
      storyPoints: number;
      complexity: 'Low' | 'Medium' | 'High';
      estimatedDays: number;
    }>;
    teamUtilization: {
      developers: number;
      qa: number;
      other: number;
    };
    timelineEstimate: {
      optimistic: number;
      realistic: number;
      pessimistic: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: EstimationRequest = await request.json();

    // Validate required fields
    const featuresCount = data.features ? Object.keys(data.features).length : 0;
    const epicsCount = data.epics ? Object.keys(data.epics).length : 0;
    
    if (featuresCount === 0 && epicsCount === 0) {
      return NextResponse.json(
        { error: 'At least one feature or epic is required' },
        { status: 400 }
      );
    }

    if (!data.team_composition || !data.sprint_configuration) {
      return NextResponse.json(
        { error: 'Team composition and sprint configuration are required' },
        { status: 400 }
      );
    }

    if (!data.sprint_configuration.duration || !data.sprint_configuration.velocity) {
      return NextResponse.json(
        { error: 'Sprint duration and velocity are required' },
        { status: 400 }
      );
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Enhanced AI estimation logic
    const estimation = generateAdvancedEstimation(data);

    return NextResponse.json(estimation);
  } catch (error) {
    console.error('Error generating estimation:', error);
    return NextResponse.json(
      { error: 'Failed to generate estimation' },
      { status: 500 }
    );
  }
}

function generateAdvancedEstimation(data: EstimationRequest): EstimationResponse {
  const { features, epics, team_composition, sprint_configuration, dependencies, t_shirt_sizing, old_reference_sheet, additional_notes } = data;

  // Calculate team capacity
  const totalTeamSize = Object.values(team_composition).reduce((sum, count) => sum + count, 0);
  const developmentCapacity = team_composition.developers + team_composition.architects * 0.8;
  
  // Convert features and epics objects to arrays for processing
  const featureValues = features ? Object.values(features) : [];
  const epicValues = epics ? Object.values(epics) : [];
  const allItems = [...featureValues, ...epicValues];
  
  // Analyze features and epics separately
  const featuresAnalysis = featureValues.map(feature => {
    let basePoints = 5; // Default story points
    let complexity: 'Low' | 'Medium' | 'High' = 'Medium';
    
    // Adjust based on feature type
    if (feature.includes('[EPIC-') || feature.toLowerCase().includes('epic')) {
      basePoints = 21; // Epics are typically larger
      complexity = 'High';
    } else if (feature.toLowerCase().includes('bug')) {
      basePoints = 3;
      complexity = 'Low';
    } else if (feature.toLowerCase().includes('integration') || feature.toLowerCase().includes('api')) {
      basePoints = 8;
      complexity = 'High';
    } else if (feature.toLowerCase().includes('ui') || feature.toLowerCase().includes('design')) {
      basePoints = 5;
      complexity = 'Medium';
    }

    // Adjust based on t-shirt sizing
    if (t_shirt_sizing) {
      const sizeMultiplier = {
        'XS': 0.5,
        'S': 0.7,
        'M': 1.0,
        'L': 1.5,
        'XL': 2.0,
        'XXL': 3.0
      }[t_shirt_sizing] || 1.0;
      
      basePoints = Math.round(basePoints * sizeMultiplier);
    }

    // Adjust based on old reference sheets (historical data)
    if (old_reference_sheet && old_reference_sheet.length > 0) {
      const referenceFeatures = old_reference_sheet.flatMap(sheet => sheet.features);
      const similarFeature = referenceFeatures.find(refFeature => 
        refFeature.toLowerCase().includes(feature.toLowerCase().split(' ')[0]) ||
        feature.toLowerCase().includes(refFeature.toLowerCase().split(' ')[0])
      );
      
      if (similarFeature) {
        // Increase confidence in estimation based on historical data
        basePoints = Math.round(basePoints * 0.9); // Slightly reduce due to experience
        complexity = complexity === 'High' ? 'Medium' : complexity;
      }
    }

    // Adjust based on team size (smaller teams need more time per feature)
    if (totalTeamSize < 3) {
      basePoints = Math.round(basePoints * 1.3);
    } else if (totalTeamSize > 8) {
      basePoints = Math.round(basePoints * 0.9);
    }

    const estimatedDays = Math.round((basePoints * 0.5) + Math.random() * 2);

    return {
      feature,
      storyPoints: basePoints,
      complexity,
      estimatedDays
    };
  });

  // Analyze epics separately with higher base points
  const epicsAnalysis = epicValues.map(epic => {
    let basePoints = 21; // Epics start with higher base points
    let complexity: 'Low' | 'Medium' | 'High' = 'High'; // Epics are typically complex
    
    // Adjust based on epic content
    if (epic.toLowerCase().includes('integration') || epic.toLowerCase().includes('migration')) {
      basePoints = 34;
      complexity = 'High';
    } else if (epic.toLowerCase().includes('ui') || epic.toLowerCase().includes('frontend')) {
      basePoints = 21;
      complexity = 'Medium';
    }

    // Adjust based on t-shirt sizing
    if (t_shirt_sizing) {
      const sizeMultiplier = {
        'XS': 0.5,
        'S': 0.7,
        'M': 1.0,
        'L': 1.5,
        'XL': 2.0,
        'XXL': 3.0
      }[t_shirt_sizing] || 1.0;
      
      basePoints = Math.round(basePoints * sizeMultiplier);
    }

    // Adjust based on old reference sheets (historical data)
    if (old_reference_sheet && old_reference_sheet.length > 0) {
      const referenceFeatures = old_reference_sheet.flatMap(sheet => sheet.features);
      const similarFeature = referenceFeatures.find(refFeature => 
        refFeature.toLowerCase().includes(epic.toLowerCase().split(' ')[0]) ||
        epic.toLowerCase().includes(refFeature.toLowerCase().split(' ')[0])
      );
      
      if (similarFeature) {
        basePoints = Math.round(basePoints * 0.9);
        complexity = complexity === 'High' ? 'Medium' : complexity;
      }
    }

    // Adjust based on team size
    if (totalTeamSize < 3) {
      basePoints = Math.round(basePoints * 1.3);
    } else if (totalTeamSize > 8) {
      basePoints = Math.round(basePoints * 0.9);
    }

    const estimatedDays = Math.round((basePoints * 0.5) + Math.random() * 3);

    return {
      feature: epic,
      storyPoints: basePoints,
      complexity,
      estimatedDays
    };
  });

  // Combine features and epics analysis
  const allItemsAnalysis = [...featuresAnalysis, ...epicsAnalysis];
  const totalStoryPoints = allItemsAnalysis.reduce((sum, item) => sum + item.storyPoints, 0);
  
  // Calculate sprints needed
  let estimatedSprints = Math.ceil(totalStoryPoints / sprint_configuration.velocity);
  
  // Adjust for dependencies and blockers
  if (dependencies && dependencies.trim().length > 0) {
    const dependencyComplexity = dependencies.split('\n').length;
    estimatedSprints = Math.ceil(estimatedSprints * (1 + dependencyComplexity * 0.1));
  }

  // Calculate risk level
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (estimatedSprints > 10 || totalStoryPoints > 200) {
    riskLevel = 'High';
  } else if (estimatedSprints > 6 || totalStoryPoints > 120) {
    riskLevel = 'Medium';
  }

  // Adjust risk based on team composition
  if (team_composition.developers === 0) {
    riskLevel = 'High';
  } else if (team_composition.qa === 0 && allItems.length > 5) {
    riskLevel = riskLevel === 'Low' ? 'Medium' : 'High';
  }

  // Generate enhanced recommendations based on new structure
  const recommendations: string[] = [];
  
  // Team composition recommendations
  if (team_composition.developers < 2) {
    recommendations.push('Consider adding more developers to the team for better velocity');
  }
  
  if (team_composition.qa === 0) {
    recommendations.push('Add QA resources to ensure quality and reduce technical debt');
  }
  
  if (team_composition.architects === 0 && allItems.length > 10) {
    recommendations.push('Consider adding an architect for large-scale system design');
  }
  
  if (team_composition.po === 0) {
    recommendations.push('Product Owner is essential for clear requirements and priorities');
  }
  
  // Epic-specific recommendations
  if (epicValues.length > 0) {
    recommendations.push(`${epicValues.length} Epic(s) identified - ensure proper breakdown into user stories`);
    if (epicValues.length > 1) {
      recommendations.push('Multiple Epics detected - consider prioritizing and phasing implementation');
    }
  }
  
  // Feature-specific recommendations
  if (featureValues.length > 0) {
    recommendations.push(`${featureValues.length} Feature(s) identified for development`);
  }
  
  // T-shirt sizing recommendations
  if (t_shirt_sizing === 'XL' || t_shirt_sizing === 'XXL') {
    recommendations.push('Large project detected - consider implementing in phases');
    recommendations.push('Break down epics into smaller, manageable user stories');
  }
  
  if (t_shirt_sizing === 'XS' || t_shirt_sizing === 'S') {
    recommendations.push('Small project - consider fast-track development approach');
  }
  
  // Reference sheet recommendations
  if (old_reference_sheet && old_reference_sheet.length > 0) {
    recommendations.push('Historical data available - leverage past experience for accurate estimates');
    recommendations.push(`Referenced ${old_reference_sheet.length} previous project(s) for estimation accuracy`);
  } else {
    recommendations.push('Consider documenting this project for future reference');
  }
  
  // Sprint configuration recommendations
  if (sprint_configuration.duration > 3) {
    recommendations.push('Long sprint duration - ensure regular stakeholder feedback');
  }
  
  if (sprint_configuration.velocity > 50) {
    recommendations.push('High velocity target - ensure team capacity can sustain this pace');
  }
  
  // Dependencies recommendations
  if (dependencies && dependencies.trim().length > 0) {
    const depCount = dependencies.split('\n').filter(d => d.trim().length > 0).length;
    recommendations.push(`${depCount} dependencies identified - create contingency plans`);
    if (depCount > 3) {
      recommendations.push('High dependency count increases project risk - prioritize early resolution');
    }
  }
  
  // Risk-based recommendations
  if (riskLevel === 'High') {
    recommendations.push('High-risk project: Consider breaking into smaller phases');
    recommendations.push('Implement frequent checkpoints and reviews');
  }
  
  // Additional notes consideration
  if (additional_notes && additional_notes.trim().length > 0) {
    recommendations.push('Review additional notes for specific project considerations');
  }
  
  // General best practices
  recommendations.push('Plan for regular stakeholder reviews and feedback sessions');
  recommendations.push('Implement proper version control and CI/CD practices');

  // Calculate team utilization
  const teamUtilization = {
    developers: Math.min(100, (totalStoryPoints / (developmentCapacity * estimatedSprints * sprint_configuration.duration * 5)) * 100),
    qa: Math.min(100, (allItems.length * 2) / (team_composition.qa * estimatedSprints * sprint_configuration.duration * 5) * 100),
    other: Math.min(100, (allItems.length * 0.5) / ((team_composition.po + team_composition.ba + team_composition.managers) * estimatedSprints * sprint_configuration.duration * 5) * 100)
  };

  // Calculate timeline estimates
  const baseWeeks = estimatedSprints * sprint_configuration.duration;
  const timelineEstimate = {
    optimistic: Math.max(1, Math.round(baseWeeks * 0.8)),
    realistic: baseWeeks,
    pessimistic: Math.round(baseWeeks * 1.3)
  };

  return {
    totalStoryPoints,
    estimatedSprints,
    riskLevel,
    recommendations,
    breakdown: {
      featuresAnalysis: allItemsAnalysis,
      teamUtilization,
      timelineEstimate
    }
  };
}