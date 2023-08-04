import { Telegraf, Context } from "telegraf";
import { MAX_CHAT_MESSAGES } from "../config";
import { botEnabledPerChat, recentMessages } from "../state";
import { MessageData } from "../types";

export function textHandler(bot: Telegraf) {
  bot.on("text", (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId || !botEnabledPerChat[chatId]) {
      return;
    }

    const messageText = (ctx.message as { text: string }).text;
    const senderName = ctx.from?.first_name || "Unknown";

    if (!ctx.message || !ctx.message.message_id) {
      return; // Exit early if there's no message or message ID
    }

    const messageId = ctx.message.message_id;

    // Using a type assertion for reply_to_message
    const repliedTo = (ctx.message as any)?.reply_to_message;
    const repliedToId = repliedTo?.message_id;

    const messageData: MessageData = {
      sender: senderName,
      text: messageText,
      id: messageId,
      reply_to: repliedToId ? { id: repliedToId } : undefined,
    };

    console.log(messageData);

    recentMessages[chatId] = [...(recentMessages[chatId] || []), messageData].slice(-MAX_CHAT_MESSAGES);
  });
}
