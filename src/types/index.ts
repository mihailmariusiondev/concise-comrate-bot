export type MessageData = {
  id: number;
  sender: string;
  text: string;
  reply_to?: { id: number; text?: string };
};

export interface ChatState {
  recentMessages: MessageData[];
  lastCommandUsage: number;
  isBotStarted: boolean;
}
