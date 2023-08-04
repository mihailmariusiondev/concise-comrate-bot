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

    if (messageText) {
      const messageData: MessageData = { sender: senderName, text: messageText };
      recentMessages[chatId] = [...(recentMessages[chatId] || []), messageData].slice(-MAX_CHAT_MESSAGES);
    }
  });
}
