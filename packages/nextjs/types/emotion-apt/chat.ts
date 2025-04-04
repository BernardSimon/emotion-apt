export type ChatMessage = {
  id: number;
  text: string | KeyWords;
  role: string;
  visible: boolean;
};

export type KeyWords = {
  keywords: string[];
  description: string;
};

export type ChatResponse = {
  message: string;
  keywords: KeyWords | null;
};
export type ChatRequest = {
  profile: string;
  chats: ChatMessage[];
};