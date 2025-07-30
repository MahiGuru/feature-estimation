"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import FeatureTracker from "@/components/FeatureTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EstimationData, getEstimationData } from "@/lib/estimationData";
import { dummyFeatures, dummyProjects } from "@/lib/dummyData";
import {
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  Target,
  TrendingUp,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  User,
} from "lucide-react";

export default function Dashboard() {
  const [estimations, setEstimations] = useState<EstimationData[]>([]);

  useEffect(() => {
    setEstimations(getEstimationData());
  }, []);

  const totalProjects = estimations.length + dummyProjects.length;
  const totalStoryPoints =
    estimations.reduce(
      (sum, est) => sum + (est.aiEstimation?.totalStoryPoints || 0),
      0
    ) + 128;
  const avgSprintVelocity =
    estimations.length > 0
      ? Math.round(
          estimations.reduce((sum, est) => sum + est.sprintVelocity, 0) /
            estimations.length
        )
      : 25;
  const highRiskProjects =
    estimations.filter((est) => est.aiEstimation?.riskLevel === "High").length +
    1;

  // Calculate feature statistics
  const totalFeatures = dummyFeatures.length;
  const completedFeatures = dummyFeatures.filter(
    (f) => f.status === "completed"
  ).length;
  const inProgressFeatures = dummyFeatures.filter(
    (f) => f.status === "progress"
  ).length;
  const blockedFeatures = dummyFeatures.filter(
    (f) => f.status === "blocked"
  ).length;
  const newFeatures = dummyFeatures.filter((f) => f.status === "new").length;

  // For calendar view
  const featuresWithDates = dummyFeatures.filter(
    (f) => f.startDate && f.endDate
  );
  let minDate = new Date(
    Math.min(...featuresWithDates.map((f) => new Date(f.startDate).getTime()))
  );
  let maxDate = new Date(
    Math.max(...featuresWithDates.map((f) => new Date(f.endDate).getTime()))
  );
  const totalDuration = maxDate.getTime() - minDate.getTime();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "progress":
        return "bg-yellow-500";
      case "blocked":
        return "bg-red-500";
      case "new":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCompletedColor = (status: string) => {
    switch (status) {
      case "progress":
        return "bg-yellow-700";
      default:
        return getStatusColor(status);
    }
  };

  const getRiskFromPriority = (priority: string) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Unknown";
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-2">
                    Total Projects
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {totalProjects}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+2 this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">
                    Total Features
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {totalFeatures}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {completedFeatures} completed
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-2">
                    Avg Sprint Velocity
                  </p>
                  <p className="text-3xl font-bold text-purple-700">
                    {avgSprintVelocity}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">story points</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-2">
                    Blocked Features
                  </p>
                  <p className="text-3xl font-bold text-orange-700">
                    {blockedFeatures}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">need attention</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Tracking Calendar */}
        <Card className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl mb-12 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-blue-900">
                Feature Timeline Calendar - Full Year View
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Import timeline data */}
            {(() => {
              const timelineData = require("@/lib/featureTimelineData.json");
              const features = timelineData.features;
              const now = new Date();
              const year = 2025;

              // Synchronized scrolling function
              const handleScroll = (e: any) => {
                const leftScroll = document.getElementById("left-scroll");
                const rightScroll = document.getElementById("right-scroll");
                const scrollTop = e.currentTarget.scrollTop;

                if (e.currentTarget.id === "left-scroll" && rightScroll) {
                  rightScroll.scrollTop = scrollTop;
                } else if (
                  e.currentTarget.id === "right-scroll" &&
                  leftScroll
                ) {
                  leftScroll.scrollTop = scrollTop;
                }
              };

              const getSizeInfo = (size: string) => {
                const sizeColors: Record<string, string> = {
                  S: "bg-green-100 text-green-800 border-green-300",
                  M: "bg-blue-100 text-blue-800 border-blue-300",
                  L: "bg-purple-100 text-purple-800 border-purple-300",
                  XL: "bg-orange-100 text-orange-800 border-orange-300",
                  XXL: "bg-red-100 text-red-800 border-red-300",
                };
                return (
                  sizeColors[size] ||
                  "bg-gray-100 text-gray-800 border-gray-300"
                );
              };

              const getStatusIcon = (status: string) => {
                switch (status) {
                  case "completed":
                    return "✓";
                  case "in-progress":
                    return "◐";
                  case "blocked":
                    return "⚠";
                  default:
                    return "○";
                }
              };

              return (
                <div
                  className="flex"
                  style={{ maxHeight: "calc(100vh - 200px)" }}
                >
                  {/* Left Section - Feature Names */}
                  <div className="w-1/3 border-r border-blue-200 bg-blue-50 flex flex-col">
                    <div className="h-16 px-4 flex items-center justify-between border-b border-blue-200 bg-blue-100 flex-shrink-0">
                      <h3 className="font-bold text-blue-900">Features</h3>
                      <span className="text-xs text-blue-600">
                        Total SP (Consumed/Planned)
                      </span>
                    </div>
                    <div
                      id="left-scroll"
                      className="flex-1 overflow-y-auto"
                      onScroll={handleScroll}
                    >
                      {features.map((feature: any, index: number) => {
                        // Calculate totals from quarterly data
                        const totalPlanned = Object.values(
                          feature.quarterlyConsumption
                        ).reduce((sum: number, q: any) => sum + q.planned, 0);
                        const totalConsumed = Object.values(
                          feature.quarterlyConsumption
                        ).reduce((sum: number, q: any) => sum + q.consumed, 0);

                        // Calculate quarter-specific dates for left display
                        const featureStart = new Date(feature.startDate);
                        const featureEnd = new Date(feature.endDate);
                        const quarterStartDates = {
                          Q1: new Date(year, 0, 1), // Jan 1
                          Q2: new Date(year, 3, 1), // Apr 1
                          Q3: new Date(year, 6, 1), // Jul 1
                          Q4: new Date(year, 9, 1), // Oct 1
                        };
                        const quarterEndDates = {
                          Q1: new Date(year, 2, 31), // Mar 31
                          Q2: new Date(year, 5, 30), // Jun 30
                          Q3: new Date(year, 8, 30), // Sep 30
                          Q4: new Date(year, 11, 31), // Dec 31
                        };

                        return (
                          <div
                            key={feature.id}
                            className="flex items-center justify-between h-[120px] p-4 border-b border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">
                                  {getStatusIcon(feature.status)}
                                </span>
                                <h4 className="font-semibold text-sm text-blue-900">
                                  {feature.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  className={`${getSizeInfo(
                                    feature.size
                                  )} text-xs px-2 py-0 border`}
                                >
                                  {feature.size}
                                </Badge>
                                <span className="text-xs font-bold text-blue-700">
                                  {totalConsumed}/{totalPlanned} SP
                                </span>
                                <span className="text-xs text-blue-600">
                                  {feature.assignedTo}
                                </span>
                                <span className="text-xs text-blue-500">
                                  {feature.team}
                                </span>
                              </div>

                              {/* Date ranges for each active quarter */}
                              <div className="flex flex-wrap gap-1">
                                {["Q1", "Q2", "Q3", "Q4"].map((quarter) => {
                                  const qData =
                                    feature.quarterlyConsumption[quarter];
                                  if (!qData || qData.planned === 0)
                                    return null;

                                  const quarterStart =
                                    quarterStartDates[
                                      quarter as keyof typeof quarterStartDates
                                    ];
                                  const quarterEnd =
                                    quarterEndDates[
                                      quarter as keyof typeof quarterEndDates
                                    ];
                                  const actualStartInQuarter =
                                    featureStart > quarterStart
                                      ? featureStart
                                      : quarterStart;
                                  const actualEndInQuarter =
                                    featureEnd < quarterEnd
                                      ? featureEnd
                                      : quarterEnd;
                                  const isActiveInQuarter =
                                    featureStart <= quarterEnd &&
                                    featureEnd >= quarterStart;

                                  if (!isActiveInQuarter) return null;

                                  return (
                                    <div
                                      key={quarter}
                                      className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border"
                                    >
                                      <span className="font-medium">
                                        {quarter}:
                                      </span>{" "}
                                      {actualStartInQuarter.toLocaleDateString(
                                        "en-US",
                                        { month: "short", day: "numeric" }
                                      )}{" "}
                                      -{" "}
                                      {actualEndInQuarter.toLocaleDateString(
                                        "en-US",
                                        { month: "short", day: "numeric" }
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Left Summary Row */}
                    <div className="h-16 border-t-2 border-blue-300 bg-blue-100 px-4 flex items-center justify-between flex-shrink-0">
                      <span className="font-bold text-blue-900">
                        Total Project
                      </span>
                      <span className="text-sm font-bold text-blue-700">
                        {features.reduce(
                          (sum: number, f: any) =>
                            sum +
                            Object.values(f.quarterlyConsumption).reduce(
                              (s: number, q: any) => s + q.consumed,
                              0
                            ),
                          0
                        )}
                        /
                        {features.reduce(
                          (sum: number, f: any) =>
                            sum +
                            Object.values(f.quarterlyConsumption).reduce(
                              (s: number, q: any) => s + q.planned,
                              0
                            ),
                          0
                        )}{" "}
                        SP
                      </span>
                    </div>
                  </div>

                  {/* Right Section - Timeline Grid */}
                  <div className="flex-1 bg-white flex flex-col">
                    {/* Quarter Headers */}
                    <div className="h-16 flex border-b border-blue-200 bg-blue-50 flex-shrink-0">
                      <div className="flex-1 flex">
                        {["Q1", "Q2", "Q3", "Q4"].map((quarter, index) => (
                          <div
                            key={quarter}
                            className="flex-1 flex flex-col items-center justify-center border-r border-blue-200 last:border-r-0"
                          >
                            <div className="font-bold text-lg text-blue-900">
                              {quarter}
                            </div>
                            <div className="text-xs text-blue-600">{year}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Grid - Scrollable content */}
                    <div
                      id="right-scroll"
                      className="flex-1 overflow-y-auto"
                      onScroll={handleScroll}
                    >
                      {features.map((feature: any, index: number) => {
                        return (
                          <div
                            key={feature.id}
                            className="relative h-[120px] border-b border-blue-100 group"
                          >
                            {/* Quarter dividers */}
                            <div className="absolute inset-0 flex">
                              {[0, 1, 2, 3].map((q) => (
                                <div
                                  key={q}
                                  className="flex-1 border-r border-blue-100 last:border-r-0"
                                />
                              ))}
                            </div>

                            {/* Quarter-based bars */}
                            <div className="absolute inset-0 flex">
                              {["Q1", "Q2", "Q3", "Q4"].map(
                                (quarter, qIndex) => {
                                  const qData =
                                    feature.quarterlyConsumption[quarter];
                                  if (!qData || qData.planned === 0)
                                    return (
                                      <div key={quarter} className="flex-1" />
                                    );

                                  const hasConsumed = qData.consumed > 0;
                                  const consumedPercentage =
                                    qData.planned > 0
                                      ? (qData.consumed / qData.planned) * 100
                                      : 0;

                                  // Calculate quarter date ranges
                                  const quarterStartDates = {
                                    Q1: new Date(year, 0, 1), // Jan 1
                                    Q2: new Date(year, 3, 1), // Apr 1
                                    Q3: new Date(year, 6, 1), // Jul 1
                                    Q4: new Date(year, 9, 1), // Oct 1
                                  };

                                  const quarterEndDates = {
                                    Q1: new Date(year, 2, 31), // Mar 31
                                    Q2: new Date(year, 5, 30), // Jun 30
                                    Q3: new Date(year, 8, 30), // Sep 30
                                    Q4: new Date(year, 11, 31), // Dec 31
                                  };

                                  const featureStart = new Date(
                                    feature.startDate
                                  );
                                  const featureEnd = new Date(feature.endDate);
                                  const quarterStart =
                                    quarterStartDates[quarter];
                                  const quarterEnd = quarterEndDates[quarter];

                                  // Calculate actual start and end dates for this quarter
                                  const actualStartInQuarter =
                                    featureStart > quarterStart
                                      ? featureStart
                                      : quarterStart;
                                  const actualEndInQuarter =
                                    featureEnd < quarterEnd
                                      ? featureEnd
                                      : quarterEnd;

                                  // Check if feature is active in this quarter
                                  const isActiveInQuarter =
                                    featureStart <= quarterEnd &&
                                    featureEnd >= quarterStart;

                                  return (
                                    <div
                                      key={quarter}
                                      className="flex-1 relative flex items-center justify-center p-2"
                                    >
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="relative w-full h-12">
                                              {/* Planned bar (lighter shade) */}
                                              <div
                                                className={`absolute w-full h-full rounded-lg shadow-lg border-2 ${
                                                  feature.status === "completed"
                                                    ? "bg-green-100 border-green-300"
                                                    : feature.status ===
                                                      "in-progress"
                                                    ? "bg-yellow-100 border-yellow-300"
                                                    : feature.status ===
                                                      "blocked"
                                                    ? "bg-red-100 border-red-300"
                                                    : "bg-blue-100 border-blue-300"
                                                }`}
                                              >
                                                {/* Consumed bar (darker shade) */}
                                                {hasConsumed && (
                                                  <div
                                                    className={`absolute h-full rounded-lg shadow-md ${
                                                      feature.status ===
                                                      "completed"
                                                        ? "bg-green-500"
                                                        : feature.status ===
                                                          "in-progress"
                                                        ? "bg-yellow-500"
                                                        : feature.status ===
                                                          "blocked"
                                                        ? "bg-red-500"
                                                        : "bg-blue-500"
                                                    }`}
                                                    style={{
                                                      width: `${consumedPercentage}%`,
                                                    }}
                                                  />
                                                )}

                                                {/* Story points text */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                  <span className="text-sm font-bold text-gray-800 drop-shadow-sm">
                                                    {qData.consumed > 0
                                                      ? `${qData.consumed}/${qData.planned}`
                                                      : qData.planned}{" "}
                                                    SP
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <div className="text-sm">
                                              <p className="font-semibold">
                                                {feature.name} - {quarter}
                                              </p>
                                              <p>Planned: {qData.planned} SP</p>
                                              <p>
                                                Consumed: {qData.consumed} SP
                                              </p>
                                              <p>
                                                Remaining:{" "}
                                                {qData.planned - qData.consumed}{" "}
                                                SP
                                              </p>
                                              <p>
                                                Progress:{" "}
                                                {consumedPercentage.toFixed(0)}%
                                              </p>
                                              {isActiveInQuarter && (
                                                <>
                                                  <hr className="my-1" />
                                                  <p>
                                                    Quarter Start:{" "}
                                                    {actualStartInQuarter.toLocaleDateString()}
                                                  </p>
                                                  <p>
                                                    Quarter End:{" "}
                                                    {actualEndInQuarter.toLocaleDateString()}
                                                  </p>
                                                  <p>
                                                    Feature Duration:{" "}
                                                    {featureStart.toLocaleDateString()}{" "}
                                                    -{" "}
                                                    {featureEnd.toLocaleDateString()}
                                                  </p>
                                                </>
                                              )}
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Row */}
                    <div className="h-16 border-t-2 border-blue-300 bg-blue-100 flex-shrink-0">
                      <div className="flex h-full">
                        {["Q1", "Q2", "Q3", "Q4"].map((quarter) => {
                          // Calculate quarterly totals
                          const quarterTotal = features.reduce(
                            (sum: number, feature: any) => {
                              const qData =
                                feature.quarterlyConsumption[quarter];
                              return sum + (qData ? qData.planned : 0);
                            },
                            0
                          );

                          const quarterConsumed = features.reduce(
                            (sum: number, feature: any) => {
                              const qData =
                                feature.quarterlyConsumption[quarter];
                              return sum + (qData ? qData.consumed : 0);
                            },
                            0
                          );

                          return (
                            <div
                              key={quarter}
                              className="flex-1 flex flex-col items-center justify-center border-r border-blue-200 last:border-r-0"
                            >
                              <div className="text-xs text-blue-600 font-medium">
                                Total
                              </div>
                              <div className="text-sm font-bold text-blue-900">
                                {quarterConsumed}/{quarterTotal} SP
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Legend */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-12 h-6 bg-green-100 rounded-lg border-2 border-green-300 shadow-sm"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 bg-green-500 rounded-l-lg"></div>
                  </div>
                  <span className="text-blue-700 font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-12 h-6 bg-yellow-100 rounded-lg border-2 border-yellow-300 shadow-sm"></div>
                    <div className="absolute top-0 left-0 w-6 h-6 bg-yellow-500 rounded-l-lg"></div>
                  </div>
                  <span className="text-blue-700 font-medium">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-6 bg-red-100 rounded-lg border-2 border-red-300 shadow-sm"></div>
                  <span className="text-blue-700 font-medium">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-6 bg-blue-100 rounded-lg border-2 border-blue-300 shadow-sm"></div>
                  <span className="text-blue-700 font-medium">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border">
                    <span className="font-medium">Q1:</span> Jan 15 - Mar 31
                  </div>
                  <span className="text-blue-700 font-medium">Date Format</span>
                </div>
                <div className="ml-auto text-blue-600">
                  <strong>📍 Layout:</strong> Dates on left, bars on right |{" "}
                  <strong>💡 Tip:</strong> Hover bars for details
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Active Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {dummyProjects.map((project) => (
                <div
                  key={project.id}
                  className="border border-blue-100 rounded-lg p-6 bg-gradient-to-r from-white to-blue-50 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">
                        {project.name}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {project.description}
                      </p>
                    </div>
                    <Badge
                      className={`${
                        project.riskLevel === "high"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : project.riskLevel === "medium"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      } border`}
                    >
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
                        {project.completedStoryPoints}/
                        {project.totalStoryPoints}
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
                      <p className="text-lg font-semibold text-blue-900">
                        {project.teamSize}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Overall Progress</span>
                      <span className="text-blue-900 font-medium">
                        {Math.round(
                          (project.completedStoryPoints /
                            project.totalStoryPoints) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (project.completedStoryPoints /
                          project.totalStoryPoints) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  {/* Timeline */}
                  <div className="mt-4">
                    <p className="text-sm text-blue-600 mb-2">
                      Project Timeline
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span>Start: {new Date().toLocaleDateString()}</span>
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        Estimated End:{" "}
                        {new Date(
                          Date.now() + project.estimatedSprints * 14 * 86400000
                        ).toLocaleDateString()}
                      </span>
                      <Clock className="w-4 h-4" />
                      <span>{project.estimatedSprints * 14} days</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
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
                <h4 className="font-semibold text-blue-900 mb-3">
                  Recent Activity
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-blue-700">
                      User Authentication completed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-blue-700">
                      Dashboard Development in progress
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-700">
                      API Integration started
                    </span>
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
                <Card
                  key={estimation.id}
                  className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl transform hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-blue-900 flex items-center space-x-3">
                        <Target className="w-5 h-5 text-blue-600" />
                        Project #{estimation.id.slice(-6)}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${
                            estimation.aiEstimation?.riskLevel === "High"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : estimation.aiEstimation?.riskLevel === "Medium"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-green-100 text-green-800 border-green-200"
                          } border px-3 py-1`}
                        >
                          {estimation.aiEstimation?.riskLevel || "N/A"} Risk
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
                        <p className="text-2xl font-bold text-blue-900">
                          {estimation.features.length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 mb-1">
                          Story Points
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {estimation.aiEstimation?.totalStoryPoints || "N/A"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 mb-1">
                          Estimated Sprints
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {estimation.aiEstimation?.estimatedSprints || "N/A"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-blue-600 mb-1">Team Size</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {Object.values(estimation.teamMembers).reduce(
                            (a, b) => a + b,
                            0
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-blue-600 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {estimation.features.slice(0, 3).map((feature) => (
                          <Badge
                            key={feature}
                            className="bg-blue-100 text-blue-800 border border-blue-200 text-xs"
                          >
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
                      <p className="text-sm text-blue-600 mb-2">
                        Estimation Timeline
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-blue-700">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Created:{" "}
                          {new Date(estimation.createdAt).toLocaleDateString()}
                        </span>
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          Estimated Duration:{" "}
                          {estimation.aiEstimation?.estimatedSprints *
                            estimation.sprintSize}{" "}
                          weeks
                        </span>
                        <Clock className="w-4 h-4" />
                        <span>
                          {estimation.aiEstimation?.estimatedSprints *
                            estimation.sprintSize *
                            7}{" "}
                          days
                        </span>
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
