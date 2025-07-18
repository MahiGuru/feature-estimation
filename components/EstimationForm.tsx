"use client";

import { useState } from "react";
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
  Star,
  TrendingUp,
  Award,
  Lightbulb,
  Upload,
} from "lucide-react";
import { EstimationData, TeamMember } from "@/lib/types";
import {
  PREDEFINED_FEATURES,
  generateAIEstimation,
  saveEstimationData,
} from "@/lib/estimationData";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

export default function EstimationForm() {
  const { toast } = useToast();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState("");
  const [sprintSize, setSprintSize] = useState<number>(2);
  const [teamMembers, setTeamMembers] = useState<TeamMember>({
    developers: 0,
    qa: 0,
    po: 0,
    ba: 0,
    managers: 0,
    deliveryManagers: 0,
    architects: 0,
  });
  const [sprintVelocity, setSprintVelocity] = useState<number>(20);
  const [dependencies, setDependencies] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [aiEstimation, setAiEstimation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; features: string[] }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFeature = (feature: string) => {
    if (feature && !selectedFeatures.includes(feature)) {
      setSelectedFeatures([...selectedFeatures, feature]);
      setCustomFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
  };

  const processFile = (
    file: File,
    onProcessed: (newFeatures: string[], fileName: string) => void
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
          .filter(Boolean);

        // Get unique new features
        const newFeatures = uploadedFeatures.filter(
          (f) => f && !selectedFeatures.includes(f)
        );

        onProcessed(newFeatures, file.name);
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
    let totalNewFeatures = 0;

    Array.from(files).forEach((file) => {
      processFile(file, (newFeatures, fileName) => {
        if (newFeatures.length > 0) {
          setSelectedFeatures((prev) => [...prev, ...newFeatures]);
          setUploadedFiles((prev) => [
            ...prev,
            { name: fileName, features: newFeatures },
          ]);
          totalNewFeatures += newFeatures.length;
        }

        processedCount++;
        if (processedCount === files.length) {
          if (totalNewFeatures > 0) {
            toast({
              title: "Success",
              description: `${totalNewFeatures} features added from Excel sheet(s)`,
            });
          } else {
            toast({
              title: "Info",
              description: "No new features found in the Excel sheet(s)",
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
        setSelectedFeatures((prev) => [...prev, ...newFeatures]);
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
    setSelectedFeatures((prev) =>
      prev.filter((f) => !file.features.includes(f))
    );
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTeamMember = (role: keyof TeamMember, value: number) => {
    setTeamMembers((prev) => ({
      ...prev,
      [role]: value,
    }));
  };

  const handleGenerateAI = async () => {
    if (selectedFeatures.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one feature",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const estimation = await generateAIEstimation({
        features: selectedFeatures,
        sprintSize,
        teamMembers,
        sprintVelocity,
        dependencies,
        customNotes,
      });
      setAiEstimation(estimation);
      toast({
        title: "AI Estimation Generated",
        description: "Your project estimation has been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI estimation",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEstimation = () => {
    if (!aiEstimation) {
      toast({
        title: "Error",
        description: "Please generate AI estimation first",
        variant: "destructive",
      });
      return;
    }

    const estimationData: EstimationData = {
      id: Date.now().toString(),
      features: selectedFeatures,
      sprintSize,
      teamMembers,
      sprintVelocity,
      dependencies,
      customNotes,
      aiEstimation,
      createdAt: new Date(),
    };

    saveEstimationData(estimationData);
    toast({
      title: "Success",
      description: "Estimation saved successfully",
    });

    // Reset form
    setSelectedFeatures([]);
    setSprintSize(2);
    setTeamMembers({
      developers: 0,
      qa: 0,
      po: 0,
      ba: 0,
      managers: 0,
      deliveryManagers: 0,
      architects: 0,
    });
    setSprintVelocity(20);
    setDependencies("");
    setCustomNotes("");
    setAiEstimation(null);
    setUploadedFiles([]);
  };

  return (
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
            <div className="form-label flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <span>Project Features</span>
            </div>
            <div className="flex space-x-4">
              <Select onValueChange={addFeature}>
                <SelectTrigger className="form-input flex-1">
                  <SelectValue placeholder="Select predefined features" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_FEATURES.map((feature) => (
                    <SelectItem key={feature} value={feature}>
                      {feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                className="form-input"
                placeholder="Enter custom feature"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && addFeature(customFeature)
                }
              />

              <Button
                type="button"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => addFeature(customFeature)}
                disabled={!customFeature}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
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
            <div className="flex flex-wrap gap-4">
              {selectedFeatures.map((feature) => (
                <Badge
                  key={feature}
                  className="feature-badge hover:bg-blue-200 transition-colors"
                >
                  <span>{feature}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full"
                    onClick={() => removeFeature(feature)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="section-divider"></div>

          <div className="space-y-4">
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

      {/* Generate AI Button */}
      <div className="text-center py-8">
        <Button
          onClick={handleGenerateAI}
          disabled={isGenerating || selectedFeatures.length === 0}
          className="gradient-button px-16 py-6 text-xl pulse-shadow rounded-2xl"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 mr-4 animate-spin" />
              Generating AI Estimation...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 mr-4" />
              Generate AI Estimation
            </>
          )}
        </Button>
        <p className="text-blue-600/70 mt-4 text-sm">
          Our AI will analyze your requirements and provide detailed estimations
        </p>
      </div>

      {/* AI Estimation Results */}
      {aiEstimation && (
        <Card className="ai-results-card professional-card hover-lift">
          <CardHeader>
            <CardTitle className="section-header">
              <div className="icon-wrapper bg-gradient-to-br from-green-100 to-green-200 floating-animation">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <span>AI Estimation Results</span>
              <div className="ml-auto">
                <Badge className="bg-green-100 text-green-700 border border-green-200">
                  Generated
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="form-section">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="metric-card hover-lift">
                <div className="text-4xl font-bold text-blue-600 mb-3">
                  {aiEstimation.totalStoryPoints}
                </div>
                <div className="text-sm font-medium text-blue-500">
                  Total Story Points
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
              <div className="metric-card hover-lift">
                <div className="text-4xl font-bold text-green-600 mb-3">
                  {aiEstimation.estimatedSprints}
                </div>
                <div className="text-sm font-medium text-green-500">
                  Estimated Sprints
                </div>
                <div className="w-full bg-green-100 rounded-full h-2 mt-3">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
              <div className="metric-card hover-lift">
                <div
                  className={`text-4xl font-bold mb-3 ${
                    aiEstimation.riskLevel === "High"
                      ? "text-red-600"
                      : aiEstimation.riskLevel === "Medium"
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {aiEstimation.riskLevel}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  Risk Level
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${
                      aiEstimation.riskLevel === "High"
                        ? "bg-red-600"
                        : aiEstimation.riskLevel === "Medium"
                        ? "bg-orange-600"
                        : "bg-green-600"
                    }`}
                    style={{
                      width:
                        aiEstimation.riskLevel === "High"
                          ? "90%"
                          : aiEstimation.riskLevel === "Medium"
                          ? "60%"
                          : "30%",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="section-divider"></div>

            <div className="space-y-6">
              <div className="form-label flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <span>AI Recommendations</span>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                <ul className="space-y-4">
                  {aiEstimation.recommendations.map(
                    (rec: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start space-x-4 text-blue-800 hover:bg-blue-100/50 transition-colors p-2 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            <div className="text-center pt-6">
              <Button
                onClick={handleSaveEstimation}
                className="gradient-button px-12 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl pulse-shadow"
              >
                Save Estimation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
