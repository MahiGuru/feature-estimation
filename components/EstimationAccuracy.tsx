'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  BarChart3,
  Users,
  Clock
} from 'lucide-react';

export default function EstimationAccuracy() {
  // Load data from JSON
  const timelineData = require("@/lib/featureTimelineData.json");
  const { projectEstimation, features } = timelineData;

  // Calculate estimation accuracy metrics
  const calculateAccuracyMetrics = () => {
    const completedFeatures = features.filter((f: any) => f.status === 'completed');
    
    const accuracyData = completedFeatures.map((feature: any) => {
      const original = feature.estimation?.originalEstimate || feature.storyPoints;
      const final = feature.estimation?.finalEstimate || feature.storyPoints;
      const actual = feature.consumedPoints;
      
      const estimationAccuracy = final > 0 ? Math.round((1 - Math.abs(final - actual) / final) * 100) : 0;
      const variancePercentage = final > 0 ? Math.round(((actual - final) / final) * 100) : 0;
      
      return {
        name: feature.name.split(' ')[0],
        fullName: feature.name,
        original,
        final,
        actual,
        accuracy: estimationAccuracy,
        variance: variancePercentage,
        complexityScore: feature.estimation?.complexityScore || 5,
        uncertaintyLevel: feature.estimation?.uncertaintyLevel || 'Medium'
      };
    });

    const avgAccuracy = accuracyData.length > 0 
      ? Math.round(accuracyData.reduce((sum, item) => sum + item.accuracy, 0) / accuracyData.length)
      : 0;

    const totalPlanned = accuracyData.reduce((sum, item) => sum + item.final, 0);
    const totalActual = accuracyData.reduce((sum, item) => sum + item.actual, 0);
    const overallVariance = totalPlanned > 0 ? Math.round(((totalActual - totalPlanned) / totalPlanned) * 100) : 0;

    return { accuracyData, avgAccuracy, overallVariance, totalPlanned, totalActual };
  };

  const { accuracyData, avgAccuracy, overallVariance, totalPlanned, totalActual } = calculateAccuracyMetrics();

  // Team performance data
  const teamPerformanceData = features.reduce((acc: any, feature: any) => {
    const member = feature.assignedTo;
    if (!acc[member]) {
      acc[member] = {
        name: member,
        team: feature.team,
        features: 0,
        plannedSP: 0,
        actualSP: 0,
        accuracy: 0
      };
    }
    
    if (feature.status === 'completed') {
      acc[member].features += 1;
      acc[member].plannedSP += feature.estimation?.finalEstimate || feature.storyPoints;
      acc[member].actualSP += feature.consumedPoints;
    }
    
    return acc;
  }, {});

  Object.values(teamPerformanceData).forEach((member: any) => {
    member.accuracy = member.plannedSP > 0 
      ? Math.round((1 - Math.abs(member.plannedSP - member.actualSP) / member.plannedSP) * 100)
      : 0;
  });

  // Risk vs Accuracy scatter data
  const riskAccuracyData = accuracyData.map(item => ({
    name: item.name,
    complexity: item.complexityScore,
    accuracy: item.accuracy,
    uncertainty: item.uncertaintyLevel
  }));

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return '#10b981'; // green
    if (accuracy >= 80) return '#f59e0b'; // yellow
    if (accuracy >= 70) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) <= 10) return '#10b981';
    if (Math.abs(variance) <= 20) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-blue-900">Estimation Accuracy Tracking</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-600 font-medium">Avg Accuracy</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{avgAccuracy}%</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-600 font-medium">Overall Variance</p>
            </div>
            <p className={`text-2xl font-bold ${overallVariance > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {overallVariance > 0 ? '+' : ''}{overallVariance}%
            </p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-purple-600 mr-2" />
              <p className="text-sm text-purple-600 font-medium">Planned SP</p>
            </div>
            <p className="text-2xl font-bold text-purple-700">{totalPlanned}</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-600 mr-2" />
              <p className="text-sm text-orange-600 font-medium">Actual SP</p>
            </div>
            <p className="text-2xl font-bold text-orange-700">{totalActual}</p>
          </div>
        </div>

        <Tabs defaultValue="accuracy" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-blue-50 p-1 rounded-lg">
            <TabsTrigger 
              value="accuracy"
              className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-900 text-blue-600"
            >
              Accuracy
            </TabsTrigger>
            <TabsTrigger 
              value="variance"
              className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-900 text-blue-600"
            >
              Variance
            </TabsTrigger>
            <TabsTrigger 
              value="team"
              className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-900 text-blue-600"
            >
              Team Performance
            </TabsTrigger>
            <TabsTrigger 
              value="insights"
              className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-900 text-blue-600"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Accuracy Tab */}
          <TabsContent value="accuracy" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Feature Estimation Accuracy</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => [
                      `${value}%`, 
                      name === 'accuracy' ? 'Accuracy' : name
                    ]}
                  />
                  <Bar 
                    dataKey="accuracy" 
                    name="Accuracy"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getAccuracyColor(entry.accuracy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accuracyData.map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">{item.fullName}</h4>
                    <Badge 
                      className={`${
                        item.accuracy >= 90 ? 'bg-green-100 text-green-800 border-green-300' :
                        item.accuracy >= 80 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        'bg-red-100 text-red-800 border-red-300'
                      } border text-xs px-2 py-1`}
                    >
                      {item.accuracy}% Accurate
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span>Estimated:</span>
                      <span>{item.final} SP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual:</span>
                      <span>{item.actual} SP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variance:</span>
                      <span className={item.variance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {item.variance > 0 ? '+' : ''}{item.variance}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Variance Tab */}
          <TabsContent value="variance" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Estimation Variance Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [`${value}%`, 'Variance']}
                  />
                  <Bar 
                    dataKey="variance" 
                    name="Variance"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getVarianceColor(entry.variance)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Team Performance Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(teamPerformanceData).map((member: any, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="font-semibold text-blue-900">{member.name}</h4>
                      <p className="text-sm text-blue-600">{member.team} Team</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Features:</span>
                      <span className="font-medium text-blue-900">{member.features}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Planned SP:</span>
                      <span className="font-medium text-blue-900">{member.plannedSP}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Actual SP:</span>
                      <span className="font-medium text-blue-900">{member.actualSP}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-blue-600">Accuracy</span>
                      <span className="text-xs font-medium text-blue-900">{member.accuracy}%</span>
                    </div>
                    <Progress value={member.accuracy} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Health */}
              <div className="p-4 bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Project Health
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Overall Status:</span>
                    <Badge className={`${
                      avgAccuracy >= 85 ? 'bg-green-100 text-green-800 border-green-300' :
                      avgAccuracy >= 75 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    } border`}>
                      {avgAccuracy >= 85 ? 'Excellent' : avgAccuracy >= 75 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Estimation Method:</span>
                    <span className="text-green-900 font-medium">{projectEstimation.estimationMetadata.estimationMethod}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700">Risk Level:</span>
                    <Badge className={`${
                      projectEstimation.riskLevel === 'Low' ? 'bg-green-100 text-green-800 border-green-300' :
                      projectEstimation.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-red-100 text-red-800 border-red-300'
                    } border`}>
                      {projectEstimation.riskLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Recommendations
                </h3>
                <div className="space-y-2 text-sm text-orange-800">
                  {avgAccuracy < 85 && (
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Consider refining estimation techniques for better accuracy</span>
                    </div>
                  )}
                  {Math.abs(overallVariance) > 15 && (
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>High variance detected - review scope and complexity assessment</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use historical data to improve future estimations</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Regular retrospectives can help identify estimation patterns</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}