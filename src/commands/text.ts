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

    const senderName = ctx.from?.first_name || "Unknown";
    const messageText = (ctx.message as { text: string }).text;
    const repliedToName = (ctx.message as any)?.reply_to_message?.from?.first_name;

    if (messageText) {
      const messageData: MessageData = {
        sender: senderName,
        text: messageText,
        reply_to: repliedToName ? { sender: repliedToName } : undefined,
      };
      recentMessages[chatId] = [...(recentMessages[chatId] || []), messageData].slice(-MAX_CHAT_MESSAGES);
    }
  });
}
