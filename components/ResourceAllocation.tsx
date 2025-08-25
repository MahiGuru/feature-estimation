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
import { usePredictionStore } from "@/lib/store";

export default function ResourceAllocation() {
  // Load data from Zustand store
  const { predictionData } = usePredictionStore();
  const projectEstimation = predictionData?.projectEstimation;
  const features = predictionData?.features || [];
  const availableTeams = predictionData?.teams || ["Frontend", "Backend", "Full Stack", "DevOps"];
  
  // Generate team members based on team types
  const getTeamMembers = (teamName: string) => {
    const membersByTeam: { [key: string]: string[] } = {
      "Frontend": ["Alice Chen", "Bob Miller", "Carol Wang"],
      "Backend": ["David Kumar", "Elena Rodriguez", "Frank Liu"],
      "Full Stack": ["Grace Kim", "Henry Jones", "Isabel Garcia"],
      "DevOps": ["Jack Thompson", "Kate Singh", "Liam Brown"],
    };
    return membersByTeam[teamName] || ["Team Member A", "Team Member B", "Team Member C"];
  };

  // Assign features to teams based on their characteristics
  const assignFeatureToTeam = (feature: any) => {
    const tags = feature.tags || [];
    const name = feature.name.toLowerCase();
    
    // Smart team assignment based on feature content
    if (tags.includes("Integration") || tags.includes("API") || name.includes("api") || name.includes("integration")) {
      return "Backend";
    } else if (tags.includes("UI") || name.includes("frontend") || name.includes("ui")) {
      return "Frontend";  
    } else if (name.includes("migration") || name.includes("deployment") || tags.includes("DevOps")) {
      return "DevOps";
    } else {
      return "Full Stack";
    }
  };

  // Calculate team workload
  const calculateTeamWorkload = () => {
    const teamWorkload: { [key: string]: any } = {};

    // Initialize all teams from response data
    availableTeams.forEach(teamName => {
      teamWorkload[teamName] = {
        name: teamName,
        totalSP: 0,
        completedSP: 0,
        inProgressSP: 0,
        plannedSP: 0,
        members: new Set(getTeamMembers(teamName)),
        features: [],
        quarterlyWorkload: {},
      };
    });

    features.forEach((feature: any) => {
      const assignedTeam = assignFeatureToTeam(feature);
      const teamMembers = getTeamMembers(assignedTeam);
      const assignee = teamMembers[Math.floor(Math.random() * teamMembers.length)];
      
      // Add assigned team and member to feature for consistency
      feature.team = assignedTeam;
      feature.assignedTo = assignee;

      if (!teamWorkload[assignedTeam]) {
        teamWorkload[assignedTeam] = {
          name: assignedTeam,
          totalSP: 0,
          completedSP: 0,
          inProgressSP: 0,
          plannedSP: 0,
          members: new Set(teamMembers),
          features: [],
          quarterlyWorkload: {},
        };
      }

      // Calculate total story points from quarterly consumption
      const totalPlannedSP = feature.quarterlyConsumption 
        ? Object.values(feature.quarterlyConsumption).reduce(
            (sum: number, q: any) => sum + (parseInt(q?.planned) || 0), 0
          )
        : feature.storyPoints || 0;

      const totalConsumedSP = feature.quarterlyConsumption
        ? Object.values(feature.quarterlyConsumption).reduce(
            (sum: number, q: any) => sum + (parseInt(q?.consumed) || 0), 0
          )
        : 0;

      teamWorkload[assignedTeam].totalSP += totalPlannedSP;
      teamWorkload[assignedTeam].members.add(assignee);
      teamWorkload[assignedTeam].features.push(feature);

      // Calculate quarterly workload
      if (feature.quarterlyConsumption) {
        Object.entries(feature.quarterlyConsumption).forEach(([quarter, qData]: [string, any]) => {
          if (!teamWorkload[assignedTeam].quarterlyWorkload[quarter]) {
            teamWorkload[assignedTeam].quarterlyWorkload[quarter] = 0;
          }
          teamWorkload[assignedTeam].quarterlyWorkload[quarter] += parseInt(qData?.planned) || 0;
        });
      }

      if (feature.status === "completed") {
        teamWorkload[assignedTeam].completedSP += Number(totalConsumedSP);
      } else if (feature.status === "in-progress" || feature.status === "in_progress") {
        teamWorkload[assignedTeam].inProgressSP += Number(totalConsumedSP);
      } else {
        teamWorkload[assignedTeam].plannedSP += Number(totalPlannedSP) - Number(totalConsumedSP);
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
      // Use assigned team and assignee (set in calculateTeamWorkload)
      const assignee = feature.assignedTo || "Unassigned";
      const team = feature.team || "Unassigned";

      if (!individualWorkload[assignee]) {
        individualWorkload[assignee] = {
          name: assignee,
          team: team,
          totalSP: 0,
          completedSP: 0,
          inProgressSP: 0,
          plannedSP: 0,
          features: 0,
          completedFeatures: 0,
          quarterlyWorkload: {},
        };
      }

      // Calculate total story points from quarterly consumption
      const totalPlannedSP = feature.quarterlyConsumption 
        ? Object.values(feature.quarterlyConsumption).reduce(
            (sum: number, q: any) => sum + (parseInt(q?.planned) || 0), 0
          )
        : feature.storyPoints || 0;

      const totalConsumedSP = feature.quarterlyConsumption
        ? Object.values(feature.quarterlyConsumption).reduce(
            (sum: number, q: any) => sum + (parseInt(q?.consumed) || 0), 0
          )
        : 0;

      individualWorkload[assignee].totalSP += totalPlannedSP;
      individualWorkload[assignee].features += 1;

      // Calculate quarterly individual workload
      if (feature.quarterlyConsumption) {
        Object.entries(feature.quarterlyConsumption).forEach(([quarter, qData]: [string, any]) => {
          if (!individualWorkload[assignee].quarterlyWorkload[quarter]) {
            individualWorkload[assignee].quarterlyWorkload[quarter] = 0;
          }
          individualWorkload[assignee].quarterlyWorkload[quarter] += parseInt(qData?.planned) || 0;
        });
      }

      if (feature.status === "completed") {
        individualWorkload[assignee].completedSP += Number(totalConsumedSP);
        individualWorkload[assignee].completedFeatures += 1;
      } else if (feature.status === "in-progress" || feature.status === "in_progress") {
        individualWorkload[assignee].inProgressSP += Number(totalConsumedSP);
      } else {
        individualWorkload[assignee].plannedSP += Number(totalPlannedSP) - Number(totalConsumedSP);
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
  const resourceAllocationData = projectEstimation?.resourceAllocation ? [
    {
      name: "Development",
      value: parseInt(projectEstimation.resourceAllocation.developmentEffort) || 60,
      color: "#3b82f6",
    },
    {
      name: "Testing",
      value: parseInt(projectEstimation.resourceAllocation.testingEffort) || 30,
      color: "#10b981",
    },
    {
      name: "Management",
      value: parseInt(projectEstimation.resourceAllocation.managementEffort) || 10,
      color: "#f59e0b",
    },
  ] : [
    { name: "Development", value: 60, color: "#3b82f6" },
    { name: "Testing", value: 30, color: "#10b981" },
    { name: "Management", value: 10, color: "#f59e0b" },
  ];

  // Team composition data
  const teamCompositionData = projectEstimation?.teamComposition 
    ? Object.entries(projectEstimation.teamComposition).map(([role, count]) => {
        const numCount = parseInt(count as string) || 0;
        const total = Object.values(projectEstimation.teamComposition as Record<string, any>)
          .reduce((a: number, b: any) => a + (parseInt(b as string) || 0), 0);
        return {
          role: role.charAt(0).toUpperCase() + role.slice(1).replace(/([A-Z])/g, " $1"),
          count: numCount,
          percentage: total > 0 ? Math.round((numCount / total) * 100) : 0,
        };
      })
    : [];

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
              {projectEstimation?.teamComposition 
                ? Object.values(projectEstimation.teamComposition as Record<string, any>)
                    .reduce((a: number, b: any) => a + (parseInt(b as string) || 0), 0)
                : 0}
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
              {projectEstimation?.sprintConfiguration?.sprintVelocity || 10}
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
              {projectEstimation?.sprintConfiguration?.sprintSize || 2}
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
              {projectEstimation?.tshirtSize || 'M'}
            </p>
            <p className="text-xs text-orange-500 mt-1">
              {projectEstimation?.totalProjectSP || 0} SP
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
