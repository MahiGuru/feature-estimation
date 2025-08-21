"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Eye, BarChart3, Filter, Search, Plus } from "lucide-react";
import { usePredictionStore } from "@/lib/store";

interface Feature {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  storyPoints: number;
  assignedTo: string;
  sprint: string;
  progress: number;
  startDate: string;
  endDate: string;
  dependencies: string[];
  tags: string[];
}

export default function FeatureTracker() {
  const { predictionData } = usePredictionStore();
  
  // Load features from Zustand store and normalize status values
  const loadFeatures = () => {
    if (!predictionData || !predictionData.features) return [];
    return predictionData.features.map((feature: any) => ({
      ...feature,
      // Map status values to match Feature Tracker expectations
      status:
        feature.status === "in-progress"
          ? "progress"
          : feature.status === "planned"
          ? "new"
          : feature.status,
    }));
  };

  const [features, setFeatures] = useState<Feature[]>(loadFeatures());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const filteredFeatures = features.filter((feature) => {
    const matchesSearch =
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || feature.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || feature.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      new: "feature-status-new",
      progress: "feature-status-progress",
      completed: "feature-status-completed",
      blocked: "feature-status-blocked",
    };

    return (
      <Badge
        className={`${
          statusClasses[status as keyof typeof statusClasses]
        } px-3 py-1 text-xs font-medium rounded-full`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge
        className={`${
          priorityClasses[priority as keyof typeof priorityClasses]
        } px-2 py-1 text-xs rounded-full border`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handleEditFeature = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsEditMode(true);
  };

  const handleViewFeature = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsEditMode(false);
  };

  const handleSaveFeature = () => {
    if (selectedFeature) {
      setFeatures(
        features.map((f) => (f.id === selectedFeature.id ? selectedFeature : f))
      );
      setSelectedFeature(null);
      setIsEditMode(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Feature Tracker</h2>
          <p className="text-blue-600">
            Track and manage project features with detailed insights
          </p>
        </div>
        <Button className="gradient-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {/* Filters */}
      <Card className="professional-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-800">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
                <Input
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-800">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">Planned</SelectItem>
                  <SelectItem value="progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-800">
                Priority
              </Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-800">
                Actions
              </Label>
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Table */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Features Overview</span>
            <Badge className="bg-blue-100 text-blue-800 ml-2">
              {filteredFeatures.length} features
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-blue-100">
                  <th className="text-left p-4 font-semibold text-blue-900">
                    Feature
                  </th>
                  <th className="text-left p-4 font-semibold text-blue-900">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold text-blue-900">
                    Priority
                  </th>
                  <th className="text-left p-4 font-semibold text-blue-900">
                    Progress
                  </th>
                  <th className="text-left p-4 font-semibold text-blue-900">
                    Story Points
                  </th>
                  <th className="text-left p-4 font-semibold text-blue-900">
                    Assigned To
                  </th>
                  <th className="text-left p-4 font-semibold text-blue-900">
                    Sprint
                  </th>
                  <th className="text-left p-4 font-semibold text-blue-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFeatures.map((feature) => (
                  <tr
                    key={feature.id}
                    className="table-row-hover border-b border-blue-50"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-blue-900">
                          {feature.name}
                        </div>
                        <div className="text-sm text-blue-600 truncate max-w-xs">
                          {feature.description}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(feature.status)}</td>
                    <td className="p-4">
                      {getPriorityBadge(feature.priority)}
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <Progress value={feature.progress} className="w-20" />
                        <span className="text-xs text-blue-600">
                          {feature.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200">
                        {feature.storyPoints} SP
                      </Badge>
                    </td>
                    <td className="p-4 text-blue-700">{feature.assignedTo}</td>
                    <td className="p-4 text-blue-700">{feature.sprint}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleViewFeature(feature)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-blue-900">
                                {isEditMode
                                  ? "Edit Feature"
                                  : "Feature Details"}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedFeature && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-blue-800">
                                      Feature Name
                                    </Label>
                                    {isEditMode ? (
                                      <Input
                                        value={selectedFeature.name}
                                        onChange={(e) =>
                                          setSelectedFeature({
                                            ...selectedFeature,
                                            name: e.target.value,
                                          })
                                        }
                                        className="border-blue-200"
                                      />
                                    ) : (
                                      <p className="text-blue-700">
                                        {selectedFeature.name}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-blue-800">
                                      Assigned To
                                    </Label>
                                    {isEditMode ? (
                                      <Input
                                        value={selectedFeature.assignedTo}
                                        onChange={(e) =>
                                          setSelectedFeature({
                                            ...selectedFeature,
                                            assignedTo: e.target.value,
                                          })
                                        }
                                        className="border-blue-200"
                                      />
                                    ) : (
                                      <p className="text-blue-700">
                                        {selectedFeature.assignedTo}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-blue-800">
                                    Description
                                  </Label>
                                  {isEditMode ? (
                                    <Textarea
                                      value={selectedFeature.description}
                                      onChange={(e) =>
                                        setSelectedFeature({
                                          ...selectedFeature,
                                          description: e.target.value,
                                        })
                                      }
                                      className="border-blue-200"
                                    />
                                  ) : (
                                    <p className="text-blue-700">
                                      {selectedFeature.description}
                                    </p>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-blue-800">
                                      Status
                                    </Label>
                                    {isEditMode ? (
                                      <Select
                                        value={selectedFeature.status}
                                        onValueChange={(value) =>
                                          setSelectedFeature({
                                            ...selectedFeature,
                                            status: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger className="border-blue-200">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="new">
                                            Planned
                                          </SelectItem>
                                          <SelectItem value="progress">
                                            In Progress
                                          </SelectItem>
                                          <SelectItem value="completed">
                                            Completed
                                          </SelectItem>
                                          <SelectItem value="blocked">
                                            Blocked
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      getStatusBadge(selectedFeature.status)
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-blue-800">
                                      Priority
                                    </Label>
                                    {isEditMode ? (
                                      <Select
                                        value={selectedFeature.priority}
                                        onValueChange={(value) =>
                                          setSelectedFeature({
                                            ...selectedFeature,
                                            priority: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger className="border-blue-200">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="high">
                                            High
                                          </SelectItem>
                                          <SelectItem value="medium">
                                            Medium
                                          </SelectItem>
                                          <SelectItem value="low">
                                            Low
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      getPriorityBadge(selectedFeature.priority)
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-blue-800">
                                      Story Points
                                    </Label>
                                    {isEditMode ? (
                                      <Input
                                        type="number"
                                        value={selectedFeature.storyPoints}
                                        onChange={(e) =>
                                          setSelectedFeature({
                                            ...selectedFeature,
                                            storyPoints: Number(e.target.value),
                                          })
                                        }
                                        className="border-blue-200"
                                      />
                                    ) : (
                                      <p className="text-blue-700">
                                        {selectedFeature.storyPoints} SP
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-blue-800">Tags</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedFeature.tags.map((tag, index) => (
                                      <Badge
                                        key={index}
                                        className="bg-blue-100 text-blue-800 border border-blue-200"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                {isEditMode && (
                                  <div className="flex space-x-2 pt-4">
                                    <Button
                                      onClick={handleSaveFeature}
                                      className="gradient-button"
                                    >
                                      Save Changes
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedFeature(null);
                                        setIsEditMode(false);
                                      }}
                                      className="border-blue-200 text-blue-600"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEditFeature(feature)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
