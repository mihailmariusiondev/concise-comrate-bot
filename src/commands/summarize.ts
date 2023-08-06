import { Telegraf, Context } from "telegraf";
import { NOT_ENOUGH_MESSAGES_REPLY, COOLDOWN_MESSAGE, BOT_DISABLED_MESSAGE } from "../config";
import { botEnabledPerChat, recentMessages, lastCommandUsage, COMMAND_COOLDOWN } from "../state";
import { getSummaryForChat } from "../utils";

export function summarizeCommand(bot: Telegraf) {
  bot.command("summarize", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId || !botEnabledPerChat[chatId]) {
      console.log(BOT_DISABLED_MESSAGE);
      // ctx.reply(BOT_DISABLED_MESSAGE);
      return;
    }

    // Check if there are at least 5 messages to summarize
    const messageCount = recentMessages[chatId]?.length || 0;
    if (messageCount < 5) {
      console.log(NOT_ENOUGH_MESSAGES_REPLY);
      // ctx.reply(NOT_ENOUGH_MESSAGES_REPLY);
      return;
    }

    const lastUsed = lastCommandUsage[chatId] || 0;
    const currentTime = Date.now();

    if (currentTime - lastUsed < COMMAND_COOLDOWN) {
      console.log(COOLDOWN_MESSAGE);
      // ctx.reply(COOLDOWN_MESSAGE);
      return;
    }

    const chatSummary = await getSummaryForChat(chatId);
    console.log({ chatSummary });
    // ctx.reply(chatSummary);

    lastCommandUsage[chatId] = currentTime;
  });
}
