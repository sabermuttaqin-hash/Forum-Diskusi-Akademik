export interface AISummaryResult {
  summary: string;
  consensus: string;
  openQuestions: string[];
  keyInsights: string[];
  methodologyNote?: string;
}

export interface AICritiqueResult {
  strengths: string[];
  critiques: string[];
  counterArguments: string[];
  recommendedTheories: string[];
  overallScore: number;
  recommendation: string;
}

export interface AICitationsResult {
  recommendedKeywords: string[];
  sampleCitations: Array<{
    format: string;
    citation: string;
    notes: string;
  }>;
  searchStrategies: string[];
  conceptualFramework?: string;
}

export interface AIRefineResult {
  refinedText: string;
  changes: string[];
  academicVocabulary?: string[];
  readabilityLevel: string;
}

export interface AITitleSuggestionsResult {
  titles: Array<{
    title: string;
    methodology: string;
    significance: string;
    variables: string[];
  }>;
}

export const academicApi = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async summarizeDiscussion(title: string, content: string, replies?: any[]): Promise<AISummaryResult> {
    const res = await fetch('/api/gemini/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, replies }),
    });
    if (!res.ok) {
      throw new Error(`Failed to summarize: ${res.statusText}`);
    }
    return res.json();
  },

  async critiqueArgument(title: string, content: string, hypothesis?: string): Promise<AICritiqueResult> {
    const res = await fetch('/api/gemini/critique', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, hypothesis }),
    });
    if (!res.ok) {
      throw new Error(`Failed to critique: ${res.statusText}`);
    }
    return res.json();
  },

  async getCitations(topic: string, keywords?: string[]): Promise<AICitationsResult> {
    const res = await fetch('/api/gemini/citations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, keywords }),
    });
    if (!res.ok) {
      throw new Error(`Failed to get citations: ${res.statusText}`);
    }
    return res.json();
  },

  async refineAcademicTone(text: string, targetTone?: string): Promise<AIRefineResult> {
    const res = await fetch('/api/gemini/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetTone }),
    });
    if (!res.ok) {
      throw new Error(`Failed to refine text: ${res.statusText}`);
    }
    return res.json();
  },

  async suggestTitles(field: string, problemDescription: string): Promise<AITitleSuggestionsResult> {
    const res = await fetch('/api/gemini/title-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, problemDescription }),
    });
    if (!res.ok) {
      throw new Error(`Failed to suggest titles: ${res.statusText}`);
    }
    return res.json();
  },

  async consultAssistant(query: string, context?: string): Promise<{ reply: string }> {
    const res = await fetch('/api/gemini/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
    });
    if (!res.ok) {
      throw new Error(`Failed to consult assistant: ${res.statusText}`);
    }
    return res.json();
  },
};
