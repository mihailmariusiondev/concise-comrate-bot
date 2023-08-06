export type MessageData = {
  id: number;
  sender: string;
  text: string;
  reply_to?: { id: number };
};

export interface ChatState {
  recentMessages: MessageData[];
  lastCommandUsage: number;
  isBotEnabled: boolean;
}
