"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import FeatureTracker from "@/components/FeatureTracker";
import FeaturesGraphs from "@/components/FeaturesGraphs";
import EstimationAccuracy from "@/components/EstimationAccuracy";
import ResourceAllocation from "@/components/ResourceAllocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Remove unused imports - now using featureTimelineData.json only
// import { EstimationData, getEstimationData } from "@/lib/estimationData";
// import { dummyFeatures, dummyProjects } from "@/lib/dummyData";
import { Calendar } from "lucide-react";

export default function Dashboard() {
  // Teams and people for assignment
  const teams = ["Magnolia", "Chambers Bay", "Pebble Beach", "Fairway"];
  const people = [
    "Achchayya Bolleddu",
    "Chandan Singh",
    "Mahipal Gurjala",
    "Manideep",
    "Sri Rijul",
  ];

  // Function to get random assignment
  const getRandomAssignment = () => ({
    team: teams[Math.floor(Math.random() * teams.length)],
    assignedTo: people[Math.floor(Math.random() * people.length)],
  });

  // State for feature assignments
  const [featureAssignments, setFeatureAssignments] = useState<{
    [key: string]: { team?: string; assignedTo?: string };
  }>({});

  // State for active tab
  const [activeTab, setActiveTab] = useState("features");

  const updateFeatureAssignment = (
    featureId: string,
    field: "team" | "assignedTo",
    value: string
  ) => {
    setFeatureAssignments((prev) => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [field]: value,
      },
    }));
  };

  // Initialize random assignments for all features on component mount
  useEffect(() => {
    const timelineData = require("@/lib/featureTimelineData.json");
    const features = timelineData.features;

    const initialAssignments: {
      [key: string]: { team?: string; assignedTo?: string };
    } = {};
    features.forEach((feature: any) => {
      initialAssignments[feature.id] = getRandomAssignment();
    });

    setFeatureAssignments(initialAssignments);
  }, []);

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

              // Synchronized scrolling function for both Features and Teams tabs
              const handleScroll = (e: any) => {
                const scrollTop = e.currentTarget.scrollTop;

                // Features tab scrolling
                const leftScroll = document.getElementById("left-scroll");
                const rightScroll = document.getElementById("right-scroll");

                // Teams tab scrolling
                const teamsLeftScroll =
                  document.getElementById("teams-left-scroll");
                const teamsRightScroll =
                  document.getElementById("teams-right-scroll");

                if (e.currentTarget.id === "left-scroll" && rightScroll) {
                  rightScroll.scrollTop = scrollTop;
                } else if (
                  e.currentTarget.id === "right-scroll" &&
                  leftScroll
                ) {
                  leftScroll.scrollTop = scrollTop;
                } else if (
                  e.currentTarget.id === "teams-left-scroll" &&
                  teamsRightScroll
                ) {
                  teamsRightScroll.scrollTop = scrollTop;
                } else if (
                  e.currentTarget.id === "teams-right-scroll" &&
                  teamsLeftScroll
                ) {
                  teamsLeftScroll.scrollTop = scrollTop;
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

              // Group features by team (including assignment overrides)
              const getFeaturesByTeam = () => {
                const teamGroups: { [key: string]: any[] } = {};

                // Initialize all teams
                teams.forEach((team) => {
                  teamGroups[team] = [];
                });

                features.forEach((feature: any) => {
                  const assignedTeam =
                    featureAssignments[feature.id]?.team || feature.team;
                  if (assignedTeam && teamGroups[assignedTeam]) {
                    teamGroups[assignedTeam].push(feature);
                  }
                });

                return teamGroups;
              };

              const teamGroups = getFeaturesByTeam();

              return (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-[400px] grid-cols-2 mb-4 ml-4">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="teams">Teams</TabsTrigger>
                  </TabsList>

                  <TabsContent value="features">
                    <div
                      className="flex"
                      style={{ maxHeight: "calc(100vh - 240px)" }}
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
                          className="flex-1 overflow-y-auto pb-20"
                          onScroll={handleScroll}
                        >
                          {features.map((feature: any, index: number) => {
                            // Calculate totals from quarterly data
                            const totalPlanned = Object.values(
                              feature.quarterlyConsumption as Record<
                                string,
                                any
                              >
                            ).reduce(
                              (sum: number, q: any) => sum + (q?.planned || 0),
                              0
                            );
                            const totalConsumed = Object.values(
                              feature.quarterlyConsumption as Record<
                                string,
                                any
                              >
                            ).reduce(
                              (sum: number, q: any) => sum + (q?.consumed || 0),
                              0
                            );

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
                                className="flex items-center justify-between h-[140px] p-4 border-b border-blue-100 hover:bg-blue-100 transition-colors"
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
                                  <div className="flex justify-center">
                                    <div className="flex items-center gap-2 mb-2 flex-1">
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
                                    </div>
                                    {/* Date ranges for each active quarter */}
                                    {/* <div className="flex flex-wrap gap-1">
                                      {["Q1", "Q2", "Q3", "Q4"].map(
                                        (quarter) => {
                                          const qData =
                                            feature.quarterlyConsumption[
                                              quarter
                                            ];
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
                                                {
                                                  month: "short",
                                                  day: "numeric",
                                                }
                                              )}{" "}
                                              -{" "}
                                              {actualEndInQuarter.toLocaleDateString(
                                                "en-US",
                                                {
                                                  month: "short",
                                                  day: "numeric",
                                                }
                                              )}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div> */}
                                  </div>

                                  {/* Assignment Controls */}
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-600 w-12">
                                        Team:
                                      </span>
                                      <Select
                                        value={
                                          featureAssignments[feature.id]
                                            ?.team || ""
                                        }
                                        onValueChange={(value) =>
                                          updateFeatureAssignment(
                                            feature.id,
                                            "team",
                                            value
                                          )
                                        }
                                      >
                                        <SelectTrigger className="h-6 text-xs w-32">
                                          <SelectValue placeholder="Select team" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {teams.map((team) => (
                                            <SelectItem
                                              key={team}
                                              value={team}
                                              className="text-xs"
                                            >
                                              {team}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-600 w-12">
                                        Person:
                                      </span>
                                      <Select
                                        value={
                                          featureAssignments[feature.id]
                                            ?.assignedTo || ""
                                        }
                                        onValueChange={(value) =>
                                          updateFeatureAssignment(
                                            feature.id,
                                            "assignedTo",
                                            value
                                          )
                                        }
                                      >
                                        <SelectTrigger className="h-6 text-xs w-32">
                                          <SelectValue placeholder="Select person" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {people.map((person) => (
                                            <SelectItem
                                              key={person}
                                              value={person}
                                              className="text-xs"
                                            >
                                              {person}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
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
                                Object.values(
                                  f.quarterlyConsumption as Record<string, any>
                                ).reduce(
                                  (s: number, q: any) => s + (q?.consumed || 0),
                                  0
                                ),
                              0
                            )}
                            /
                            {features.reduce(
                              (sum: number, f: any) =>
                                sum +
                                Object.values(
                                  f.quarterlyConsumption as Record<string, any>
                                ).reduce(
                                  (s: number, q: any) => s + (q?.planned || 0),
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
                                <div className="text-xs text-blue-600">
                                  {year}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Timeline Grid - Scrollable content */}
                        <div
                          id="right-scroll"
                          className="flex-1 overflow-y-auto pb-20"
                          onScroll={handleScroll}
                        >
                          {features.map((feature: any, index: number) => {
                            return (
                              <div
                                key={feature.id}
                                className="relative h-[140px] border-b border-blue-100 group"
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
                                    (quarter: any, qIndex) => {
                                      const qData =
                                        feature.quarterlyConsumption[quarter];
                                      if (!qData || qData.planned === 0)
                                        return (
                                          <div
                                            key={quarter}
                                            className="flex-1"
                                          />
                                        );

                                      const hasConsumed = qData.consumed > 0;
                                      const consumedPercentage =
                                        qData.planned > 0
                                          ? (qData.consumed / qData.planned) *
                                            100
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
                                      const featureEnd = new Date(
                                        feature.endDate
                                      );
                                      const quarterStart =
                                        quarterStartDates[quarter];
                                      const quarterEnd =
                                        quarterEndDates[quarter];

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
                                          className="flex-1 relative flex items-center justify-center p-4"
                                        >
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="relative w-full h-12">
                                                  {/* Planned bar (lighter shade) */}
                                                  <div
                                                    className={`absolute w-full h-full rounded-lg shadow-lg border-2 ${
                                                      feature.status ===
                                                      "completed"
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
                                                  <p>
                                                    Planned: {qData.planned} SP
                                                  </p>
                                                  <p>
                                                    Consumed: {qData.consumed}{" "}
                                                    SP
                                                  </p>
                                                  <p>
                                                    Remaining:{" "}
                                                    {qData.planned -
                                                      qData.consumed}{" "}
                                                    SP
                                                  </p>
                                                  <p>
                                                    Progress:{" "}
                                                    {consumedPercentage.toFixed(
                                                      0
                                                    )}
                                                    %
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
                  </TabsContent>

                  <TabsContent value="teams">
                    <div
                      className="flex"
                      style={{ maxHeight: "calc(100vh - 240px)" }}
                    >
                      {/* Left Section - Team Names */}
                      <div className="w-1/3 border-r border-blue-200 bg-blue-50 flex flex-col">
                        <div className="h-16 px-4 flex items-center justify-between border-b border-blue-200 bg-blue-100 flex-shrink-0">
                          <h3 className="font-bold text-blue-900">Teams</h3>
                          <span className="text-xs text-blue-600">
                            Features & SP
                          </span>
                        </div>
                        <div
                          id="teams-left-scroll"
                          className="flex-1 overflow-y-auto pb-20"
                          onScroll={handleScroll}
                        >
                          {teams.map((teamName) => {
                            const teamFeatures = teamGroups[teamName] || [];
                            const teamTotalPlanned = teamFeatures.reduce(
                              (sum: number, feature: any) => {
                                return (
                                  sum +
                                  Object.values(
                                    feature.quarterlyConsumption as Record<
                                      string,
                                      any
                                    >
                                  ).reduce(
                                    (s: number, q: any) =>
                                      s + (q?.planned || 0),
                                    0
                                  )
                                );
                              },
                              0
                            );
                            const teamTotalConsumed = teamFeatures.reduce(
                              (sum: number, feature: any) => {
                                return (
                                  sum +
                                  Object.values(
                                    feature.quarterlyConsumption as Record<
                                      string,
                                      any
                                    >
                                  ).reduce(
                                    (s: number, q: any) =>
                                      s + (q?.consumed || 0),
                                    0
                                  )
                                );
                              },
                              0
                            );

                            return (
                              <div
                                key={teamName}
                                className="border-b border-blue-100"
                              >
                                {/* Team Header */}
                                <div className="h-[60px] p-4 bg-blue-100 border-b border-blue-200">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-blue-900">
                                      {teamName}
                                    </h4>
                                    <span className="text-xs font-bold text-blue-700">
                                      {teamTotalConsumed}/{teamTotalPlanned} SP
                                    </span>
                                  </div>
                                  <div className="text-xs text-blue-600 mt-1">
                                    {teamFeatures.length} feature
                                    {teamFeatures.length !== 1 ? "s" : ""}
                                  </div>
                                </div>

                                {/* Team Features */}
                                {teamFeatures.map((feature: any) => {
                                  const totalPlanned = Object.values(
                                    feature.quarterlyConsumption as Record<
                                      string,
                                      any
                                    >
                                  ).reduce(
                                    (sum: number, q: any) =>
                                      sum + (q?.planned || 0),
                                    0
                                  );
                                  const totalConsumed = Object.values(
                                    feature.quarterlyConsumption as Record<
                                      string,
                                      any
                                    >
                                  ).reduce(
                                    (sum: number, q: any) =>
                                      sum + (q?.consumed || 0),
                                    0
                                  );

                                  return (
                                    <div
                                      key={feature.id}
                                      className="h-[100px] p-3 border-b border-blue-50 hover:bg-blue-50 transition-colors ml-4"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm">
                                          {getStatusIcon(feature.status)}
                                        </span>
                                        <h5 className="font-medium text-xs text-blue-800">
                                          {feature.name}
                                        </h5>
                                      </div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge
                                          className={`${getSizeInfo(
                                            feature.size
                                          )} text-xs px-1 py-0 border`}
                                        >
                                          {feature.size}
                                        </Badge>
                                        <span className="text-xs font-bold text-blue-600">
                                          {totalConsumed}/{totalPlanned} SP
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        Assigned:{" "}
                                        {featureAssignments[feature.id]
                                          ?.assignedTo || feature.assignedTo}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Section - Timeline Grid (same as Features tab) */}
                      <div className="flex-1 bg-white flex flex-col">
                        {/* Quarter Headers */}
                        <div className="h-16 flex border-b border-blue-200 bg-blue-50 flex-shrink-0">
                          {["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                            <div
                              key={quarter}
                              className="flex-1 flex flex-col items-center justify-center border-r border-blue-200 last:border-r-0"
                            >
                              <div className="font-bold text-lg text-blue-900">
                                {quarter}
                              </div>
                              <div className="text-xs text-blue-600">
                                {year}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Teams Timeline Grid - Scrollable content */}
                        <div
                          id="teams-right-scroll"
                          className="flex-1 overflow-y-auto pb-20"
                          onScroll={handleScroll}
                        >
                          {teams.map((teamName) => {
                            const teamFeatures = teamGroups[teamName] || [];

                            return (
                              <div key={teamName}>
                                {/* Team Header Row */}
                                <div className="relative h-[60px] border-b border-blue-200 bg-blue-100">
                                  <div className="absolute inset-0 flex">
                                    {[0, 1, 2, 3].map((q) => (
                                      <div
                                        key={q}
                                        className="flex-1 border-r border-blue-200 last:border-r-0"
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Team Features Rows */}
                                {teamFeatures.map((feature: any) => (
                                  <div
                                    key={feature.id}
                                    className="relative h-[100px] border-b border-blue-50 group"
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

                                    {/* Quarter-based bars (same logic as Features tab) */}
                                    <div className="absolute inset-0 flex">
                                      {["Q1", "Q2", "Q3", "Q4"].map(
                                        (quarter: any, qIndex) => {
                                          const qData =
                                            feature.quarterlyConsumption[
                                              quarter
                                            ];
                                          if (!qData || qData.planned === 0)
                                            return (
                                              <div
                                                key={quarter}
                                                className="flex-1"
                                              />
                                            );

                                          // Same bar rendering logic as Features tab
                                          const consumedPercentage =
                                            qData.planned > 0
                                              ? (qData.consumed /
                                                  qData.planned) *
                                                100
                                              : 0;

                                          return (
                                            <div
                                              key={quarter}
                                              className="flex-1 p-4"
                                            >
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <div className="relative h-full">
                                                      <div
                                                        className={`absolute w-full h-full rounded-lg shadow-lg border-2 ${
                                                          feature.status ===
                                                          "completed"
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
                                                        {qData.consumed > 0 && (
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
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                          <span className="text-xs font-bold text-gray-800 drop-shadow-sm">
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
                                                        {feature.name} -{" "}
                                                        {quarter}
                                                      </p>
                                                      <p>
                                                        Planned: {qData.planned}{" "}
                                                        SP
                                                      </p>
                                                      <p>
                                                        Consumed:{" "}
                                                        {qData.consumed} SP
                                                      </p>
                                                      <p>
                                                        Progress:{" "}
                                                        {consumedPercentage.toFixed(
                                                          0
                                                        )}
                                                        %
                                                      </p>
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
                                ))}
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary Row */}
                        <div className="h-16 border-t-2 border-blue-300 bg-blue-100 flex-shrink-0">
                          <div className="flex h-full">
                            {["Q1", "Q2", "Q3", "Q4"].map((quarter) => {
                              // Calculate quarterly totals across all teams
                              const quarterTotal = Object.values(teamGroups)
                                .flat()
                                .reduce((sum: number, feature: any) => {
                                  const qData =
                                    feature.quarterlyConsumption[quarter];
                                  return sum + (qData ? qData.planned : 0);
                                }, 0);

                              return (
                                <div
                                  key={quarter}
                                  className="flex-1 flex items-center justify-center text-blue-900 font-bold border-r border-blue-300 last:border-r-0"
                                >
                                  {quarterTotal} SP
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
