import { Telegraf, Context } from "telegraf";
import { BOT_ALREADY_DISABLED_MESSAGE, BOT_DISABLED_MESSAGE } from "../config";
import { botEnabledPerChat } from "../state";

export function disableCommand(bot: Telegraf) {
  bot.command("disable", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (chatId) {
      if (!botEnabledPerChat[chatId]) {
        // ctx.reply(BOT_ALREADY_DISABLED_MESSAGE);
        console.log(BOT_ALREADY_DISABLED_MESSAGE);
        return;
      }
      botEnabledPerChat[chatId] = false;
      console.log(BOT_DISABLED_MESSAGE);
      // ctx.reply(BOT_DISABLED_MESSAGE);
    }
  });
}
