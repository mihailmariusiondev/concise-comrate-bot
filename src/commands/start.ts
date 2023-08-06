import { Context, Telegraf } from "telegraf";
import { START_MESSAGE } from "../config";
import { botEnabledPerChat } from "../state";

export function startCommand(bot: Telegraf) {
  bot.start(async (ctx: Context) => {
    ctx.reply(START_MESSAGE);
    const chatId = ctx.chat?.id;
    if (chatId) {
      botEnabledPerChat[chatId] = true; // Default to enabled when bot is started
    }
  });
}
