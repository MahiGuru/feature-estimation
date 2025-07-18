'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EstimationData, getEstimationData } from '@/lib/estimationData';
import { dummyFeatures } from '@/lib/dummyData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users, Activity, Target } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Charts() {
  const [estimations, setEstimations] = useState<EstimationData[]>([]);

  useEffect(() => {
    setEstimations(getEstimationData());
  }, []);

  // Feature status distribution
  const featureStatusData = dummyFeatures.reduce((acc, feature) => {
    acc[feature.status] = (acc[feature.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusPieData = Object.entries(featureStatusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: status === 'completed' ? '#10B981' : 
           status === 'progress' ? '#F59E0B' : 
           status === 'blocked' ? '#EF4444' : '#3B82F6'
  }));

  // Story points by feature
  const storyPointsData = dummyFeatures.map((feature, index) => ({
    name: feature.name.length > 20 ? feature.name.substring(0, 20) + '...' : feature.name,
    storyPoints: feature.storyPoints,
    progress: feature.progress
  }));

  // Sprint progress data
  const sprintData = [
    { sprint: 'Sprint 1', planned: 34, completed: 34, velocity: 34 },
    { sprint: 'Sprint 2', planned: 42, completed: 28, velocity: 31 },
    { sprint: 'Sprint 3', planned: 38, completed: 0, velocity: 32 },
    { sprint: 'Sprint 4', planned: 45, completed: 0, velocity: 33 },
    { sprint: 'Sprint 5', planned: 25, completed: 0, velocity: 33 }
  ];

  // Team workload data
  const teamWorkloadData = [
    { member: 'John Doe', assigned: 13, completed: 13, inProgress: 0 },
    { member: 'Jane Smith', assigned: 21, completed: 0, inProgress: 21 },
    { member: 'Mike Johnson', assigned: 8, completed: 0, inProgress: 8 },
    { member: 'Sarah Wilson', assigned: 5, completed: 0, inProgress: 0 },
    { member: 'Alex Brown', assigned: 13, completed: 0, inProgress: 1 },
    { member: 'Chris Davis', assigned: 21, completed: 0, inProgress: 0 }
  ];

  // Priority distribution
  const priorityData = dummyFeatures.reduce((acc, feature) => {
    acc[feature.priority] = (acc[feature.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityPieData = Object.entries(priorityData).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <div className="floating-animation inline-block mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-blue-900 mb-4">Project Analytics</h1>
          <p className="text-xl text-blue-600">Comprehensive insights and data-driven analysis</p>
        </div>

        {dummyFeatures.length === 0 ? (
          <Card className="professional-card">
            <CardContent className="p-12 text-center">
              <div className="text-blue-600">
                <div className="floating-animation inline-block mb-6">
                  <BarChart3 className="w-16 h-16 mx-auto opacity-50" />
                </div>
                <p className="text-xl">No data available. Create some estimations to see beautiful charts!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8">
            {/* Feature Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl text-blue-900">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <PieChartIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>Feature Status Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="professional-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl text-blue-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <span>Priority Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {priorityPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Story Points Analysis */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl text-blue-900">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Story Points by Feature</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storyPointsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="storyPoints" fill="#3B82F6" name="Story Points" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sprint Progress */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl text-blue-900">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <span>Sprint Progress & Velocity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sprintData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="sprint" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="planned" 
                        stackId="1"
                        stroke="#3B82F6" 
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        name="Planned Story Points" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stackId="2"
                        stroke="#10B981" 
                        fill="#10B981"
                        fillOpacity={0.6}
                        name="Completed Story Points" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="velocity" 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        name="Team Velocity" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Team Workload */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl text-blue-900">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span>Team Workload Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamWorkloadData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="member" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" name="In Progress" />
                      <Bar dataKey="assigned" fill="#3B82F6" name="Total Assigned" radius={[4, 4, 0, 0]} fillOpacity={0.3} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl text-blue-900">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Activity className="w-5 h-5 text-cyan-600" />
                  </div>
                  <span>Project Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-blue-100 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border border-blue-100 p-4 text-left text-blue-900 font-semibold">Feature</th>
                        <th className="border border-blue-100 p-4 text-left text-blue-900 font-semibold">Status</th>
                        <th className="border border-blue-100 p-4 text-left text-blue-900 font-semibold">Priority</th>
                        <th className="border border-blue-100 p-4 text-left text-blue-900 font-semibold">Story Points</th>
                        <th className="border border-blue-100 p-4 text-left text-blue-900 font-semibold">Progress</th>
                        <th className="border border-blue-100 p-4 text-left text-blue-900 font-semibold">Assigned To</th>
                        <th className="border border-blue-100 p-4 text-left text-blue-900 font-semibold">Sprint</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyFeatures.map((feature) => (
                        <tr key={feature.id} className="table-row-hover">
                          <td className="border border-blue-100 p-4 text-blue-800 font-medium">{feature.name}</td>
                          <td className="border border-blue-100 p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              feature.status === 'completed' ? 'feature-status-completed' :
                              feature.status === 'progress' ? 'feature-status-progress' :
                              feature.status === 'blocked' ? 'feature-status-blocked' :
                              'feature-status-new'
                            }`}>
                              {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                            </span>
                          </td>
                          <td className="border border-blue-100 p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              feature.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                              feature.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)}
                            </span>
                          </td>
                          <td className="border border-blue-100 p-4 text-blue-800 font-semibold">{feature.storyPoints}</td>
                          <td className="border border-blue-100 p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-blue-100 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${feature.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-blue-600 font-medium">{feature.progress}%</span>
                            </div>
                          </td>
                          <td className="border border-blue-100 p-4 text-blue-700">{feature.assignedTo}</td>
                          <td className="border border-blue-100 p-4 text-blue-700">{feature.sprint}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}