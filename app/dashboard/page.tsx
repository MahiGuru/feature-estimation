"use client";

// No longer need useState or useEffect - all data is static JSON
import Navigation from "@/components/Navigation";
import FeatureTracker from "@/components/FeatureTracker";
import FeaturesGraphs from "@/components/FeaturesGraphs";
import EstimationAccuracy from "@/components/EstimationAccuracy";
import ResourceAllocation from "@/components/ResourceAllocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Remove unused imports - now using featureTimelineData.json only
// import { EstimationData, getEstimationData } from "@/lib/estimationData";
// import { dummyFeatures, dummyProjects } from "@/lib/dummyData";
import {
  Calendar,
} from "lucide-react";

export default function Dashboard() {
  // All dashboard sections now use featureTimelineData.json
  // No need for state management or calculations here

  // All utility functions moved to individual components

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features on Graphs */}
        <div className="my-5">
          <FeaturesGraphs />
        </div>
        <div className="my-5">
          {/* Resource Allocation & Team Performance */}
          <ResourceAllocation />
        </div>

        {/* Feature Tracker */}
        <div className="my-5">
          <FeatureTracker />
        </div>

      </main>
    </div>
  );
}
