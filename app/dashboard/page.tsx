'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import FeatureTracker from '@/components/FeatureTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EstimationData, getEstimationData } from '@/lib/estimationData';
import { dummyFeatures, dummyProjects } from '@/lib/dummyData';
import { Calendar, Users, Clock, AlertTriangle, Target, TrendingUp, CheckCircle, Activity, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const [estimations, setEstimations] = useState<EstimationData[]>([]);

  useEffect(() => {
    setEstimations(getEstimationData());
  }, []);

  const totalProjects = estimations.length + dummyProjects.length;
  const totalStoryPoints = estimations.reduce((sum, est) => sum + (est.aiEstimation?.totalStoryPoints || 0), 0) + 128;
  const avgSprintVelocity = estimations.length > 0 ? 
    Math.round(estimations.reduce((sum, est) => sum + est.sprintVelocity, 0) / estimations.length) : 25;
  const highRiskProjects = estimations.filter(est => est.aiEstimation?.riskLevel === 'High').length + 1;

  // Calculate feature statistics
  const totalFeatures = dummyFeatures.length;
  const completedFeatures = dummyFeatures.filter(f => f.status === 'completed').length;
  const inProgressFeatures = dummyFeatures.filter(f => f.status === 'progress').length;
  const blockedFeatures = dummyFeatures.filter(f => f.status === 'blocked').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
       
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-2">Total Projects</p>
                  <p className="text-3xl font-bold text-blue-900">{totalProjects}</p>
                  <p className="text-xs text-green-600 mt-1">+2 this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">Total Features</p>
                  <p className="text-3xl font-bold text-green-700">{totalFeatures}</p>
                  <p className="text-xs text-green-600 mt-1">{completedFeatures} completed</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-2">Avg Sprint Velocity</p>
                  <p className="text-3xl font-bold text-purple-700">{avgSprintVelocity}</p>
                  <p className="text-xs text-purple-600 mt-1">story points</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-2">Blocked Features</p>
                  <p className="text-3xl font-bold text-orange-700">{blockedFeatures}</p>
                  <p className="text-xs text-orange-600 mt-1">need attention</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="professional-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-blue-900">Active Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {dummyProjects.map((project) => (
                <div key={project.id} className="border border-blue-100 rounded-lg p-6 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">{project.name}</h3>
                      <p className="text-blue-600 text-sm">{project.description}</p>
                    </div>
                    <Badge className={`${
                      project.riskLevel === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                      project.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-green-100 text-green-800 border-green-200'
                    } border`}>
                      {project.riskLevel} risk
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Features</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {project.completedFeatures}/{project.totalFeatures}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Story Points</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {project.completedStoryPoints}/{project.totalStoryPoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Sprint</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {project.currentSprint}/{project.estimatedSprints}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Team Size</p>
                      <p className="text-lg font-semibold text-blue-900">{project.teamSize}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Overall Progress</span>
                      <span className="text-blue-900 font-medium">
                        {Math.round((project.completedStoryPoints / project.totalStoryPoints) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(project.completedStoryPoints / project.totalStoryPoints) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-blue-900">Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Features Completed</span>
                  <Badge className="bg-green-100 text-green-800 border border-green-200">
                    {completedFeatures}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">In Progress</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
                    {inProgressFeatures}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Blocked</span>
                  <Badge className="bg-red-100 text-red-800 border border-red-200">
                    {blockedFeatures}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t border-blue-100 pt-4">
                <h4 className="font-semibold text-blue-900 mb-3">Recent Activity</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-blue-700">User Authentication completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-blue-700">Dashboard Development in progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-700">API Integration started</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Tracker */}
        <FeatureTracker />

        {/* Recent Estimations */}
        {estimations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span>Recent Estimations</span>
            </h2>
            <div className="grid gap-6">
              {estimations.slice(0, 3).map((estimation) => (
                <Card key={estimation.id} className="professional-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-blue-900 flex items-center space-x-3">
                        <Target className="w-5 h-5 text-blue-600" />
                        Project #{estimation.id.slice(-6)}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${
                          estimation.aiEstimation?.riskLevel === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                          estimation.aiEstimation?.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        } border px-3 py-1`}>
                          {estimation.aiEstimation?.riskLevel || 'N/A'} Risk
                        </Badge>
                        <div className="flex items-center text-sm text-blue-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(estimation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-blue-600 mb-1">Features</p>
                        <p className="text-2xl font-bold text-blue-900">{estimation.features.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 mb-1">Story Points</p>
                        <p className="text-2xl font-bold text-blue-900">{estimation.aiEstimation?.totalStoryPoints || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 mb-1">Estimated Sprints</p>
                        <p className="text-2xl font-bold text-blue-900">{estimation.aiEstimation?.estimatedSprints || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 mb-1">Team Size</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {Object.values(estimation.teamMembers).reduce((a, b) => a + b, 0)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-blue-600 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {estimation.features.slice(0, 3).map(feature => (
                          <Badge key={feature} className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {estimation.features.length > 3 && (
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">
                            +{estimation.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}