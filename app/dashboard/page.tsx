"use client";

import React, { useState, useEffect, Fragment } from "react";
import Navigation from "@/components/Navigation";
import FeatureTracker from "@/components/FeatureTracker";
import FeaturesGraphs from "@/components/FeaturesGraphs";
import EstimationAccuracy from "@/components/EstimationAccuracy";
import ResourceAllocation from "@/components/ResourceAllocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePredictionStore } from "@/lib/store";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Filter,
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
// Import demo data for fallback
import * as demoDataModule from "@/dummy/responsedata.json";

export default function Dashboard() {
  // Zustand store
  const { predictionData, clearData, setPredictionData } = usePredictionStore();

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

  // State for quarter visibility - will be initialized based on data
  const [visibleQuarters, setVisibleQuarters] = useState<{
    [key: string]: boolean;
  }>({});

  // State for quarters section visibility
  const [showQuartersSection, setShowQuartersSection] = useState(false);

  // State for recommendation dialog and animation
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Handle recommendation button click with blink animation
  const handleRecommendationClick = () => {
    setIsBlinking(true);
    setTimeout(() => {
      setIsBlinking(false);
      setIsRecommendationOpen(true);
    }, 600); // Blink for 600ms then open dialog
  };

  // Function to force reload demo data
  const reloadDemoData = async () => {
    // Clear everything first
    clearData();
    if (typeof window !== "undefined") {
      localStorage.clear();
    }

    // Dynamically import fresh data from public directory
    try {
      const response = await fetch("/responsedata.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const freshData = await response.json();
      setPredictionData(freshData);
    } catch (error) {
      // Use the imported demo data as fallback
      const demoData = JSON.parse(JSON.stringify(demoDataModule));
      setPredictionData(demoData);
    }
  };

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

  // Initialize random assignments and quarter visibility based on data
  useEffect(() => {
    if (predictionData && predictionData.features) {
      const features = predictionData.features;

      // Initialize feature assignments
      const initialAssignments: {
        [key: string]: { team?: string; assignedTo?: string };
      } = {};
      features.forEach((feature: any) => {
        initialAssignments[feature.id] = getRandomAssignment();
      });
      setFeatureAssignments(initialAssignments);

      // Initialize quarter visibility based on which quarters have data
      const quartersWithData: { [key: string]: boolean } = {};

      features.forEach((feature: any) => {
        if (feature.quarterlyConsumption) {
          Object.keys(feature.quarterlyConsumption).forEach((quarterKey) => {
            const qData = feature.quarterlyConsumption[quarterKey];
            const plannedValue = qData?.planned;
            const parsedPlanned =
              typeof plannedValue === "string"
                ? parseInt(plannedValue)
                : plannedValue;
            if (qData && parsedPlanned > 0) {
              quartersWithData[quarterKey] = true;
            }
          });
        }
      });

      // Update visible quarters to show ALL quarters with data by default
      const sortedQuarters = Object.keys(quartersWithData).sort((a, b) => {
        const [aQ, aY] = a.split("_");
        const [bQ, bY] = b.split("_");
        const yearDiff = parseInt(aY) - parseInt(bY);
        if (yearDiff !== 0) return yearDiff;
        return parseInt(aQ.substring(1)) - parseInt(bQ.substring(1));
      });

      // Set all quarters as visible by default
      setVisibleQuarters(quartersWithData);
    }
  }, [predictionData]);

  // Force re-sync scroll elements when data changes
  useEffect(() => {
    if (predictionData && Object.keys(visibleQuarters).length > 0) {
      setTimeout(() => {
        const elements = {
          leftScroll: document.getElementById("left-scroll"),
          rightHeader: document.getElementById("right-header-scroll"),
          rightBody: document.getElementById("right-body-scroll"),
          teamsLeft: document.getElementById("teams-left-scroll"),
          teamsHeader: document.getElementById("teams-header-scroll"),
          teamsBody: document.getElementById("teams-body-scroll"),
        };

        // Reset all scroll positions to ensure sync
        Object.entries(elements).forEach(([name, element]) => {
          if (element) {
            element.scrollLeft = 0;
            element.scrollTop = 0;
          }
        });
      }, 200);
    }
  }, [predictionData, visibleQuarters]);

  // Show no data state if there's no prediction data
  if (!predictionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Navigation />
        <main className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Card className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  No Prediction Data Available
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Welcome to the Estimatooo. To see your project timeline,
                  graphs, and resource allocation, please submit an estimation
                  form first.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    What you'll see after submitting:
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Interactive feature timeline calendar</li>
                    <li>• Resource allocation charts</li>
                    <li>• Team workload analysis</li>
                    <li>• Project estimation graphs</li>
                  </ul>
                </div>

                <Button
                  onClick={() => (window.location.href = "/")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Go to Estimation Form
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Check if we're in demo mode by looking for the demo data structure
  const isDemoMode =
    predictionData?.projectEstimation?.estimationId === "EST-2025-001";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />

      {/* Add blink animation styles */}
      <style jsx>{`
        @keyframes blink {
          0%,
          50%,
          100% {
            opacity: 1;
          }
          25%,
          75% {
            opacity: 0.3;
          }
        }
        .blink-animation {
          animation: blink 0.6s ease-in-out;
        }
      `}</style>

      {/* Demo Mode Banner */}
      {/* {isDemoMode && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span className="font-medium">
                  Demo Mode Active - Displaying sample data from
                  dummy/responsedata.json
                </span>
              </div>
              <Button
                onClick={reloadDemoData}
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Force Reload Data
              </Button>
            </div>
          </div>
        </div>
      )} */}

      <main className="container mx-auto px-6 py-12">
        {/* Feature Tracker */}
        <div className="my-5">
          <FeatureTracker />
        </div>

        {/* Feature Tracking Calendar */}
        <Card className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl mb-12 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-900">
                    Feature Timeline Calendar - Multi-Year View
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Lightbulb
                          onClick={handleRecommendationClick}
                          className={`w-5 h-5 text-amber-600 hover:text-amber-700 cursor-pointer transition-colors ${
                            isBlinking ? "animate-blink" : ""
                          }`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Recommendations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardTitle>

              {/* Quarter Filter Controls */}
              <div className="flex flex-col space-y-2">
                {/* Toggle Button */}
                <button
                  onClick={() => setShowQuartersSection(!showQuartersSection)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Show Quarters
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      showQuartersSection ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Collapsible Quarter Checkboxes */}
            {showQuartersSection && (
              <div className="flex items-center justify-evenly space-x-4 flex-wrap bg-blue-25 p-3 rounded-lg border border-blue-100">
                {Object.keys(visibleQuarters)
                  .sort((a, b) => {
                    const [aQuarter, aYear] = a.split("_");
                    const [bQuarter, bYear] = b.split("_");

                    // First compare by year
                    const yearDiff = parseInt(aYear) - parseInt(bYear);
                    if (yearDiff !== 0) return yearDiff;

                    // Then compare by quarter number (Q1, Q2, Q3, Q4)
                    const aQuarterNum = parseInt(aQuarter.substring(1));
                    const bQuarterNum = parseInt(bQuarter.substring(1));
                    return aQuarterNum - bQuarterNum;
                  })
                  .map((quarterKey) => {
                    // Extract display name: "Q3_2025" -> "Q3 2025"
                    const [quarter, year] = quarterKey.split("_");
                    const displayName = year ? `${quarter} ${year}` : quarter;

                    return (
                      <div
                        key={quarterKey}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`quarter-${quarterKey}`}
                          checked={visibleQuarters[quarterKey]}
                          onCheckedChange={(checked) => {
                            setVisibleQuarters((prev) => ({
                              ...prev,
                              [quarterKey]: checked as boolean,
                            }));
                          }}
                          className="border-gray-300"
                        />
                        <label
                          htmlFor={`quarter-${quarterKey}`}
                          className="text-sm font-medium text-gray-700 cursor-pointer select-none whitespace-nowrap"
                        >
                          {displayName}
                        </label>
                      </div>
                    );
                  })}
              </div>
            )}
            {/* Use timeline data from Zustand store */}
            {predictionData && predictionData.features ? (
              (() => {
                const features = predictionData.features;
                const now = new Date();
                const currentYear = 2025;

                // Determine which quarters have data - get all quarter keys with data
                const allQuarterKeys = new Set<string>();

                features.forEach((feature: any) => {
                  if (feature.quarterlyConsumption) {
                    const allQuarters = Object.keys(
                      feature.quarterlyConsumption
                    );

                    allQuarters.forEach((qKey) => {
                      const qData = feature.quarterlyConsumption[qKey];
                      const plannedValue = qData?.planned;
                      const parsedPlanned =
                        typeof plannedValue === "string"
                          ? parseInt(plannedValue)
                          : plannedValue;

                      if (qData && parsedPlanned > 0) {
                        allQuarterKeys.add(qKey);
                      }
                    });
                  }
                });

                // Sort quarters chronologically (by year then by quarter number)
                const quartersWithData = Array.from(allQuarterKeys).sort(
                  (a, b) => {
                    const [aQuarter, aYear] = a.split("_");
                    const [bQuarter, bYear] = b.split("_");

                    // First compare by year
                    const yearDiff = parseInt(aYear) - parseInt(bYear);
                    if (yearDiff !== 0) return yearDiff;

                    // Then compare by quarter number (Q1, Q2, Q3, Q4)
                    const aQuarterNum = parseInt(aQuarter.substring(1));
                    const bQuarterNum = parseInt(bQuarter.substring(1));
                    return aQuarterNum - bQuarterNum;
                  }
                );

                // Create display from all quarters with data
                const getQuarterDisplay = () => {
                  if (quartersWithData.length === 0) {
                    return [];
                  }

                  // Convert quarter keys to display format
                  const baseDisplay = quartersWithData.map((qKey) => {
                    const [quarter, year] = qKey.split("_");
                    return {
                      quarter: quarter,
                      year: parseInt(year) || currentYear,
                      quarterKey: qKey,
                    };
                  });

                  // Filter based on visible quarters (using quarterKey)
                  const filteredDisplay = baseDisplay.filter(
                    (item) => visibleQuarters[item.quarterKey]
                  );
                  return filteredDisplay;
                };

                const quarterDisplay = getQuarterDisplay();
                const year = currentYear; // Keep for backward compatibility

                // Helper function to get quarter dates
                const getQuarterDates = (quarter: string, year: number) => {
                  const quarterMonths = {
                    Q1: { start: 0, end: 2 }, // Jan-Mar
                    Q2: { start: 3, end: 5 }, // Apr-Jun
                    Q3: { start: 6, end: 8 }, // Jul-Sep
                    Q4: { start: 9, end: 11 }, // Oct-Dec
                  };
                  const months =
                    quarterMonths[quarter as keyof typeof quarterMonths];
                  const lastDay = new Date(year, months.end + 1, 0).getDate();
                  return {
                    start: new Date(year, months.start, 1),
                    end: new Date(year, months.end, lastDay),
                  };
                };

                // Note: Scroll synchronization is now handled by inline event handlers for better performance

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

                // Calculate total story points across all features
                const totalPlannedPoints = features.reduce(
                  (sum: number, feature: any) => {
                    return (
                      sum +
                      Object.values(
                        feature.quarterlyConsumption as Record<string, any>
                      ).reduce(
                        (s: number, q: any) => s + (parseInt(q?.planned) || 0),
                        0
                      )
                    );
                  },
                  0
                );

                const totalConsumedPoints = features.reduce(
                  (sum: number, feature: any) => {
                    return (
                      sum +
                      Object.values(
                        feature.quarterlyConsumption as Record<string, any>
                      ).reduce(
                        (s: number, q: any) => s + (parseInt(q?.consumed) || 0),
                        0
                      )
                    );
                  },
                  0
                );

                return (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-[400px] grid-cols-2 mb-4 ml-4 d-none">
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
                            <h3 className="font-bold text-blue-900">
                              Features
                            </h3>
                            <span className="text-xs text-blue-600 font-semibold">
                              Total: {totalConsumedPoints}/{totalPlannedPoints}{" "}
                              SP
                            </span>
                          </div>
                          <div
                            id="left-scroll"
                            className="flex-1 overflow-y-auto pb-20"
                            onScroll={(e) => {
                              try {
                                const rightBodyScroll =
                                  document.getElementById("right-body-scroll");
                                if (
                                  rightBodyScroll &&
                                  rightBodyScroll.scrollTop !==
                                    e.currentTarget.scrollTop
                                ) {
                                  rightBodyScroll.scrollTop =
                                    e.currentTarget.scrollTop;
                                }
                              } catch (error) {
                                // Silently handle scroll sync errors
                              }
                            }}
                          >
                            {features.map((feature: any, index: number) => {
                              // Calculate totals from quarterly data
                              const totalPlanned = Object.values(
                                feature.quarterlyConsumption as Record<
                                  string,
                                  any
                                >
                              ).reduce(
                                (sum: number, q: any) =>
                                  sum + (parseInt(q?.planned) || 0),
                                0
                              );
                              const totalConsumed = Object.values(
                                feature.quarterlyConsumption as Record<
                                  string,
                                  any
                                >
                              ).reduce(
                                (sum: number, q: any) =>
                                  sum + (parseInt(q?.consumed) || 0),
                                0
                              );

                              // Calculate quarter-specific dates for left display
                              const featureStart = new Date(feature.startDate);
                              const featureEnd = new Date(feature.endDate);

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
                                              key={quarterKey}
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
                                    {/* <div className="flex flex-col gap-2">
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
                                    </div> */}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Left Summary Row */}
                          {/* <div className="h-16 border-t-2 border-blue-300 bg-blue-100 px-4 flex items-center justify-between flex-shrink-0">
                            <span className="font-bold text-blue-900">
                              Total Project
                            </span>
                            <span className="text-sm font-bold text-blue-700">
                              {features.reduce(
                                (sum: number, f: any) =>
                                  sum +
                                  Object.values(
                                    f.quarterlyConsumption as Record<
                                      string,
                                      any
                                    >
                                  ).reduce(
                                    (s: number, q: any) =>
                                      s + (parseInt(q?.consumed) || 0),
                                    0
                                  ),
                                0
                              )}
                              /
                              {features.reduce(
                                (sum: number, f: any) =>
                                  sum +
                                  Object.values(
                                    f.quarterlyConsumption as Record<
                                      string,
                                      any
                                    >
                                  ).reduce(
                                    (s: number, q: any) =>
                                      s + (parseInt(q?.planned) || 0),
                                    0
                                  ),
                                0
                              )}{" "}
                              SP
                            </span>
                          </div> */}
                        </div>

                        {/* Right Section - Timeline Grid */}
                        <div className="flex-1 bg-white flex flex-col overflow-hidden">
                          {/* Single wrapper for both header and content with synchronized scrolling */}
                          <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Header with horizontal scroll */}
                            <div
                              className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100"
                              id="right-header-scroll"
                              onScroll={(e) => {
                                try {
                                  const bodyScroll =
                                    document.getElementById(
                                      "right-body-scroll"
                                    );
                                  if (
                                    bodyScroll &&
                                    bodyScroll.scrollLeft !==
                                      e.currentTarget.scrollLeft
                                  ) {
                                    bodyScroll.scrollLeft =
                                      e.currentTarget.scrollLeft;
                                  }
                                } catch (error) {
                                  // Silently handle scroll sync errors
                                }
                              }}
                            >
                              <div className="h-16 border-b border-blue-200 bg-blue-50 flex-shrink-0 flex" style={{ width: quarterDisplay.length <= 4 ? '100%' : `${quarterDisplay.length * 25}%`, minWidth: 'fit-content' }}>
                                {quarterDisplay.length > 0 ? (
                                  quarterDisplay.map((qItem, index) => {
                                    const quarter = qItem.quarter;
                                    const quarterKey = qItem.quarterKey;
                                    // Calculate quarterly totals for this quarter
                                    const quarterTotal = features.reduce(
                                      (sum: number, feature: any) => {
                                        if (!feature.quarterlyConsumption)
                                          return sum;
                                        // Use the specific quarter key from qItem
                                        const qData =
                                          feature.quarterlyConsumption[
                                            quarterKey
                                          ];
                                        return (
                                          sum +
                                          (qData
                                            ? parseInt(qData.planned) || 0
                                            : 0)
                                        );
                                      },
                                      0
                                    );

                                    const quarterConsumed = features.reduce(
                                      (sum: number, feature: any) => {
                                        if (!feature.quarterlyConsumption)
                                          return sum;
                                        // Use the specific quarter key from qItem
                                        const qData =
                                          feature.quarterlyConsumption[
                                            quarterKey
                                          ];
                                        return (
                                          sum +
                                          (qData
                                            ? parseInt(qData.consumed) || 0
                                            : 0)
                                        );
                                      },
                                      0
                                    );

                                    // Get quarter date range
                                    const qDates = getQuarterDates(
                                      quarter,
                                      qItem.year
                                    );
                                    const startDate =
                                      qDates.start.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      });
                                    const endDate =
                                      qDates.end.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      });

                                    return (
                                      <div
                                        key={quarterKey}
                                        className="flex flex-col items-center justify-center border-r border-blue-200 last:border-r-0 px-2 py-1"
                                        style={{ 
                                          width: quarterDisplay.length <= 4 ? `${100 / quarterDisplay.length}%` : '25%',
                                          minWidth: '25%' 
                                        }}
                                      >
                                        <div className="font-bold text-base text-blue-900">
                                          {quarter} {qItem.year}
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5">
                                            {startDate} - {endDate}
                                          </span>
                                        </div>
                                        <div className="text-xs font-bold text-blue-700 mt-1">
                                          {quarterConsumed}/{quarterTotal} SP
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <span>No quarters selected</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Body with both horizontal and vertical scroll */}
                            <div
                              id="right-body-scroll"
                              className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100"
                              onScroll={(e) => {
                                try {
                                  // Sync horizontal scroll with header (avoid infinite loop)
                                  const headerScroll = document.getElementById(
                                    "right-header-scroll"
                                  );
                                  if (
                                    headerScroll &&
                                    headerScroll.scrollLeft !==
                                      e.currentTarget.scrollLeft
                                  ) {
                                    headerScroll.scrollLeft =
                                      e.currentTarget.scrollLeft;
                                  }
                                  // Sync vertical scroll with left panel (avoid infinite loop)
                                  const leftScroll =
                                    document.getElementById("left-scroll");
                                  if (
                                    leftScroll &&
                                    leftScroll.scrollTop !==
                                      e.currentTarget.scrollTop
                                  ) {
                                    leftScroll.scrollTop =
                                      e.currentTarget.scrollTop;
                                  }
                                } catch (error) {
                                  // Silently handle scroll sync errors
                                }
                              }}
                            >
                              <div className="min-w-max pb-20">
                                {features.map((feature: any, index: number) => {
                                  return (
                                    <div
                                      key={feature.id}
                                      className="relative h-[140px] border-b border-blue-100 group"
                                      style={{ width: quarterDisplay.length <= 4 ? '100%' : `${quarterDisplay.length * 25}%`, minWidth: 'fit-content' }}
                                    >
                                      {/* Quarter dividers for rolling view */}
                                      <div className="absolute inset-0 flex">
                                        {quarterDisplay.length > 0 &&
                                          quarterDisplay.map((qItem, index) => (
                                            <div
                                              key={`${qItem.quarter}-${qItem.year}-divider`}
                                              className="border-r border-blue-100 last:border-r-0"
                                              style={{ 
                                                width: quarterDisplay.length <= 4 ? `${100 / quarterDisplay.length}%` : '25%',
                                                minWidth: '25%' 
                                              }}
                                            />
                                          ))}
                                      </div>

                                      {/* Continuous feature bar spanning multiple quarters */}
                                      <div className="absolute inset-0 flex items-center">
                                        {(() => {
                                          const featureStart = new Date(
                                            feature.startDate
                                          );
                                          const featureEnd = new Date(
                                            feature.endDate
                                          );

                                          // Calculate total story points across all quarters
                                          const totalPlanned = Object.values(
                                            feature.quarterlyConsumption as Record<
                                              string,
                                              any
                                            >
                                          ).reduce(
                                            (sum: number, q: any) =>
                                              sum + (parseInt(q?.planned) || 0),
                                            0
                                          );

                                          const totalConsumed = Object.values(
                                            feature.quarterlyConsumption as Record<
                                              string,
                                              any
                                            >
                                          ).reduce(
                                            (sum: number, q: any) =>
                                              sum +
                                              (parseInt(q?.consumed) || 0),
                                            0
                                          );

                                          if (totalPlanned === 0) {
                                            return quarterDisplay.map(
                                              (qItem) => (
                                                <div
                                                  key={`${qItem.quarter}-${qItem.year}`}
                                                  className="flex-1"
                                                />
                                              )
                                            );
                                          }

                                          // Calculate which quarters the feature spans based on quarterlyConsumption data
                                          const spannedQuarters =
                                            quarterDisplay.filter((qItem) => {
                                              const quarterKey = qItem.quarterKey;
                                              const quarterData = feature.quarterlyConsumption?.[quarterKey];
                                              // Include quarter if it has planned data
                                              return quarterData && parseInt(quarterData.planned) > 0;
                                            });

                                          if (spannedQuarters.length === 0) {
                                            return quarterDisplay.map(
                                              (qItem) => (
                                                <div
                                                  key={`${qItem.quarter}-${qItem.year}`}
                                                  className="flex-1"
                                                />
                                              )
                                            );
                                          }

                                          const firstSpannedIndex =
                                            quarterDisplay.findIndex(
                                              (q) =>
                                                q.quarter ===
                                                  spannedQuarters[0].quarter &&
                                                q.year ===
                                                  spannedQuarters[0].year
                                            );
                                          const lastSpannedIndex =
                                            quarterDisplay.findIndex(
                                              (q) =>
                                                q.quarter ===
                                                  spannedQuarters[
                                                    spannedQuarters.length - 1
                                                  ].quarter &&
                                                q.year ===
                                                  spannedQuarters[
                                                    spannedQuarters.length - 1
                                                  ].year
                                            );

                                          const consumedPercentage =
                                            totalPlanned > 0
                                              ? (totalConsumed / totalPlanned) *
                                                100
                                              : 0;

                                          // Render bar directly without quarter mapping
                                          return (
                                                    <TooltipProvider>
                                                      <Tooltip>
                                                        <TooltipTrigger asChild>
                                                          <div
                                                            className="absolute h-12 flex items-center justify-center"
                                                            style={{
                                                              left: quarterDisplay.length <= 4 
                                                                ? `calc(${(firstSpannedIndex / quarterDisplay.length) * 100}% + 1rem)`
                                                                : `calc(${firstSpannedIndex * 25}% + 1rem)`,
                                                              width: quarterDisplay.length <= 4
                                                                ? `calc(${((lastSpannedIndex - firstSpannedIndex + 1) / quarterDisplay.length) * 100}% - 2rem)`
                                                                : `calc(${(lastSpannedIndex - firstSpannedIndex + 1) * 25}% - 2rem)`,
                                                            }}
                                                          >
                                                            {/* Planned bar (lighter shade) */}
                                                            <div
                                                              className={`w-full h-full rounded-lg shadow-lg border-2 relative ${
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
                                                              {totalConsumed >
                                                                0 && (
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

                                                              {/* Quarter-wise story points - simple layout */}
                                                              <div className="absolute inset-0 flex items-center justify-center gap-2 px-2">
                                                                {quarterDisplay.map(
                                                                  (
                                                                    qDisplayItem,
                                                                    qIndex
                                                                  ) => {
                                                                    const qData =
                                                                      feature
                                                                        .quarterlyConsumption?.[
                                                                        qDisplayItem
                                                                          .quarterKey
                                                                      ];
                                                                    const qPlanned =
                                                                      parseInt(
                                                                        qData?.planned
                                                                      ) || 0;
                                                                    const qConsumed =
                                                                      parseInt(
                                                                        qData?.consumed
                                                                      ) || 0;

                                                                    if (
                                                                      qPlanned ===
                                                                      0
                                                                    )
                                                                      return null;

                                                                    return (
                                                                      <React.Fragment
                                                                        key={
                                                                          qDisplayItem.quarterKey
                                                                        }
                                                                      >
                                                                        <span className="text-xs font-bold text-gray-800 drop-shadow-sm whitespace-nowrap px-2 py-1 bg-white bg-opacity-70 rounded">
                                                                          {
                                                                            qDisplayItem.quarter
                                                                          }{" "}
                                                                          -{" "}
                                                                          {qConsumed >
                                                                          0
                                                                            ? `${qConsumed}/${qPlanned}`
                                                                            : qPlanned}
                                                                          SP
                                                                        </span>
                                                                        {qIndex <
                                                                          quarterDisplay.length -
                                                                            1 &&
                                                                          qIndex <
                                                                            quarterDisplay.filter(
                                                                              (
                                                                                q
                                                                              ) => {
                                                                                const nextQData =
                                                                                  feature
                                                                                    .quarterlyConsumption?.[
                                                                                    q
                                                                                      .quarterKey
                                                                                  ];
                                                                                return (
                                                                                  parseInt(
                                                                                    nextQData?.planned
                                                                                  ) >
                                                                                  0
                                                                                );
                                                                              }
                                                                            )
                                                                              .length -
                                                                              1 && (
                                                                            <span className="text-gray-400 text-xs">
                                                                              |
                                                                            </span>
                                                                          )}
                                                                      </React.Fragment>
                                                                    );
                                                                  }
                                                                )}
                                                              </div>

                                                              {/* Total story points at the bottom */}
                                                              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black bg-opacity-20 text-white text-xs font-bold py-1 rounded-b-lg">
                                                                Total:{" "}
                                                                {totalConsumed >
                                                                0
                                                                  ? `${totalConsumed}/${totalPlanned}`
                                                                  : totalPlanned}{" "}
                                                                SP
                                                              </div>
                                                            </div>
                                                          </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                          <div className="text-sm">
                                                            <p className="font-semibold">
                                                              {feature.name}
                                                            </p>
                                                            <div className="text-xs text-gray-500 mb-2">
                                                              {featureStart.toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                  month:
                                                                    "short",
                                                                  day: "numeric",
                                                                  year: "numeric",
                                                                }
                                                              )}{" "}
                                                              -{" "}
                                                              {featureEnd.toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                  month:
                                                                    "short",
                                                                  day: "numeric",
                                                                  year: "numeric",
                                                                }
                                                              )}
                                                            </div>
                                                            <p>
                                                              Total Planned:{" "}
                                                              {totalPlanned} SP
                                                            </p>
                                                            <p>
                                                              Total Consumed:{" "}
                                                              {totalConsumed} SP
                                                            </p>
                                                            <p>
                                                              Remaining:{" "}
                                                              {totalPlanned -
                                                                totalConsumed}{" "}
                                                              SP
                                                            </p>
                                                            <p>
                                                              Progress:{" "}
                                                              {consumedPercentage.toFixed(
                                                                0
                                                              )}
                                                              %
                                                            </p>
                                                            <hr className="my-2" />
                                                            <p className="text-xs font-semibold">
                                                              Quarterly
                                                              Breakdown:
                                                            </p>
                                                            {Object.entries(
                                                              feature.quarterlyConsumption
                                                            ).map(
                                                              ([
                                                                quarter,
                                                                qData,
                                                              ]: [
                                                                string,
                                                                any
                                                              ]) => {
                                                                const planned =
                                                                  parseInt(
                                                                    qData?.planned
                                                                  ) || 0;
                                                                const consumed =
                                                                  parseInt(
                                                                    qData?.consumed
                                                                  ) || 0;
                                                                if (
                                                                  planned === 0
                                                                )
                                                                  return null;
                                                                return (
                                                                  <p
                                                                    key={
                                                                      quarter
                                                                    }
                                                                    className="text-xs"
                                                                  >
                                                                    {quarter}:{" "}
                                                                    {consumed >
                                                                    0
                                                                      ? `${consumed}/${planned}`
                                                                      : planned}{" "}
                                                                    SP
                                                                  </p>
                                                                );
                                                              }
                                                            )}
                                                          </div>
                                                        </TooltipContent>
                                                      </Tooltip>
                                                    </TooltipProvider>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
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
                            <span className="text-xs text-blue-600 font-semibold">
                              Total: {totalConsumedPoints}/{totalPlannedPoints}{" "}
                              SP
                            </span>
                          </div>
                          <div
                            id="teams-left-scroll"
                            className="flex-1 overflow-y-auto pb-20"
                            onScroll={(e) => {
                              try {
                                const teamsBodyScroll =
                                  document.getElementById("teams-body-scroll");
                                if (
                                  teamsBodyScroll &&
                                  teamsBodyScroll.scrollTop !==
                                    e.currentTarget.scrollTop
                                ) {
                                  teamsBodyScroll.scrollTop =
                                    e.currentTarget.scrollTop;
                                }
                              } catch (error) {
                                // Silently handle scroll sync errors
                              }
                            }}
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
                                        s + (parseInt(q?.planned) || 0),
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
                                        {teamTotalConsumed}/{teamTotalPlanned}{" "}
                                        SP
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
                        <div className="flex-1 bg-white flex flex-col overflow-hidden">
                          {/* Single wrapper for both header and content with synchronized scrolling */}
                          <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Header with horizontal scroll */}
                            <div
                              className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100"
                              id="teams-header-scroll"
                              onScroll={(e) => {
                                try {
                                  const bodyScroll =
                                    document.getElementById(
                                      "teams-body-scroll"
                                    );
                                  if (
                                    bodyScroll &&
                                    bodyScroll.scrollLeft !==
                                      e.currentTarget.scrollLeft
                                  ) {
                                    bodyScroll.scrollLeft =
                                      e.currentTarget.scrollLeft;
                                  }
                                } catch (error) {
                                  // Silently handle scroll sync errors
                                }
                              }}
                            >
                              <div className="h-16 border-b border-blue-200 bg-blue-50 flex-shrink-0 flex" style={{ width: quarterDisplay.length <= 4 ? '100%' : `${quarterDisplay.length * 25}%`, minWidth: 'fit-content' }}>
                                {quarterDisplay.length > 0 ? (
                                  quarterDisplay.map((qItem) => {
                                    const quarter = qItem.quarter;
                                    // Calculate quarterly totals across all teams
                                    const quarterTotal = Object.values(
                                      teamGroups
                                    )
                                      .flat()
                                      .reduce((sum: number, feature: any) => {
                                        if (!feature.quarterlyConsumption)
                                          return sum;
                                        // Use the specific quarter key from qItem
                                        const qData =
                                          feature.quarterlyConsumption[
                                            qItem.quarterKey
                                          ];
                                        return (
                                          sum +
                                          (qData
                                            ? parseInt(qData.planned) || 0
                                            : 0)
                                        );
                                      }, 0);

                                    const quarterConsumed = Object.values(
                                      teamGroups
                                    )
                                      .flat()
                                      .reduce((sum: number, feature: any) => {
                                        if (!feature.quarterlyConsumption)
                                          return sum;
                                        // Use the specific quarter key from qItem
                                        const qData =
                                          feature.quarterlyConsumption[
                                            qItem.quarterKey
                                          ];
                                        return (
                                          sum +
                                          (qData
                                            ? parseInt(qData.consumed) || 0
                                            : 0)
                                        );
                                      }, 0);

                                    // Get quarter date range for teams tab
                                    const qDates = getQuarterDates(
                                      quarter,
                                      qItem.year
                                    );
                                    const startDate =
                                      qDates.start.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      });
                                    const endDate =
                                      qDates.end.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      });

                                    return (
                                      <div
                                        key={qItem.quarterKey}
                                        className="flex flex-col items-center justify-center border-r border-blue-200 last:border-r-0 px-2 py-1"
                                        style={{ 
                                          width: quarterDisplay.length <= 4 ? `${100 / quarterDisplay.length}%` : '25%',
                                          minWidth: '25%' 
                                        }}
                                      >
                                        <div className="font-bold text-base text-blue-900">
                                          {quarter} {qItem.year}
                                        </div>
                                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-0.5">
                                          {startDate} - {endDate}
                                        </div>
                                        <div className="text-xs font-bold text-blue-700 mt-1">
                                          {quarterConsumed}/{quarterTotal} SP
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="flex-1 flex items-center justify-center text-gray-500">
                                    <span>No quarters selected</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Body with both horizontal and vertical scroll */}
                            <div
                              id="teams-body-scroll"
                              className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100"
                              onScroll={(e) => {
                                try {
                                  // Sync horizontal scroll with header (avoid infinite loop)
                                  const headerScroll = document.getElementById(
                                    "teams-header-scroll"
                                  );
                                  if (
                                    headerScroll &&
                                    headerScroll.scrollLeft !==
                                      e.currentTarget.scrollLeft
                                  ) {
                                    headerScroll.scrollLeft =
                                      e.currentTarget.scrollLeft;
                                  }
                                  // Sync vertical scroll with left panel (avoid infinite loop)
                                  const leftScroll =
                                    document.getElementById(
                                      "teams-left-scroll"
                                    );
                                  if (
                                    leftScroll &&
                                    leftScroll.scrollTop !==
                                      e.currentTarget.scrollTop
                                  ) {
                                    leftScroll.scrollTop =
                                      e.currentTarget.scrollTop;
                                  }
                                } catch (error) {
                                  // Silently handle scroll sync errors
                                }
                              }}
                            >
                              <div className="min-w-max pb-1">
                                {teams.map((teamName) => {
                                  const teamFeatures =
                                    teamGroups[teamName] || [];

                                  return (
                                    <div key={teamName}>
                                      {/* Team Header Row */}
                                      <div className="relative h-[60px] border-b border-blue-200 bg-blue-100" style={{ width: quarterDisplay.length <= 4 ? '100%' : `${quarterDisplay.length * 25}%`, minWidth: 'fit-content' }}>
                                        <div className="absolute inset-0 flex">
                                          {quarterDisplay.length > 0 &&
                                            quarterDisplay.map((qItem) => (
                                              <div
                                                key={`${qItem.quarter}-${qItem.year}-team-header`}
                                                className="border-r border-blue-200 last:border-r-0"
                                                style={{ 
                                                  width: quarterDisplay.length <= 4 ? `${100 / quarterDisplay.length}%` : '25%',
                                                  minWidth: '25%' 
                                                }}
                                              />
                                            ))}
                                        </div>
                                      </div>

                                      {/* Team Features Rows */}
                                      {teamFeatures.map((feature: any) => (
                                        <div
                                          key={feature.id}
                                          className="relative h-[100px] border-b border-blue-50 group"
                                          style={{ width: quarterDisplay.length <= 4 ? '100%' : `${quarterDisplay.length * 25}%`, minWidth: 'fit-content' }}
                                        >
                                          {/* Quarter dividers - Rolling View */}
                                          <div className="absolute inset-0 flex">
                                            {quarterDisplay.length > 0 &&
                                              quarterDisplay.map((qItem) => (
                                                <div
                                                  key={`${qItem.quarter}-${qItem.year}-team-div`}
                                                  className="border-r border-blue-100 last:border-r-0"
                                                  style={{ 
                                                    width: quarterDisplay.length <= 4 ? `${100 / quarterDisplay.length}%` : '25%',
                                                    minWidth: '25%' 
                                                  }}
                                                />
                                              ))}
                                          </div>

                                          {/* Continuous feature bar spanning multiple quarters - Teams View */}
                                          <div className="absolute inset-0 flex items-center">
                                            {(() => {
                                              const featureStart = new Date(
                                                feature.startDate
                                              );
                                              const featureEnd = new Date(
                                                feature.endDate
                                              );

                                              // Calculate total story points across all quarters
                                              const totalPlanned =
                                                Object.values(
                                                  feature.quarterlyConsumption as Record<
                                                    string,
                                                    any
                                                  >
                                                ).reduce(
                                                  (sum: number, q: any) =>
                                                    sum +
                                                    (parseInt(q?.planned) || 0),
                                                  0
                                                );

                                              const totalConsumed =
                                                Object.values(
                                                  feature.quarterlyConsumption as Record<
                                                    string,
                                                    any
                                                  >
                                                ).reduce(
                                                  (sum: number, q: any) =>
                                                    sum +
                                                    (parseInt(q?.consumed) ||
                                                      0),
                                                  0
                                                );

                                              if (totalPlanned === 0) {
                                                return quarterDisplay.map(
                                                  (qItem) => (
                                                    <div
                                                      key={`${qItem.quarter}-${qItem.year}`}
                                                      className="flex-1"
                                                    />
                                                  )
                                                );
                                              }

                                              // Calculate which quarters the feature spans based on quarterlyConsumption data
                                              const spannedQuarters =
                                                quarterDisplay.filter(
                                                  (qItem) => {
                                                    const quarterKey = qItem.quarterKey;
                                                    const quarterData = feature.quarterlyConsumption?.[quarterKey];
                                                    // Include quarter if it has planned data
                                                    return quarterData && parseInt(quarterData.planned) > 0;
                                                  }
                                                );

                                              if (
                                                spannedQuarters.length === 0
                                              ) {
                                                return quarterDisplay.map(
                                                  (qItem) => (
                                                    <div
                                                      key={`${qItem.quarter}-${qItem.year}`}
                                                      className="flex-1"
                                                    />
                                                  )
                                                );
                                              }

                                              const firstSpannedIndex =
                                                quarterDisplay.findIndex(
                                                  (q) =>
                                                    q.quarter ===
                                                      spannedQuarters[0]
                                                        .quarter &&
                                                    q.year ===
                                                      spannedQuarters[0].year
                                                );
                                              const lastSpannedIndex =
                                                quarterDisplay.findIndex(
                                                  (q) =>
                                                    q.quarter ===
                                                      spannedQuarters[
                                                        spannedQuarters.length -
                                                          1
                                                      ].quarter &&
                                                    q.year ===
                                                      spannedQuarters[
                                                        spannedQuarters.length -
                                                          1
                                                      ].year
                                                );

                                              const consumedPercentage =
                                                totalPlanned > 0
                                                  ? (totalConsumed /
                                                      totalPlanned) *
                                                    100
                                                  : 0;

                                              // Render bar directly without quarter mapping
                                              return (
                                                        <TooltipProvider>
                                                          <Tooltip>
                                                            <TooltipTrigger
                                                              asChild
                                                            >
                                                              <div
                                                                className="absolute h-full flex items-center justify-center"
                                                                style={{
                                                                  left: quarterDisplay.length <= 4 
                                                                    ? `calc(${(firstSpannedIndex / quarterDisplay.length) * 100}% + 1rem)`
                                                                    : `calc(${firstSpannedIndex * 25}% + 1rem)`,
                                                                  width: quarterDisplay.length <= 4
                                                                    ? `calc(${((lastSpannedIndex - firstSpannedIndex + 1) / quarterDisplay.length) * 100}% - 2rem)`
                                                                    : `calc(${(lastSpannedIndex - firstSpannedIndex + 1) * 25}% - 2rem)`,
                                                                }}
                                                              >
                                                                <div
                                                                  className={`w-full h-full rounded-lg shadow-lg border-2 relative ${
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
                                                                  {totalConsumed >
                                                                    0 && (
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
                                                                  {/* Quarter-wise story points - simple layout */}
                                                                  <div className="absolute inset-0 flex items-center justify-center gap-2 px-2">
                                                                    {quarterDisplay.map(
                                                                      (
                                                                        qDisplayItem,
                                                                        qIndex
                                                                      ) => {
                                                                        const qData =
                                                                          feature
                                                                            .quarterlyConsumption?.[
                                                                            qDisplayItem
                                                                              .quarterKey
                                                                          ];
                                                                        const qPlanned =
                                                                          parseInt(
                                                                            qData?.planned
                                                                          ) ||
                                                                          0;
                                                                        const qConsumed =
                                                                          parseInt(
                                                                            qData?.consumed
                                                                          ) ||
                                                                          0;

                                                                        if (
                                                                          qPlanned ===
                                                                          0
                                                                        )
                                                                          return null;

                                                                        return (
                                                                          <React.Fragment
                                                                            key={
                                                                              qDisplayItem.quarterKey
                                                                            }
                                                                          >
                                                                            <span className="text-xs font-bold text-gray-800 drop-shadow-sm whitespace-nowrap px-2 py-1 bg-white bg-opacity-70 rounded">
                                                                              {
                                                                                qDisplayItem.quarter
                                                                              }{" "}
                                                                              -{" "}
                                                                              {qConsumed >
                                                                              0
                                                                                ? `${qConsumed}/${qPlanned}`
                                                                                : qPlanned}
                                                                              SP
                                                                            </span>
                                                                            {qIndex <
                                                                              quarterDisplay.length -
                                                                                1 &&
                                                                              qIndex <
                                                                                quarterDisplay.filter(
                                                                                  (
                                                                                    q
                                                                                  ) => {
                                                                                    const nextQData =
                                                                                      feature
                                                                                        .quarterlyConsumption?.[
                                                                                        q
                                                                                          .quarterKey
                                                                                      ];
                                                                                    return (
                                                                                      parseInt(
                                                                                        nextQData?.planned
                                                                                      ) >
                                                                                      0
                                                                                    );
                                                                                  }
                                                                                )
                                                                                  .length -
                                                                                  1 && (
                                                                                <span className="text-gray-400 text-xs">
                                                                                  |
                                                                                </span>
                                                                              )}
                                                                          </React.Fragment>
                                                                        );
                                                                      }
                                                                    )}
                                                                  </div>

                                                                  {/* Total story points at the bottom */}
                                                                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black bg-opacity-20 text-white text-xs font-bold py-1 rounded-b-lg">
                                                                    Total:{" "}
                                                                    {totalConsumed >
                                                                    0
                                                                      ? `${totalConsumed}/${totalPlanned}`
                                                                      : totalPlanned}{" "}
                                                                    SP
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                              <div className="text-sm">
                                                                <p className="font-semibold">
                                                                  {feature.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mb-1">
                                                                  {featureStart.toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                      month:
                                                                        "short",
                                                                      day: "numeric",
                                                                      year: "numeric",
                                                                    }
                                                                  )}{" "}
                                                                  -{" "}
                                                                  {featureEnd.toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                      month:
                                                                        "short",
                                                                      day: "numeric",
                                                                      year: "numeric",
                                                                    }
                                                                  )}
                                                                </p>
                                                                <p>
                                                                  Total:{" "}
                                                                  {totalConsumed >
                                                                  0
                                                                    ? `${totalConsumed}/${totalPlanned}`
                                                                    : totalPlanned}{" "}
                                                                  SP
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
                                              );
                                            })()}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                );
              })()
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>
                  No prediction data available. Please submit a form to see the
                  timeline.
                </p>
              </div>
            )}

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

        {/* API Response Display */}
        {predictionData && (
          <Card className="bg-white border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl mb-8 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <span className="text-green-900">Prediction Response</span>
                <div className="ml-auto">
                  <Button
                    onClick={clearData}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 border-red-300"
                  >
                    Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(predictionData, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Dialog */}
        <Dialog
          open={isRecommendationOpen}
          onOpenChange={setIsRecommendationOpen}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <span>Project Recommendations</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Risk Assessment */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800">
                    Risk Assessment
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">
                      High Priority Risks
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-red-600">
                      <li>
                        SAML configuration complexities may cause integration
                        delays
                      </li>
                      <li>
                        Jakarta EE migration involves high uncertainty (60%
                        accuracy)
                      </li>
                      <li>
                        Library incompatibility issues could impact timeline
                      </li>
                      <li>Security vulnerabilities in SSO implementation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">
                      Medium Priority Risks
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-red-600">
                      <li>API compatibility issues with Microsoft Teams</li>
                      <li>
                        Code refactoring complexity in Jakarta EE migration
                      </li>
                      <li>Performance degradation during migration</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Key Assumptions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">
                    Key Assumptions
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">
                      Technical Assumptions
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                      <li>
                        Existing SAML infrastructure is fully functional and
                        documented
                      </li>
                      <li>
                        Microsoft Teams API access and permissions are available
                      </li>
                      <li>
                        Current team has sufficient Jakarta EE 10 expertise
                      </li>
                      <li>
                        Database schemas are compatible with new library
                        versions
                      </li>
                      <li>
                        Development and testing environments support Jakarta EE
                        10
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">
                      Resource Assumptions
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                      <li>
                        Team composition remains stable throughout project
                        duration
                      </li>
                      <li>
                        Required licenses and tools will be available on time
                      </li>
                      <li>
                        External dependencies (Microsoft, third-party libraries)
                        remain stable
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">
                    Strategic Recommendations
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">
                      Immediate Actions (Week 1-2)
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-green-600">
                      <li>
                        Conduct detailed technical assessment of existing SAML
                        infrastructure
                      </li>
                      <li>
                        Create proof-of-concept for Jakarta EE 10 migration
                      </li>
                      <li>
                        Set up dedicated development environment for migration
                        testing
                      </li>
                      <li>
                        Schedule knowledge transfer sessions on Jakarta EE 10
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">
                      Risk Mitigation (Week 2-4)
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-green-600">
                      <li>
                        Implement phased migration approach with rollback
                        capability
                      </li>
                      <li>
                        Add 20% buffer time for complex integration challenges
                      </li>
                      <li>
                        Schedule security review sessions for SSO implementation
                      </li>
                      <li>
                        Create comprehensive test coverage before migration
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">
                      Quality Assurance
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-green-600">
                      <li>Implement automated testing for both features</li>
                      <li>
                        Schedule regular code reviews with architecture team
                      </li>
                      <li>Plan performance testing at each major milestone</li>
                      <li>Document all configuration changes and decisions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Project Health Indicators */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-800">
                    Project Health Indicators
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-amber-700 mb-2">
                      Current Status
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-amber-600">
                          Overall Risk Level:
                        </span>
                        <span className="font-semibold text-red-600">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600">
                          Estimation Confidence:
                        </span>
                        <span className="font-semibold text-amber-600">
                          67.5%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600">
                          Buffer Allocation:
                        </span>
                        <span className="font-semibold text-green-600">
                          25%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-700 mb-2">
                      Success Factors
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-amber-600 text-sm">
                      <li>Strong team expertise in core technologies</li>
                      <li>Existing SAML infrastructure foundation</li>
                      <li>Comprehensive testing strategy planned</li>
                      <li>Dedicated architecture support available</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
