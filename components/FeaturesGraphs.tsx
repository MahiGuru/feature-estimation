"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { BarChart3, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { usePredictionStore } from "@/lib/store";

interface ChartData {
  quarter: string;
  planned: number;
  consumed: number;
  remaining: number;
}

export default function FeaturesGraphs() {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const { predictionData } = usePredictionStore();

  // Get features from Zustand store
  const features = predictionData?.features || [];

  // Transform feature data for charts
  const getChartData = (feature: any): ChartData[] => {
    return Object.entries(feature.quarterlyConsumption)
      .map(([quarter, data]: [string, any]) => ({
        quarter,
        planned: data.planned,
        consumed: data.consumed,
        remaining: data.planned - data.consumed,
      }))
      .filter((item) => item.planned > 0); // Only show quarters with planned work
  };

  // Get pie chart data for a feature
  const getPieData = (feature: any) => {
    const totalPlanned = Object.values(
      feature.quarterlyConsumption as Record<string, any>
    ).reduce((sum: number, q: any) => sum + (q?.planned || 0), 0);
    const totalConsumed = Object.values(
      feature.quarterlyConsumption as Record<string, any>
    ).reduce((sum: number, q: any) => sum + (q?.consumed || 0), 0);
    const totalRemaining = totalPlanned - totalConsumed;

    return [
      { name: "Consumed", value: totalConsumed, color: "#10b981" },
      { name: "Remaining", value: totalRemaining, color: "#f59e0b" },
    ].filter((item) => item.value > 0);
  };

  const getSizeColor = (size: string) => {
    const colors: Record<string, string> = {
      S: "#10b981", // green
      M: "#3b82f6", // blue
      L: "#8b5cf6", // purple
      XL: "#f97316", // orange
      XXL: "#ef4444", // red
    };
    return colors[size] || "#6b7280";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "#10b981",
      "in-progress": "#f59e0b",
      blocked: "#ef4444",
      planned: "#3b82f6",
    };
    return colors[status] || "#6b7280";
  };

  const renderBarChart = (feature: any) => {
    const data = getChartData(feature);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="quarter" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#1e293b",
            }}
          />
          <Legend />
          <Bar
            dataKey="consumed"
            name="Consumed SP"
            fill={getStatusColor(feature.status)}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="remaining"
            name="Remaining SP"
            fill="#e2e8f0"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = (feature: any) => {
    const data = getPieData(feature);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) =>
              `${name}: ${value} SP (${(percent * 100).toFixed(0)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#1e293b",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };


  return (
    <Card className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-blue-900">Features on Graphs</span>
          </CardTitle>

          {/* Chart Type Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-600">Chart Type:</span>
            <Select
              value={chartType}
              onValueChange={(value: "bar" | "pie") => setChartType(value)}
            >
              <SelectTrigger className="w-32 border-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Bar Chart</span>
                  </div>
                </SelectItem>
                <SelectItem value="pie">
                  <div className="flex items-center space-x-2">
                    <PieIcon className="w-4 h-4" />
                    <span>Pie Chart</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={features[0]?.id} className="w-full">
          {/* Feature Tabs */}
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 mb-6 bg-blue-50 p-1 rounded-lg">
            {features.map((feature: any) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                className="text-xs px-2 py-1 data-[state=active]:bg-white data-[state=active]:text-blue-900 text-blue-600"
              >
                {feature.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Feature Chart Content */}
          {features.map((feature: any) => (
            <TabsContent
              key={feature.id}
              value={feature.id}
              className="space-y-4"
            >
              {/* Feature Info Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">
                    {feature.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    className={`${
                      feature.size === "S"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : feature.size === "M"
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : feature.size === "L"
                        ? "bg-purple-100 text-purple-800 border-purple-300"
                        : feature.size === "XL"
                        ? "bg-orange-100 text-orange-800 border-orange-300"
                        : "bg-red-100 text-red-800 border-red-300"
                    } border text-xs px-3 py-1`}
                  >
                    {feature.size} ({feature.storyPoints} SP)
                  </Badge>

                  <Badge
                    className={`${
                      feature.status === "completed"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : feature.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : feature.status === "blocked"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-blue-100 text-blue-800 border-blue-300"
                    } border text-xs px-3 py-1`}
                  >
                    {feature.status === "in-progress"
                      ? "In Progress"
                      : feature.status.charAt(0).toUpperCase() +
                        feature.status.slice(1)}
                  </Badge>

                  <div className="text-sm text-blue-700">
                    <span className="font-medium">{feature.assignedTo}</span>
                    <span className="text-blue-500 ml-2">({feature.team})</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                {chartType === "bar"
                  ? renderBarChart(feature)
                  : renderPieChart(feature)}
              </div>

              {/* Feature Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">
                    Total Story Points
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {feature.storyPoints}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Consumed</p>
                  <p className="text-2xl font-bold text-green-700">
                    {feature.consumedPoints}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-sm text-orange-600 mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {feature.storyPoints - feature.consumedPoints}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Progress</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {feature.progress}%
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
