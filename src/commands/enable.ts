import { Telegraf, Context } from "telegraf";
import { BOT_ALREADY_ENABLED_MESSAGE, BOT_ENABLED_MESSAGE } from "../config";
import { botEnabledPerChat } from "../state";

export function enableCommand(bot: Telegraf) {
  bot.command("enable", (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (chatId) {
      if (botEnabledPerChat[chatId]) {
        ctx.reply(BOT_ALREADY_ENABLED_MESSAGE);
        return;
      }
      botEnabledPerChat[chatId] = true;
      console.log(BOT_ENABLED_MESSAGE);
      ctx.reply(BOT_ENABLED_MESSAGE);
    }
  });
}
