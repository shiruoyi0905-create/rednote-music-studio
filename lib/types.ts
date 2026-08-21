export type GeneratedContent = {
  song: string;
  artist: string;
  mood: string;
  titles: string[];
  copy: string;
  coverGradient: string;
};

export type CreatorBrief = {
  audience: string;
  goal: string;
  tone: string;
  keywords: string;
  avoid: string;
};

export type EvaluationDimensions = {
  audienceFit: number;
  authenticity: number;
  readability: number;
  publishReadiness: number;
};

export type ContentEvaluation = {
  overallScore: number;
  dimensions: EvaluationDimensions;
  strengths: string[];
  risks: string[];
  nextStep: string;
  source: "ai" | "local";
};

export type GenerateApiResponse = {
  data?: GeneratedContent;
  error?: string;
};

export type EvaluateApiResponse = {
  data?: ContentEvaluation;
  error?: string;
};
