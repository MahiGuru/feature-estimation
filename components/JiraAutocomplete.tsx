"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, GitBranch } from "lucide-react";
import { jiraService, JiraIssue } from "@/lib/jiraService";
import { cn } from "@/lib/utils";
import debounce from "lodash.debounce";

interface JiraAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (feature: string) => void;
  placeholder?: string;
  projectKey?: string;
  className?: string;
}

export function JiraAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter custom feature or search JIRA issues",
  projectKey,
  className,
}: JiraAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<JiraIssue[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchJira = useCallback(
    debounce(async (searchText: string) => {
      if (!jiraService.isConfigured() || searchText.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const issues = await jiraService.searchIssuesByText(searchText, projectKey);
        setSuggestions(issues.slice(0, 10)); // Limit to 10 suggestions
      } catch (error) {
        console.error("Failed to search JIRA issues:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [projectKey]
  );

  useEffect(() => {
    if (value.length >= 2) {
      searchJira(value);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value, searchJira]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter" && value.trim()) {
        e.preventDefault();
        onSelect(value.trim());
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const issue = suggestions[selectedIndex];
          onSelect(jiraService.formatIssueAsFeature(issue));
          setIsOpen(false);
          setSelectedIndex(-1);
        } else if (value.trim()) {
          onSelect(value.trim());
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectIssue = (issue: JiraIssue) => {
    onSelect(jiraService.formatIssueAsFeature(issue));
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const getIssueTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "bug":
        return "bg-red-100 text-red-700";
      case "task":
        return "bg-blue-100 text-blue-700";
      case "story":
      case "user story":
        return "bg-green-100 text-green-700";
      case "feature":
        return "bg-purple-100 text-purple-700";
      case "improvement":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Input
          ref={inputRef}
          className={cn("pr-8", className)}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setIsOpen(true)}
        />
        {jiraService.isConfigured() && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <GitBranch className="w-4 h-4 text-blue-600/50" />
            )}
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <ScrollArea className="max-h-[300px]">
            <div className="p-1">
              {suggestions.map((issue, index) => (
                <div
                  key={issue.key}
                  className={cn(
                    "flex items-start space-x-2 p-2 rounded cursor-pointer transition-colors",
                    selectedIndex === index
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => handleSelectIssue(issue)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {issue.key}
                      </span>
                      <Badge
                        className={cn(
                          "text-xs",
                          getIssueTypeColor(issue.fields.issuetype.name)
                        )}
                      >
                        {issue.fields.issuetype.name}
                      </Badge>
                      {issue.fields.priority && (
                        <Badge variant="outline" className="text-xs">
                          {issue.fields.priority.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {issue.fields.summary}
                    </p>
                    {issue.fields.assignee && (
                      <p className="text-xs text-gray-400 mt-1">
                        Assigned to: {issue.fields.assignee.displayName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Press Enter to add "{value}" as custom feature
            </p>
          </div>
        </div>
      )}
    </div>
  );
}