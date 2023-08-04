export type MessageData = {
  id: number;
  sender: string;
  text: string;
  reply_to?: { id: number };
};
