"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { jiraService, JiraProject, JiraIssue } from "@/lib/jiraService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface JiraImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (features: string[]) => void;
}

export function JiraImportDialog({
  open,
  onOpenChange,
  onImport,
}: JiraImportDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [jqlQuery, setJqlQuery] = useState("");
  const [useJql, setUseJql] = useState(false);

  useEffect(() => {
    if (open && jiraService.isConfigured()) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const projectList = await jiraService.getProjects();
      setProjects(projectList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load JIRA projects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadIssues = async () => {
    if (!selectedProject && !useJql) return;

    setIsLoading(true);
    try {
      let issueList: JiraIssue[];
      
      if (useJql && jqlQuery) {
        issueList = await jiraService.searchIssues(jqlQuery);
      } else {
        issueList = await jiraService.getEpicsAndStories(selectedProject);
      }
      
      setIssues(issueList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load JIRA issues",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectChange = (projectKey: string) => {
    setSelectedProject(projectKey);
    setSelectedIssues(new Set());
    setIssues([]);
  };

  const handleSelectAll = () => {
    if (selectedIssues.size === filteredIssues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(filteredIssues.map((issue) => issue.key)));
    }
  };

  const handleToggleIssue = (issueKey: string) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueKey)) {
      newSelected.delete(issueKey);
    } else {
      newSelected.add(issueKey);
    }
    setSelectedIssues(newSelected);
  };

  const handleImport = () => {
    const selectedFeatures = issues
      .filter((issue) => selectedIssues.has(issue.key))
      .map((issue) => jiraService.formatIssueAsFeature(issue));
    
    onImport(selectedFeatures);
    onOpenChange(false);
    
    toast({
      title: "Success",
      description: `Imported ${selectedFeatures.length} features from JIRA`,
    });
  };

  const filteredIssues = issues.filter((issue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      issue.fields.summary.toLowerCase().includes(query) ||
      issue.key.toLowerCase().includes(query)
    );
  });

  const getIssueTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "epic":
        return "bg-purple-100 text-purple-700";
      case "story":
        return "bg-green-100 text-green-700";
      case "task":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Features from JIRA</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="use-jql"
              checked={useJql}
              onChange={(e) => setUseJql(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="use-jql">Use JQL Query</Label>
          </div>

          {useJql ? (
            <div className="space-y-2">
              <Label>JQL Query</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="project = KEY AND issuetype = Story"
                  value={jqlQuery}
                  onChange={(e) => setJqlQuery(e.target.value)}
                />
                <Button onClick={loadIssues} disabled={isLoading || !jqlQuery}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Project</Label>
              <div className="flex space-x-2">
                <Select value={selectedProject} onValueChange={handleProjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.key} value={project.key}>
                        {project.name} ({project.key})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={loadIssues}
                  disabled={isLoading || !selectedProject}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {issues.length > 0 && (
            <>
              <div className="space-y-2">
                <Label>Search Issues</Label>
                <Input
                  placeholder="Search by summary or key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={
                      filteredIssues.length > 0 &&
                      selectedIssues.size === filteredIssues.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>
                    Select All ({selectedIssues.size} of {filteredIssues.length})
                  </Label>
                </div>
              </div>

              <ScrollArea className="h-[300px] border rounded-md p-4">
                <div className="space-y-2">
                  {filteredIssues.map((issue) => (
                    <div
                      key={issue.key}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedIssues.has(issue.key)}
                        onCheckedChange={() => handleToggleIssue(issue.key)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{issue.key}</span>
                          <Badge
                            className={getIssueTypeColor(
                              issue.fields.issuetype.name
                            )}
                          >
                            {issue.fields.issuetype.name}
                          </Badge>
                          {issue.fields.status && (
                            <Badge variant="outline">
                              {issue.fields.status.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {issue.fields.summary}
                        </p>
                        {issue.fields.assignee && (
                          <p className="text-xs text-gray-500">
                            Assignee: {issue.fields.assignee.displayName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {issues.length === 0 && !isLoading && (selectedProject || jqlQuery) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No issues found. Try adjusting your search criteria.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIssues.size === 0}
          >
            Import {selectedIssues.size} Features
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}