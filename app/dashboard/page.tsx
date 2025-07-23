'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import FeatureTracker from '@/components/FeatureTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EstimationData, getEstimationData } from '@/lib/estimationData';
import { dummyFeatures, dummyProjects } from '@/lib/dummyData';
import { Calendar, Users, Clock, AlertTriangle, Target, TrendingUp, CheckCircle, Activity, BarChart3, PieChart as PieIcon, User } from 'lucide-react';

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
  const newFeatures = dummyFeatures.filter(f => f.status === 'new').length;

  // For calendar view
  const featuresWithDates = dummyFeatures.filter(f => f.startDate && f.endDate);
  let minDate = new Date(Math.min(...featuresWithDates.map(f => new Date(f.startDate).getTime())));
  let maxDate = new Date(Math.max(...featuresWithDates.map(f => new Date(f.endDate).getTime())));
  const totalDuration = maxDate.getTime() - minDate.getTime();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'progress': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      case 'new': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCompletedColor = (status: string) => {
    switch (status) {
      case 'progress': return 'bg-yellow-700';
      default: return getStatusColor(status);
    }
  };

  const getRiskFromPriority = (priority: string) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
       
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="stats-card floating-animation">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-2">Total Projects</p>
                  <p className="text-3xl font-bold text-blue-900">{totalProjects}</p>
                  <p className="text-xs text-green-600 mt-1">+2 this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl pulse-shadow">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card floating-animation">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">Total Features</p>
                  <p className="text-3xl font-bold text-green-700">{totalFeatures}</p>
                  <p className="text-xs text-green-600 mt-1">{completedFeatures} completed</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl pulse-shadow">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card floating-animation">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-2">Avg Sprint Velocity</p>
                  <p className="text-3xl font-bold text-purple-700">{avgSprintVelocity}</p>
                  <p className="text-xs text-purple-600 mt-1">story points</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl pulse-shadow">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card floating-animation">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-2">Blocked Features</p>
                  <p className="text-3xl font-bold text-orange-700">{blockedFeatures}</p>
                  <p className="text-xs text-orange-600 mt-1">need attention</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl pulse-shadow">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Tracking Calendar */}
        <Card className="professional-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-blue-900">Feature Timeline Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Timeline Header */}
              <div className="flex justify-between text-sm text-blue-600">
                <span>{formatDate(minDate.toISOString())}</span>
                <span>{formatDate(maxDate.toISOString())}</span>
              </div>

              {/* Features Bars */}
              <TooltipProvider>
                <div className="space-y-6">
                  {featuresWithDates.map((feature) => {
                    const start = new Date(feature.startDate);
                    const end = new Date(feature.endDate);
                    const left = ((start.getTime() - minDate.getTime()) / totalDuration) * 100;
                    const width = ((end.getTime() - start.getTime()) / totalDuration) * 100;
                    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    const consumedPoints = Math.round((feature.progress / 100) * feature.storyPoints);
                    const pendingPoints = feature.storyPoints - consumedPoints;
                    const riskLevel = getRiskFromPriority(feature.priority);

                    let barContent = (
                      <div 
                        className={`absolute h-full ${getStatusColor(feature.status)} transition-all duration-300 group-hover:opacity-80 flex items-center justify-center text-white text-xs font-medium`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <span className="px-2 truncate">{feature.storyPoints} SP - {feature.assignedTo}</span>
                      </div>
                    );

                    if (feature.status === 'progress') {
                      const completedWidth = (feature.progress / 100) * width;
                      const remainingWidth = width - completedWidth;

                      barContent = (
                        <>
                          <div 
                            className={`absolute h-full ${getCompletedColor(feature.status)} transition-all duration-300 group-hover:opacity-80`}
                            style={{ left: `${left}%`, width: `${completedWidth}%` }}
                          ></div>
                          <div 
                            className={`absolute h-full ${getStatusColor(feature.status)} transition-all duration-300 group-hover:opacity-80`}
                            style={{ left: `${left + completedWidth}%`, width: `${remainingWidth}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium" style={{ left: `${left}%`, width: `${width}%` }}>
                            <span className="px-2 truncate">{consumedPoints}/{feature.storyPoints} SP - {feature.assignedTo}</span>
                          </div>
                        </>
                      );
                    }

                    return (
                      <Tooltip key={feature.id}>
                        <TooltipTrigger asChild>
                          <div className="group cursor-pointer">
                            <div className="flex items-center mb-2">
                              <Badge className={`${getStatusColor(feature.status)} text-white mr-2`}>
                                {feature.status.toUpperCase()}
                              </Badge>
                              <span className="text-blue-900 font-medium truncate">{feature.name}</span>
                            </div>
                            <div className="relative h-8 bg-blue-100 rounded-full overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                              {barContent}
                            </div>
                            <div className="flex justify-between text-xs text-blue-600 mt-1">
                              <span>Start: {formatDate(feature.startDate)}</span>
                              <span>End: {formatDate(feature.endDate)}</span>
                            </div>
                            <div className="text-xs text-blue-600">
                              Duration: {durationDays} days | Effort: {feature.storyPoints} story points | Assigned: {feature.assignedTo}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="font-semibold">{feature.name}</p>
                          <p>{feature.description}</p>
                          <p>Status: {feature.status}</p>
                          <p>Priority: {feature.priority}</p>
                          <p>Story Points: {feature.storyPoints}</p>
                          <p>Consumed Points: {consumedPoints}</p>
                          <p>Pending Points: {pendingPoints}</p>
                          <p>Risk Level: {riskLevel}</p>
                          <p>Assigned To: {feature.assignedTo}</p>
                          <p>Sprint: {feature.sprint}</p>
                          <p>Progress: {feature.progress}%</p>
                          <p>Start: {formatDate(feature.startDate)}</p>
                          <p>End: {formatDate(feature.endDate)}</p>
                          <p>Duration: {durationDays} days</p>
                          {feature.dependencies.length > 0 && <p>Dependencies: {feature.dependencies.join(', ')}</p>}
                          {feature.tags.length > 0 && <p>Tags: {feature.tags.join(', ')}</p>}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="professional-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Active Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {dummyProjects.map((project) => (
                <div key={project.id} className="border border-blue-100 rounded-lg p-6 hover-lift bg-gradient-to-r from-white to-blue-50">
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

                  {/* Timeline */}
                  <div className="mt-4">
                    <p className="text-sm text-blue-600 mb-2">Project Timeline</p>
                    <div className="flex items-center space-x-4 text-sm text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span>Start: {new Date().toLocaleDateString()}</span>
                      <TrendingUp className="w-4 h-4" />
                      <span>Estimated End: {new Date(Date.now() + project.estimatedSprints * 14 * 86400000).toLocaleDateString()}</span>
                      <Clock className="w-4 h-4" />
                      <span>{project.estimatedSprints * 14} days</span>
                    </div>
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
                <Card key={estimation.id} className="professional-card floating-animation">
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

                    {/* Timeline for estimation */}
                    <div className="mt-4">
                      <p className="text-sm text-blue-600 mb-2">Estimation Timeline</p>
                      <div className="flex items-center space-x-4 text-sm text-blue-700">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(estimation.createdAt).toLocaleDateString()}</span>
                        <TrendingUp className="w-4 h-4" />
                        <span>Estimated Duration: {estimation.aiEstimation?.estimatedSprints * estimation.sprintSize} weeks</span>
                        <Clock className="w-4 h-4" />
                        <span>{estimation.aiEstimation?.estimatedSprints * estimation.sprintSize * 7} days</span>
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