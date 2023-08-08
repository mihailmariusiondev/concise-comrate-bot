import { MessageData } from "../types";

export function createMessageData(
  sender: string,
  text: string,
  messageId: number,
  repliedToId?: number,
  repliedToText?: string
): MessageData {
  if (repliedToId) {
    return {
      id: messageId,
      sender,
      text,
      reply_to: { id: repliedToId, text: repliedToText },
    };
  }
  return {
    id: messageId,
    sender,
    text,
  };
}
