import { Telegraf, Context } from "telegraf";
import { BOT_NOT_ENABLED_REPLY, NOT_ENOUGH_MESSAGES_REPLY, COOLDOWN_MESSAGE, MAX_CHAT_MESSAGES } from "../config";
import { botEnabledPerChat, recentMessages, lastCommandUsage, COMMAND_COOLDOWN } from "../state";
import { getSummaryForChat } from "../utils";

export function summarizeCommand(bot: Telegraf) {
  bot.command("summarize", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId || !botEnabledPerChat[chatId]) {
      ctx.reply(BOT_NOT_ENABLED_REPLY);
      return;
    }

    // Check if there are at least 5 messages to summarize
    const messageCount = recentMessages[chatId]?.length || 0;
    if (messageCount < 5) {
      ctx.reply(NOT_ENOUGH_MESSAGES_REPLY);
      return;
    }

    const lastUsed = lastCommandUsage[chatId] || 0;
    const currentTime = Date.now();

    if (currentTime - lastUsed < COMMAND_COOLDOWN) {
      ctx.reply(COOLDOWN_MESSAGE);
      return;
    }

    const chatSummary = await getSummaryForChat(ctx, MAX_CHAT_MESSAGES);
    console.log(chatSummary);
    ctx.reply(chatSummary);
    lastCommandUsage[chatId] = currentTime;
  });
}
