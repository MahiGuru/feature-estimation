export interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    storyPoints?: number;
    labels?: string[];
    components?: Array<{ name: string }>;
  };
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}

class JiraService {
  private config: JiraConfig | null = null;

  setConfig(config: JiraConfig) {
    this.config = config;
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('jiraConfig', JSON.stringify({
        domain: config.domain,
        email: config.email,
        // Don't store the actual token, just a flag
        hasToken: !!config.apiToken
      }));
    }
  }

  getConfig(): JiraConfig | null {
    return this.config;
  }

  isConfigured(): boolean {
    return !!this.config;
  }

  private getAuthHeader(): string {
    if (!this.config) {
      throw new Error('JIRA not configured');
    }
    const credentials = btoa(`${this.config.email}:${this.config.apiToken}`);
    return `Basic ${credentials}`;
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) {
      throw new Error('JIRA not configured');
    }

    try {
      const response = await fetch('/api/jira/test', {
        headers: {
          'Authorization': this.getAuthHeader(),
          'X-Jira-Domain': this.config.domain
        }
      });
      return response.ok;
    } catch (error) {
      console.error('JIRA connection test failed:', error);
      return false;
    }
  }

  async getProjects(): Promise<JiraProject[]> {
    if (!this.config) {
      throw new Error('JIRA not configured');
    }

    const response = await fetch('/api/jira/projects', {
      headers: {
        'Authorization': this.getAuthHeader(),
        'X-Jira-Domain': this.config.domain
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch JIRA projects');
    }

    return response.json();
  }

  async searchIssues(jql: string): Promise<JiraIssue[]> {
    if (!this.config) {
      throw new Error('JIRA not configured');
    }

    const response = await fetch('/api/jira/search', {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'X-Jira-Domain': this.config.domain,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql,
        maxResults: 100,
        fields: [
          'summary',
          'description',
          'status',
          'issuetype',
          'priority',
          'assignee',
          'customfield_10016', // Common story points field
          'labels',
          'components'
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to search JIRA issues');
    }

    const data = await response.json();
    return data.issues || [];
  }

  async getIssuesByProject(projectKey: string, issueTypes?: string[]): Promise<JiraIssue[]> {
    let jql = `project = ${projectKey}`;
    
    if (issueTypes && issueTypes.length > 0) {
      jql += ` AND issuetype IN (${issueTypes.map(type => `"${type}"`).join(', ')})`;
    }
    
    jql += ' ORDER BY created DESC';
    
    return this.searchIssues(jql);
  }

  async getEpicsAndStories(projectKey: string): Promise<JiraIssue[]> {
    return this.getIssuesByProject(projectKey, ['Epic', 'Story', 'Task']);
  }

  async getEpics(projectKey?: string): Promise<JiraIssue[]> {
    let jql = 'issuetype = Epic';
    if (projectKey) {
      jql = `project = ${projectKey} AND ${jql}`;
    }
    jql += ' ORDER BY created DESC';
    return this.searchIssues(jql);
  }

  async getTasksAndBugs(projectKey?: string): Promise<JiraIssue[]> {
    let jql = 'issuetype IN (Task, Bug, Story, "User Story", Feature, Improvement)';
    if (projectKey) {
      jql = `project = ${projectKey} AND ${jql}`;
    }
    jql += ' ORDER BY created DESC';
    return this.searchIssues(jql);
  }

  async searchIssuesByText(searchText: string, projectKey?: string): Promise<JiraIssue[]> {
    let jql = `(summary ~ "${searchText}*" OR description ~ "${searchText}*")`;
    if (projectKey) {
      jql = `project = ${projectKey} AND ${jql}`;
    }
    jql += ' AND issuetype IN (Task, Bug, Story, "User Story", Feature, Improvement) ORDER BY created DESC';
    return this.searchIssues(jql);
  }

  formatIssueAsFeature(issue: JiraIssue): string {
    return `[${issue.key}] ${issue.fields.summary}`;
  }
}

export const jiraService = new JiraService();