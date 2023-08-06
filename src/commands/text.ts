import { Telegraf, Context } from "telegraf";
import { MAX_CHAT_MESSAGES } from "../config";
import { botEnabledPerChat, recentMessages } from "../state";
import { MessageData } from "../types";

export function textHandler(bot: Telegraf) {
  bot.on("text", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId || !botEnabledPerChat[chatId]) {
      return;
    }

    const messageId = ctx.message?.message_id;
    const messageText = (ctx.message as { text: string }).text;
    const senderName = (ctx.from?.first_name || "Unknown").replace(/ /g, "");

    // Exit early if there's no message or message ID
    if (!ctx.message || !messageId) {
      return;
    }

    const repliedTo = (ctx.message as any)?.reply_to_message;
    const repliedToId = repliedTo?.message_id;

    const messageData = createMessageData(senderName, messageText, messageId, repliedToId);

    console.log(messageData);

    recentMessages[chatId] = [...(recentMessages[chatId] || []), messageData].slice(-MAX_CHAT_MESSAGES);
  });
}

function createMessageData(sender: string, text: string, id: number, reply_to_id?: number): MessageData {
  return {
    sender,
    text,
    id,
    reply_to: reply_to_id ? { id: reply_to_id } : undefined,
  };
}
