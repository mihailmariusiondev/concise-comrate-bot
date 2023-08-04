import { Telegraf, Context } from "telegraf";
import { BOT_ALREADY_DISABLED_MESSAGE, BOT_DISABLED_MESSAGE } from "../config";
import { botEnabledPerChat } from "../state";

export function disableCommand(bot: Telegraf) {
  bot.command("disable", (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (chatId) {
      if (!botEnabledPerChat[chatId]) {
        ctx.reply(BOT_ALREADY_DISABLED_MESSAGE);
        return;
      }
      botEnabledPerChat[chatId] = false;
      ctx.reply(BOT_DISABLED_MESSAGE);
    }
  });
}
