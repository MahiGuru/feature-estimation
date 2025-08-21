"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function ResourceAllocation() {
  // Load data from JSON
  const timelineData = require("@/lib/featureTimelinelatest.json");
  const { projectEstimation, features } = timelineData;

  // Calculate team workload
  const calculateTeamWorkload = () => {
    const teamWorkload: { [key: string]: any } = {};

    features.forEach((feature: any) => {
      const team = feature.team;
      const assignee = feature.assignedTo;

      if (!teamWorkload[team]) {
        teamWorkload[team] = {
          name: team,
          totalSP: 0,
          completedSP: 0,
          inProgressSP: 0,
          plannedSP: 0,
          members: new Set(),
          features: [],
        };
      }

      teamWorkload[team].totalSP += feature.storyPoints;
      teamWorkload[team].members.add(assignee);
      teamWorkload[team].features.push(feature);

      if (feature.status === "completed") {
        teamWorkload[team].completedSP += feature.storyPoints;
      } else if (feature.status === "in-progress") {
        teamWorkload[team].inProgressSP += feature.storyPoints;
      } else {
        teamWorkload[team].plannedSP += feature.storyPoints;
      }
    });

    // Convert to array and add utilization
    return Object.values(teamWorkload).map((team: any) => ({
      ...team,
      memberCount: team.members.size,
      utilization:
        team.totalSP > 0
          ? Math.round(
              ((team.completedSP + team.inProgressSP) / team.totalSP) * 100
            )
          : 0,
      avgSPPerMember:
        team.members.size > 0
          ? Math.round(team.totalSP / team.members.size)
          : 0,
    }));
  };

  // Calculate individual workload
  const calculateIndividualWorkload = () => {
    const individualWorkload: { [key: string]: any } = {};

    features.forEach((feature: any) => {
      const assignee = feature.assignedTo;

      if (!individualWorkload[assignee]) {
        individualWorkload[assignee] = {
          name: assignee,
          team: feature.team,
          totalSP: 0,
          completedSP: 0,
          inProgressSP: 0,
          plannedSP: 0,
          features: 0,
          completedFeatures: 0,
        };
      }

      individualWorkload[assignee].totalSP += feature.storyPoints;
      individualWorkload[assignee].features += 1;

      if (feature.status === "completed") {
        individualWorkload[assignee].completedSP += feature.storyPoints;
        individualWorkload[assignee].completedFeatures += 1;
      } else if (feature.status === "in-progress") {
        individualWorkload[assignee].inProgressSP += feature.storyPoints;
      } else {
        individualWorkload[assignee].plannedSP += feature.storyPoints;
      }
    });

    return Object.values(individualWorkload).map((person: any) => ({
      ...person,
      utilization:
        person.totalSP > 0
          ? Math.round(
              ((person.completedSP + person.inProgressSP) / person.totalSP) *
                100
            )
          : 0,
      productivity:
        person.features > 0
          ? Math.round((person.completedSP / person.features) * 100) / 100
          : 0,
    }));
  };

  // Resource allocation data for charts
  const resourceAllocationData = [
    {
      name: "Development",
      value: projectEstimation.resourceAllocation.developmentEffort,
      color: "#3b82f6",
    },
    {
      name: "Testing",
      value: projectEstimation.resourceAllocation.testingEffort,
      color: "#10b981",
    },
    {
      name: "Management",
      value: projectEstimation.resourceAllocation.managementEffort,
      color: "#f59e0b",
    },
  ];

  // Team composition data
  const teamCompositionData = Object.entries(
    projectEstimation.teamComposition
  ).map(([role, count]) => ({
    role:
      role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, " $1"),
    count: count as number,
    percentage: Math.round(
      ((count as number) /
        Object.values(
          projectEstimation.teamComposition as Record<string, any>
        ).reduce((a: number, b: any) => a + (b || 0), 0)) *
        100
    ),
  }));

  const teamWorkload = calculateTeamWorkload();
  const individualWorkload = calculateIndividualWorkload();

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600 bg-red-50 border-red-200";
    if (utilization >= 70)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (utilization >= 50) return "text-green-600 bg-green-50 border-green-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const getTeamColor = (team: string) => {
    const colors: { [key: string]: string } = {
      Frontend: "#3b82f6",
      Backend: "#10b981",
      "Full Stack": "#8b5cf6",
      DevOps: "#f59e0b",
    };
    return colors[team] || "#6b7280";
  };

  return (
    <Card className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-blue-900">
            Resource Allocation & Team Performance
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-600 font-medium">Total Team</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {Object.values(
                projectEstimation.teamComposition as Record<string, any>
              ).reduce((a: number, b: any) => a + (b || 0), 0)}
            </p>
            <p className="text-xs text-blue-500 mt-1">Members</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-600 font-medium">
                Sprint Velocity
              </p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {projectEstimation.sprintConfiguration.sprintVelocity}
            </p>
            <p className="text-xs text-green-500 mt-1">SP per sprint</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-purple-600 mr-2" />
              <p className="text-sm text-purple-600 font-medium">
                Sprint Duration
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {projectEstimation.sprintConfiguration.sprintSize}
            </p>
            <p className="text-xs text-purple-500 mt-1">Weeks</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
              <p className="text-sm text-orange-600 font-medium">
                Project Size
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {projectEstimation.tshirtSize}
            </p>
            <p className="text-xs text-orange-500 mt-1">
              {projectEstimation.totalProjectSP} SP
            </p>
          </div>
        </div>

        {/* Resource Allocation Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Allocation Pie Chart */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Resource Allocation
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={resourceAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Team Composition */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Team Composition
            </h3>
            <div className="space-y-3">
              {teamCompositionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-800 font-medium">
                      {item.role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-700">{item.count}</span>
                    <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">
                      {item.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="p-4 bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">
            Team Workload Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={teamWorkload}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="completedSP"
                name="Completed"
                fill="#10b981"
                stackId="a"
              />
              <Bar
                dataKey="inProgressSP"
                name="In Progress"
                fill="#f59e0b"
                stackId="a"
              />
              <Bar
                dataKey="plannedSP"
                name="Planned"
                fill="#e2e8f0"
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
