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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { jiraService, JiraConfig } from "@/lib/jiraService";
import { useToast } from "@/hooks/use-toast";

interface JiraConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigured: () => void;
}

export function JiraConfigDialog({
  open,
  onOpenChange,
  onConfigured,
}: JiraConfigDialogProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<JiraConfig>({
    domain: "",
    email: "",
    apiToken: "",
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  useEffect(() => {
    // Load saved config (without token)
    const savedConfig = localStorage.getItem("jiraConfig");
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig({
        domain: parsed.domain || "",
        email: parsed.email || "",
        apiToken: "",
      });
    }
  }, []);

  const handleTest = async () => {
    if (!config.domain || !config.email || !config.apiToken) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      jiraService.setConfig(config);
      const success = await jiraService.testConnection();
      setTestResult(success);
      
      if (success) {
        toast({
          title: "Success",
          description: "JIRA connection successful!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to connect to JIRA. Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult(false);
      toast({
        title: "Error",
        description: "Failed to connect to JIRA",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (testResult === true) {
      onConfigured();
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Please test the connection before saving",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure JIRA Integration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              To connect to JIRA, you need to create an API token from your{" "}
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Atlassian account settings
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="domain">JIRA Domain</Label>
            <Input
              id="domain"
              placeholder="your-domain.atlassian.net"
              value={config.domain}
              onChange={(e) =>
                setConfig({ ...config, domain: e.target.value })
              }
            />
            <p className="text-sm text-gray-500">
              Enter your JIRA domain without https://
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token</Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Your JIRA API token"
              value={config.apiToken}
              onChange={(e) =>
                setConfig({ ...config, apiToken: e.target.value })
              }
            />
          </div>

          {testResult !== null && (
            <Alert
              className={
                testResult
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              {testResult ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {testResult
                  ? "Connection successful!"
                  : "Connection failed. Please check your credentials."}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isTesting}
          >
            Cancel
          </Button>
          <Button onClick={handleTest} disabled={isTesting}>
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={testResult !== true || isTesting}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}