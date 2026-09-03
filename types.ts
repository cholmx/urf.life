
export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  series: string;
  date: string;
  imageUrl: string;
  videoUrl?: string;
  audioUrl?: string;
  youtubeVideoId?: string;
  description: string;
  topics: string[];
  transcript?: string;
  summary?: string;
  discussionQuestions?: string[];
  themes?: string[];
  scriptures?: string[];
}

export interface LeadershipMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface Ministry {
  name: string;
  description: string;
  imageUrl: string;
  contact: string;
}
