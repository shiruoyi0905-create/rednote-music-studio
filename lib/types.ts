export type GeneratedContent = {
  song: string;
  artist: string;
  mood: string;
  titles: string[];
  copy: string;
  coverGradient: string;
};

export type GenerateApiResponse = {
  data?: GeneratedContent;
  error?: string;
};
