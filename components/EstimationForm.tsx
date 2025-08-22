"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  Plus,
  X,
  Sparkles,
  Users,
  Clock,
  Target,
  Zap,
  FileText,
  Settings,
  TrendingUp,
  Lightbulb,
  Upload,
  GitBranch,
  Info,
} from "lucide-react";
import { TeamMember, FeatureItem } from "@/lib/types";
import { PREDEFINED_EPICS, PREDEFINED_FEATURES } from "@/lib/estimationData";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { jiraService, JiraIssue } from "@/lib/jiraService";
import { JiraConfigDialog } from "./JiraConfigDialog";
import { JiraImportDialog } from "./JiraImportDialog";
import { JiraAutocomplete } from "./JiraAutocomplete";
import { usePredictionStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

export default function EstimationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const {
    setPredictionData,
    setLoading,
    setError,
    isLoading,
    error: storeError,
  } = usePredictionStore();
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureItem[]>([
    {
      name: "MSTeams SSO Integration",
      description: "Single Sign-On integration with Microsoft Teams",
      epic: "User Authentication",
      startDate: "2024-01-01",
      tshirtsize: "M",
      referenceAttachements: [],
    },
    {
      name: "Jakartha EE Migration",
      description: "Migrate application to Jakarta EE 10",
      epic: "Infrastructure Upgrade",
      startDate: "2024-02-01",
      tshirtsize: "L",
      referenceAttachements: [],
    },
    {
      name: "Angular 20 Upgrade",
      description: "Upgrade Angular to version 20",
      epic: "Frontend Modernization",
      startDate: "2024-03-01",
      tshirtsize: "XL",
      referenceAttachements: [],
    },
  ]);
  const [customFeature, setCustomFeature] = useState("");
  const [customFeatureDescription, setCustomFeatureDescription] = useState("");
  const [featureStartDate, setFeatureStartDate] = useState("");
  const [featureEndDate, setFeatureEndDate] = useState("");
  const [featureTshirtSize, setFeatureTshirtSize] = useState("");
  const [featureFiles, setFeatureFiles] = useState<File[]>([]);
  const [detailedFeatureName, setDetailedFeatureName] = useState("");
  const [detailedFeatureDescription, setDetailedFeatureDescription] =
    useState("");
  const [detailedFeatureEpic, setDetailedFeatureEpic] = useState("");
  const [sprintSize, setSprintSize] = useState<number>(2);
  const [teamMembers, setTeamMembers] = useState<TeamMember>({
    developers: 5,
    qa: 2,
    po: 1,
    ba: 1,
    managers: 1,
    deliveryManagers: 2,
    architects: 1,
  });
  const [sprintVelocity, setSprintVelocity] = useState<number>(20);
  const [dependencies, setDependencies] = useState(
    "Dependencies of stories and extttt"
  );
  const [customNotes, setCustomNotes] = useState("notes description hrere");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; features: string[]; file?: File }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [tshirtSize, setTshirtSize] = useState<string>("XL");
  const [showJiraConfig, setShowJiraConfig] = useState(false);
  const [showJiraImport, setShowJiraImport] = useState(false);
  const [isJiraConfigured, setIsJiraConfigured] = useState(false);
  const [jiraEpics, setJiraEpics] = useState<JiraIssue[]>([]);
  const [isLoadingEpics, setIsLoadingEpics] = useState(false);
  const [selectValue, setSelectValue] = useState<string>("");
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Function to completely reset form data
  // Handle retry functionality
  const handleRetry = () => {
    setError(null);
    handleSubmitForm();
  };

  // Handle back to form functionality
  const handleBackToForm = () => {
    setError(null);
    setLoading(false);
    setIsSubmitting(false);
  };

  const resetFormData = () => {
    setSelectedFeatures([]);
    setCustomFeature("");
    setCustomFeatureDescription("");
    setUploadedFiles([]);
    setSelectValue("");
    setApiResponse(null);
    localStorage.removeItem("apiResponse");
    toast({
      title: "Form Reset",
      description: "All form data and uploaded files have been cleared",
    });
  };

  useEffect(() => {
    // Check if JIRA is configured
    const configured = jiraService.isConfigured();
    setIsJiraConfigured(configured);

    // Clear any existing error state when component mounts
    setError(null);

    // Load JIRA epics if configured
    if (configured) {
      loadJiraEpics();
    }
  }, [setError]);

  const loadJiraEpics = async () => {
    setIsLoadingEpics(true);
    try {
      const epics = await jiraService.getEpics();
      setJiraEpics(epics);
    } catch (error) {
      console.error("Failed to load JIRA epics:", error);
    } finally {
      setIsLoadingEpics(false);
    }
  };

  const addFeature = (
    feature: string,
    description?: string,
    additionalData?: {
      epic?: string;
      startDate?: string;
      endDate?: string;
      tshirtSize?: string;
      files?: File[];
    }
  ) => {
    if (!feature || feature.trim() === "") return;

    const trimmedFeature = feature.trim();
    const trimmedDescription = (description || "").trim();

    // Maximum features limit (optional - you can adjust or remove this)
    const MAX_FEATURES = 50;
    if (selectedFeatures.length >= MAX_FEATURES) {
      toast({
        title: "Feature Limit Reached",
        description: `Maximum of ${MAX_FEATURES} features allowed`,
        variant: "destructive",
      });
      return;
    }

    // Check if the feature is an Epic
    const featureIsEpic = isEpic(trimmedFeature);
    const newFeatureObj = {
      name: trimmedFeature,
      description: trimmedDescription,
      tshirtsize: additionalData?.tshirtSize || "",
      epic: additionalData?.epic || "",
      startDate: additionalData?.startDate || "",
      endDate: additionalData?.endDate || "",
      referenceAttachements: additionalData?.files || [],
    };

    if (featureIsEpic) {
      const existingEpic = getSelectedEpic();

      // If it's the same epic, don't add it again
      if (existingEpic === trimmedFeature) {
        console.log("Epic already selected:", trimmedFeature);
        return;
      }

      // Remove any existing epics and add the new one
      setSelectedFeatures((prev) => {
        const filteredFeatures = prev.filter((f) => !isEpic(f.name));
        console.log("Replacing epic. Previous features:", filteredFeatures);
        return [...filteredFeatures, newFeatureObj];
      });

      // Show toast notification about Epic replacement
      if (existingEpic && existingEpic !== trimmedFeature) {
        toast({
          title: "Epic Replaced",
          description: `"${existingEpic}" has been replaced with "${trimmedFeature}"`,
        });
      } else if (!existingEpic) {
        toast({
          title: "Epic Selected",
          description: `Epic "${trimmedFeature}" has been selected`,
        });
      }
    } else {
      // For regular features, use functional update to ensure we have latest state
      setSelectedFeatures((prev) => {
        // Check if feature already exists
        if (prev.some((f) => f.name === trimmedFeature)) {
          console.log("Feature already exists:", trimmedFeature);
          toast({
            title: "Feature Already Added",
            description: `"${trimmedFeature}" is already in your list`,
            variant: "default",
          });
          return prev; // Return unchanged array
        }

        console.log("Adding new feature:", newFeatureObj);
        return [...prev, newFeatureObj];
      });
    }

    // Clear the input fields after adding
    setCustomFeature("");
    setCustomFeatureDescription("");
  };

  const clearFeatureForm = () => {
    setDetailedFeatureName("");
    setDetailedFeatureDescription("");
    setDetailedFeatureEpic("");
    setFeatureStartDate("");
    setFeatureEndDate("");
    setFeatureTshirtSize("");
    setFeatureFiles([]);
  };

  const removeFeature = (feature: string) => {
    setSelectedFeatures(selectedFeatures.filter((f) => f.name !== feature));
  };

  const handleJiraImport = (features: string[]) => {
    const newFeatureObjs = features
      .filter((f) => !selectedFeatures.some((selected) => selected.name === f))
      .map((f) => ({ name: f, description: "" }));
    setSelectedFeatures([...selectedFeatures, ...newFeatureObjs]);
  };

  const handleJiraConfigured = () => {
    setIsJiraConfigured(true);
    loadJiraEpics();
    toast({
      title: "JIRA Connected",
      description:
        "JIRA integration configured successfully. Epics are now available in the dropdown.",
    });
  };

  const isEpic = (item: string) => {
    if (!item) return false;

    // Check if it's a JIRA epic pattern
    const isJiraEpic = /\[EPIC-\d+\]/.test(item);

    // Check if it matches any loaded JIRA epics
    const matchesJiraEpic = jiraEpics.some(
      (epic) => jiraService.formatIssueAsFeature(epic) === item
    );

    // Check if it's in predefined epics
    const isPredefinedEpic = PREDEFINED_EPICS.includes(item);

    const result = isJiraEpic || matchesJiraEpic || isPredefinedEpic;

    return result;
  };

  const getSelectedEpic = () => {
    const epic = selectedFeatures.find((f) => isEpic(f.name));
    return epic?.name || null;
  };

  const processFile = (
    file: File,
    onProcessed: (
      newFeatures: string[],
      fileName: string,
      fileObject: File
    ) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        }) as string[][];

        // Assuming first column contains features, starting from row 2 (skipping header)
        const uploadedFeatures = jsonData
          .slice(1)
          .map((row) => row[0]?.trim())
          .filter((f) => {
            // Filter out invalid entries
            if (!f || typeof f !== "string") return false;
            if (f.length > 200) return false; // Skip overly long entries
            if (f.length < 3) return false; // Skip very short entries
            return true;
          });

        console.log(
          `Processing file ${file.name}: found ${uploadedFeatures.length} features`
        );

        // Limit the number of features from each file to prevent overload
        const MAX_FEATURES_PER_FILE = 50;
        const limitedFeatures = uploadedFeatures.slice(
          0,
          MAX_FEATURES_PER_FILE
        );

        if (uploadedFeatures.length > MAX_FEATURES_PER_FILE) {
          console.warn(
            `File ${file.name} contained ${uploadedFeatures.length} features, limiting to ${MAX_FEATURES_PER_FILE}`
          );
          toast({
            title: "Features Limited",
            description: `File ${file.name} contained too many features. Only the first ${MAX_FEATURES_PER_FILE} were added.`,
            variant: "default",
          });
        }

        // Get unique new features
        const newFeatures = limitedFeatures.filter(
          (f) => f && !selectedFeatures.some((selected) => selected.name === f)
        );

        onProcessed(newFeatures, file.name, file);
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to parse ${file.name}`,
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFiles = (files: FileList) => {
    if (!files || files.length === 0) return;

    let processedCount = 0;
    let totalFeaturesFound = 0;

    Array.from(files).forEach((file) => {
      processFile(file, (newFeatures, fileName, fileObject) => {
        if (newFeatures.length > 0) {
          // Store file details including the actual File object
          setUploadedFiles((prev) => [
            ...prev,
            { name: fileName, features: newFeatures, file: fileObject },
          ]);
          totalFeaturesFound += newFeatures.length;

          console.log(
            `File ${fileName} processed: ${newFeatures.length} features found but not added to form`
          );
        }

        processedCount++;
        if (processedCount === files.length) {
          if (totalFeaturesFound > 0) {
            toast({
              title: "File Uploaded Successfully",
              description: `${totalFeaturesFound} features found in ${files.length} Excel sheet(s). File details will be included in submission.`,
            });
          } else {
            toast({
              title: "File Uploaded",
              description:
                "Excel sheet(s) uploaded but no valid features found",
            });
          }
        }
      });
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files!);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleReupload = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // First remove old file's features
    removeUploadedFile(index);

    // Then process new file
    processFile(file, (newFeatures, fileName) => {
      if (newFeatures.length > 0) {
        const newFeatureObjects = newFeatures.map((f) => ({
          name: f,
          description: "",
        }));
        setSelectedFeatures((prev) => [...prev, ...newFeatureObjects]);
        setUploadedFiles((prev) => {
          const newList = [...prev];
          newList.splice(index, 0, { name: fileName, features: newFeatures });
          return newList;
        });
        toast({
          title: "Success",
          description: `${newFeatures.length} features added from reuploaded file`,
        });
      } else {
        toast({
          title: "Info",
          description: "No new features found in the reuploaded file",
        });
      }
    });
  };

  const removeUploadedFile = (index: number) => {
    const file = uploadedFiles[index];
    console.log(`Removing uploaded file: ${file.name}`);

    // Only remove the file from uploadedFiles, don't touch selectedFeatures
    // since uploaded files no longer automatically add features to the form
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

    toast({
      title: "File Removed",
      description: `${file.name} has been removed from uploads`,
    });
  };

  const updateTeamMember = (role: keyof TeamMember, value: number) => {
    setTeamMembers((prev) => ({
      ...prev,
      [role]: value,
    }));
  };

  const handleSubmitForm = async () => {
    if (selectedFeatures.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one feature",
        variant: "destructive",
      });
      return;
    }

    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Total selectedFeatures count:", selectedFeatures.length);
    console.log("Raw selectedFeatures:", selectedFeatures);

    // Clean and validate selectedFeatures - only include valid, user-added features
    const validFeatures = selectedFeatures.filter((f) => {
      // Must have a valid name
      if (!f.name || typeof f.name !== "string" || f.name.trim() === "") {
        console.warn("Filtering out invalid feature:", f);
        return false;
      }

      // Must not be extremely long (likely corrupted data)
      if (f.name.length > 200) {
        console.warn(
          "Filtering out overly long feature:",
          f.name.substring(0, 50) + "..."
        );
        return false;
      }

      return true;
    });

    console.log("Valid features after filtering:", validFeatures.length);
    console.log("Valid features:", validFeatures);

    // Get the selected epic (if any) from valid features
    const epicFeature = validFeatures.find((f) => isEpic(f.name));
    const selectedEpic = epicFeature?.name || null;

    // Extract only actual features (exclude epics) with name and description
    const featuresData = validFeatures
      .filter((f) => !isEpic(f.name))
      .map((f) => ({
        name: f.name.trim(),
        description: (f.description || "").trim(),
      }));

    console.log("Final features to send:", featuresData);
    console.log("Selected epic:", selectedEpic);

    // Validate that we have at least one feature (not just an epic)
    if (featuresData.length === 0 && selectedEpic) {
      toast({
        title: "Error",
        description:
          "Please select at least one feature in addition to the epic",
        variant: "destructive",
      });
      return;
    }

    if (featuresData.length === 0 && !selectedEpic) {
      toast({
        title: "Error",
        description: "No valid features found to submit",
        variant: "destructive",
      });
      return;
    }

    // Immediately show overlay before starting submission
    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      // Add a minimum delay to ensure loading screen is visible
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Prepare request data in the specified format
      const requestData = {
        features: featuresData, // Only valid user-selected features
        epics: selectedEpic ? { epic1: selectedEpic } : {},
        tShirtSizing: tshirtSize || "M",
        oldReferenceSheet: uploadedFiles.map((file) => ({
          fileName: file.name,
          features: file.features,
          uploadedAt: new Date().toISOString(),
        })),
        dependencies: dependencies || "",
        sprintConfiguration: {
          duration: sprintSize,
          velocity: sprintVelocity,
        },
        teamComposition: {
          developers: teamMembers.developers,
          qa: teamMembers.qa,
          po: teamMembers.po,
          ba: teamMembers.ba,
          managers: teamMembers.managers,
          deliveryManagers: teamMembers.deliveryManagers,
          architects: teamMembers.architects,
        },
        additionalNotes: customNotes || "",
      };

      // Prepare excel file details
      const excelDetails = uploadedFiles.map((file) => ({
        name: file.name,
        features: file.features,
        uploadedAt: new Date().toISOString(),
      }));

      // Create FormData
      const formData = new FormData();

      // Add payload as JSON string
      formData.append("payload", JSON.stringify(requestData));

      // Add excel details as JSON string
      // formData.append("excel", JSON.stringify(excelDetails));

      // Add actual Excel files
      uploadedFiles.forEach((uploadedFile, index) => {
        if (uploadedFile.file) {
          formData.append(`excel`, uploadedFile.file, uploadedFile.name);
        }
      });

      console.log("=== FINAL PAYLOAD ===");
      console.log("Features count:", requestData.features.length);
      console.log("Request Data:", requestData);
      console.log("Excel Details:", excelDetails);
      console.log("Uploaded Files Count:", uploadedFiles.length);
      console.log("FormData entries:");
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (typeof value === "string") {
          try {
            console.log(`${key}:`, JSON.parse(value));
          } catch {
            console.log(`${key}:`, value);
          }
        } else if (value instanceof File) {
          console.log(`${key}:`, `File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      });

      // Call external API directly
      const response = await fetch(
        "http://localhost:8080/api/predict-new-feature",
        {
          method: "POST",
          body: formData, // No Content-Type header needed for FormData
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server responded with status ${response.status}. Please check if the API server is running.`
        );
      }

      const data = await response.json();

      // Store in Zustand store
      setPredictionData(data);
      setApiResponse(data);

      toast({
        title: "Success",
        description: "Form submitted successfully! Redirecting to dashboard...",
      });

      // Navigate to dashboard after a short delay to show completion
      setTimeout(() => {
        setLoading(false);
        setIsSubmitting(false);
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      let errorMessage = "Failed to submit form";

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          errorMessage =
            "Cannot connect to the API server. Please ensure the server is running on http://localhost:8080";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      // Keep loading state true to show error overlay
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // Only clear isSubmitting here, keep loading for the overlay
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Loading Screen Overlay - Moved outside the relative container */}
      <LoadingScreen
        isLoading={isLoading}
        error={storeError}
        onRetry={handleRetry}
        onBackToForm={handleBackToForm}
      />
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Features & Dependencies Card */}
      <Card className="professional-card hover-lift">
        <CardHeader>
          <CardTitle className="section-header">
            <div className="icon-wrapper bg-gradient-to-br from-blue-100 to-blue-200 floating-animation">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span>Features & Dependencies</span>
            <div className="ml-auto">
              <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                {selectedFeatures.length} selected
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="form-section">
          <div className="space-y-6">
            <div className="form-label flex items-center justify-between">
              {isJiraConfigured && (
                <Badge className="bg-purple-100 text-purple-700 border border-purple-200 text-xs">
                  <GitBranch className="w-3 h-3 mr-1" />
                  JIRA Connected
                </Badge>
              )}
            </div>
            <div className="space-y-4">
              <div>
                {/* Enhanced Feature Addition Section */}
                <div className="border border-green-200 rounded-xl p-6 mt-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Plus className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">
                        Add Feature
                      </h3>
                      <p className="text-sm text-green-700">
                        Add a feature with epic and detailed description and
                        supporting documents
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Feature Name */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Feature Name *
                        </Label>
                        <Input
                          value={detailedFeatureName}
                          onChange={(e) =>
                            setDetailedFeatureName(e.target.value)
                          }
                          placeholder="Enter feature name (e.g., User Authentication System)"
                          className="form-input"
                        />
                      </div>

                      {/* Feature Description */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Feature Description
                        </Label>
                        <Textarea
                          value={detailedFeatureDescription}
                          onChange={(e) =>
                            setDetailedFeatureDescription(e.target.value)
                          }
                          placeholder="Detailed description of the feature, requirements, and acceptance criteria..."
                          className="form-input min-h-[120px] resize-none"
                          rows={5}
                        />
                      </div>

                      {/* Epic Input */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Choose Epic
                        </Label>
                        <Select
                          value={detailedFeatureEpic}
                          onValueChange={setDetailedFeatureEpic}
                        >
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select or enter related epic" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                              Predefined Epics
                            </div>
                            {PREDEFINED_EPICS.map((epic) => (
                              <SelectItem key={epic} value={epic}>
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                                    Epic
                                  </Badge>
                                  <span>{epic}</span>
                                </div>
                              </SelectItem>
                            ))}

                            {jiraEpics.length > 0 && (
                              <>
                                <div className="my-2 border-t" />
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 flex items-center space-x-1">
                                  <GitBranch className="w-3 h-3" />
                                  <span>JIRA Epics</span>
                                </div>
                                {jiraEpics.map((epic) => (
                                  <SelectItem
                                    key={epic.key}
                                    value={jiraService.formatIssueAsFeature(
                                      epic
                                    )}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                                        {epic.key}
                                      </Badge>
                                      <span className="truncate">
                                        {epic.fields.summary}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* T-Shirt Size */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          T-Shirt Size Estimation (Optional)
                        </Label>
                        <Select
                          value={featureTshirtSize}
                          onValueChange={setFeatureTshirtSize}
                        >
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select size estimation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="XS">
                              XS - Very Small (1-2 days)
                            </SelectItem>
                            <SelectItem value="S">
                              S - Small (3-5 days)
                            </SelectItem>
                            <SelectItem value="M">
                              M - Medium (1-2 weeks)
                            </SelectItem>
                            <SelectItem value="L">
                              L - Large (2-4 weeks)
                            </SelectItem>
                            <SelectItem value="XL">
                              XL - Extra Large (1-2 months)
                            </SelectItem>
                            <SelectItem value="XXL">
                              XXL - Epic (2+ months)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Start Date */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Planned Start Date
                        </Label>
                        <Input
                          type="date"
                          value={featureStartDate}
                          onChange={(e) => setFeatureStartDate(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      {/* End Date */}
                      {/* <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Planned End Date
                        </Label>
                        <Input
                          type="date"
                          value={featureEndDate}
                          onChange={(e) => setFeatureEndDate(e.target.value)}
                          className="form-input"
                          min={featureStartDate}
                        />
                      </div> */}

                      {/* File Upload */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Supporting Documents
                        </Label>
                        <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setFeatureFiles(files);
                            }}
                            className="hidden"
                            id="feature-files"
                          />
                          <label
                            htmlFor="feature-files"
                            className="cursor-pointer"
                          >
                            <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Upload HLD, PRD, or estimation documents
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, DOC, TXT, MD, Excel files
                            </p>
                          </label>
                        </div>
                        {featureFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {featureFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-sm text-gray-600"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="truncate">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setFeatureFiles((files) =>
                                      files.filter((_, i) => i !== index)
                                    );
                                  }}
                                  className="h-auto p-1 text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-green-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFeatureForm}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Form
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        if (detailedFeatureName.trim()) {
                          addFeature(
                            detailedFeatureName.trim(),
                            detailedFeatureDescription.trim() || undefined,
                            {
                              epic: detailedFeatureEpic,
                              startDate: featureStartDate,
                              endDate: featureEndDate,
                              tshirtSize: featureTshirtSize,
                              files: featureFiles,
                            }
                          );
                          clearFeatureForm();
                          toast({
                            title: "Feature Added",
                            description: `"${detailedFeatureName.trim()}" has been added to your feature list`,
                          });
                        }
                      }}
                      disabled={!detailedFeatureName.trim()}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>

                  {selectedFeatures.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-700">
                            Selected Items ({selectedFeatures.length})
                          </div>
                          {selectedFeatures.length > 100 && (
                            <Badge variant="destructive" className="text-xs">
                              Too Many ({selectedFeatures.length})
                            </Badge>
                          )}
                          {selectedFeatures.length > 20 &&
                            selectedFeatures.length <= 100 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-orange-300 text-orange-600"
                              >
                                High Count ({selectedFeatures.length})
                              </Badge>
                            )}
                        </div>
                        <div className="flex space-x-2">
                          {selectedFeatures.length > 50 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={resetFormData}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reset Form
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFeatures([]);
                              setSelectValue("");
                              toast({
                                title: "Cleared",
                                description: "All features have been removed",
                              });
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Clear All
                          </Button>
                        </div>
                      </div>

                      {/* Epics Section */}
                      {selectedFeatures.some((f) => isEpic(f.name)) && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-purple-600 text-white text-xs font-semibold">
                              Epics
                            </Badge>
                            <span className="text-xs text-gray-600">
                              (
                              {
                                selectedFeatures.filter((f) => isEpic(f.name))
                                  .length
                              }
                              )
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {selectedFeatures
                              .filter((f) => isEpic(f.name))
                              .map((epic, index) => (
                                <li
                                  key={`epic-${epic.name}-${index}`}
                                  className="flex items-center justify-between p-3 rounded border-2 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300 hover:border-purple-400 shadow-sm transition-colors"
                                >
                                  <div className="flex items-center flex-1 mr-2">
                                    <span className="text-sm text-purple-800 font-medium">
                                      {epic.name}
                                    </span>
                                    {epic.description && (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0 ml-2 text-purple-600 hover:text-purple-800"
                                          >
                                            <Info className="w-3 h-3" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                          <div className="space-y-2">
                                            <h4 className="font-semibold text-sm">
                                              {epic.name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                              {epic.description}
                                            </p>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    onClick={() => removeFeature(epic.name)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Features Section */}
                      {selectedFeatures.some((f) => !isEpic(f.name)) && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-blue-600 text-white text-xs font-semibold">
                              Features
                            </Badge>
                            <span className="text-xs text-gray-600">
                              (
                              {
                                selectedFeatures.filter((f) => !isEpic(f.name))
                                  .length
                              }
                              )
                            </span>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            <ul className="space-y-2">
                              {selectedFeatures
                                .filter((f) => !isEpic(f.name))
                                .map((featureObj, index) => (
                                  <li
                                    key={`feature-${featureObj.name}-${index}`}
                                    className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 space-y-2">
                                        {/* Feature Name */}
                                        <div className="font-semibold text-gray-900 text-sm">
                                          {featureObj.name}
                                        </div>

                                        {/* Feature Description - 2 lines with ellipsis */}
                                        {featureObj.description && (
                                          <div className="text-sm text-gray-600 leading-5">
                                            <div
                                              className="line-clamp-2 overflow-hidden"
                                              style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                              }}
                                            >
                                              {featureObj.description}
                                            </div>
                                            {featureObj.description.length >
                                              100 && (
                                              <Button
                                                variant="link"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-800 text-xs mt-1 p-0 h-auto font-normal"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  // Toggle full description display
                                                  const button =
                                                    e.target as HTMLButtonElement;
                                                  const target =
                                                    button.previousElementSibling as HTMLElement;
                                                  if (
                                                    target?.style
                                                      .webkitLineClamp === "2"
                                                  ) {
                                                    target.style.webkitLineClamp =
                                                      "none";
                                                    button.textContent =
                                                      "Show less";
                                                  } else if (target) {
                                                    target.style.webkitLineClamp =
                                                      "2";
                                                    button.textContent = "More";
                                                  }
                                                }}
                                              >
                                                More
                                              </Button>
                                            )}
                                          </div>
                                        )}

                                        {/* Epic */}
                                        {featureObj.epic && (
                                          <div className="text-sm">
                                            <span className="text-gray-500">
                                              Epic:{" "}
                                            </span>
                                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                                              {featureObj.epic}
                                            </Badge>
                                          </div>
                                        )}

                                        {/* T-shirt Sizing */}
                                        {featureObj.tshirtsize && (
                                          <div className="text-sm">
                                            <span className="text-gray-500">
                                              T-shirt sizing:{" "}
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className="text-xs font-medium"
                                            >
                                              {featureObj.tshirtsize}
                                            </Badge>
                                          </div>
                                        )}

                                        {/* Tentative Start and End Date */}
                                        {(featureObj.startDate ||
                                          featureObj.endDate) && (
                                          <div className="text-sm">
                                            <span className="text-gray-500">
                                              Tentative Start and End date:{" "}
                                            </span>
                                            <span className="text-gray-700 font-medium">
                                              {featureObj.startDate &&
                                              featureObj.endDate
                                                ? `${new Date(
                                                    featureObj.startDate
                                                  ).toLocaleDateString()} - ${new Date(
                                                    featureObj.endDate
                                                  ).toLocaleDateString()}`
                                                : featureObj.startDate
                                                ? `Start: ${new Date(
                                                    featureObj.startDate
                                                  ).toLocaleDateString()}`
                                                : `End: ${new Date(
                                                    featureObj.endDate
                                                  ).toLocaleDateString()}`}
                                            </span>
                                          </div>
                                        )}

                                        {/* File Names */}
                                        {featureObj.referenceAttachements &&
                                          featureObj.referenceAttachements
                                            .length > 0 && (
                                            <div className="text-sm">
                                              <div className="text-gray-500 mb-1">
                                                Files:
                                              </div>
                                              <div className="space-y-1">
                                                {featureObj.referenceAttachements.map(
                                                  (file, fileIndex) => (
                                                    <div
                                                      key={fileIndex}
                                                      className="flex items-center space-x-2"
                                                    >
                                                      <FileText className="w-4 h-4 text-gray-400" />
                                                      <span className="text-xs text-gray-600 truncate">
                                                        {file.name}
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </div>

                                      {/* Cross mark to close this feature */}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeFeature(featureObj.name)
                                        }
                                        className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex-shrink-0"
                                        title="Remove feature"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg mb-3">
              <Switch
                id="reference-toggle"
                checked={showUpload}
                onCheckedChange={setShowUpload}
              />
              <Label
                htmlFor="reference-toggle"
                className="text-blue-800 font-medium cursor-pointer"
              >
                Do you have references of old features for better estimation,
                Please upload files here.
              </Label>
            </div>
            {showUpload && (
              <div
                className={`space-y-4 border-2 border-dashed rounded-lg p-6 transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-100/50"
                    : "border-blue-200 bg-blue-50/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center text-blue-600">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p>Drag and drop Excel files here or click to select</p>
                </div>
                <div className="flex justify-center">
                  <Label
                    htmlFor="previous-feature-upload"
                    className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Select Files
                  </Label>
                  <Input
                    id="previous-feature-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-blue-600 text-center">
                  Upload one or more Excel sheets with features in the first
                  column (skipping header row)
                </p>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-blue-800">
                      Uploaded Files:
                    </div>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-2 rounded-md border border-blue-100"
                      >
                        <span className="text-blue-700 truncate max-w-[60%]">
                          {file.name} ({file.features.length} features)
                        </span>
                        <div className="flex space-x-2">
                          <Label
                            htmlFor={`reupload-${index}`}
                            className="flex items-center space-x-1 cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Reupload</span>
                          </Label>
                          <Input
                            id={`reupload-${index}`}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => handleReupload(e, index)}
                            className="hidden"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadedFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="section-divider"></div>

          <div className="space-y-4 mt-4">
            <div className="form-label flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Dependencies & Blockers</span>
            </div>
            <Textarea
              id="dependencies"
              className="form-input min-h-[120px]"
              placeholder="List any external dependencies, third-party integrations, or potential blockers that might impact the project timeline..."
              value={dependencies}
              onChange={(e) => setDependencies(e.target.value)}
              rows={5}
            />
          </div>

          <div className="section-divider"></div>
        </CardContent>
      </Card>

      {/* Sprint Configuration Card */}
      <Card className="professional-card hover-lift">
        <CardHeader>
          <CardTitle className="section-header">
            <div className="icon-wrapper bg-gradient-to-br from-green-100 to-green-200 floating-animation">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <span>Sprint Configuration</span>
            <div className="ml-auto">
              <Badge className="bg-green-100 text-green-700 border border-green-200">
                {sprintVelocity} SP/sprint
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="form-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="team-input-group">
              <div className="form-label flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Sprint Duration</span>
              </div>
              <Input
                id="sprintSize"
                type="number"
                className="form-input text-center text-lg font-semibold"
                value={sprintSize}
                onChange={(e) => setSprintSize(Number(e.target.value))}
                min="1"
                max="8"
              />
              <p className="text-sm text-blue-600 text-center">
                weeks per sprint
              </p>
            </div>

            <div className="team-input-group">
              <div className="form-label flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Team Velocity</span>
              </div>
              <Input
                id="sprintVelocity"
                type="number"
                className="form-input text-center text-lg font-semibold"
                value={sprintVelocity}
                onChange={(e) => setSprintVelocity(Number(e.target.value))}
                min="1"
                max="100"
              />
              <p className="text-sm text-blue-600 text-center">
                story points per sprint
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Card */}
      <Card className="professional-card hover-lift">
        <CardHeader>
          <CardTitle className="section-header">
            <div className="icon-wrapper bg-gradient-to-br from-purple-100 to-purple-200 floating-animation">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span>Team Composition</span>
            <div className="ml-auto">
              <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                {Object.values(teamMembers).reduce((a, b) => a + b, 0)} members
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="form-section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(teamMembers).map(([role, count]) => (
              <div key={role} className="team-input-group">
                <Label
                  htmlFor={role}
                  className="text-sm font-semibold text-blue-800 capitalize mb-3 block"
                >
                  {role.replace(/([A-Z])/g, " $1").trim()}
                </Label>
                <Input
                  id={role}
                  type="number"
                  className="form-input text-center text-lg font-semibold"
                  value={count}
                  onChange={(e) =>
                    updateTeamMember(
                      role as keyof TeamMember,
                      Number(e.target.value)
                    )
                  }
                  min="0"
                  max="20"
                />
                <div className="text-xs text-blue-600 text-center mt-2">
                  {count === 1 ? "person" : "people"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Notes Card */}
      <Card className="professional-card hover-lift">
        <CardHeader>
          <CardTitle className="section-header">
            <div className="icon-wrapper bg-gradient-to-br from-orange-100 to-orange-200 floating-animation">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <span>Additional Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="form-section">
          <div className="space-y-4">
            <div className="form-label flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Project Notes & Requirements</span>
            </div>
            <Textarea
              id="customNotes"
              className="form-input min-h-[150px]"
              placeholder="Add any additional notes, special requirements, assumptions, or important considerations for this project estimation..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Form Button */}
      <div className="text-center py-8">
        <Button
          onClick={handleSubmitForm}
          disabled={isSubmitting || selectedFeatures.length === 0}
          className="gradient-button px-16 py-6 text-xl pulse-shadow rounded-2xl"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 mr-4 animate-spin" />
              Submitting Form...
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mr-4" />
              Submit Form
            </>
          )}
        </Button>
        <p className="text-blue-600/70 mt-4 text-sm">
          Submit your form data to get prediction results
        </p>
      </div>

      {/* API Response Display */}
      {apiResponse && (
        <Card className="professional-card hover-lift">
          <CardHeader>
            <CardTitle className="section-header">
              <div className="icon-wrapper bg-gradient-to-br from-green-100 to-green-200 floating-animation">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <span>Prediction Results</span>
              <div className="ml-auto">
                <Badge className="bg-green-100 text-green-700 border border-green-200">
                  Response
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="form-section">
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JIRA Dialogs */}
      <JiraConfigDialog
        open={showJiraConfig}
        onOpenChange={setShowJiraConfig}
        onConfigured={handleJiraConfigured}
      />

      <JiraImportDialog
        open={showJiraImport}
        onOpenChange={setShowJiraImport}
        onImport={handleJiraImport}
      />
    </div>
    </>
  );
}
