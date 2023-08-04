export type MessageData = {
  sender: string;
  text: string;
  reply_to?: { sender: string };
};
