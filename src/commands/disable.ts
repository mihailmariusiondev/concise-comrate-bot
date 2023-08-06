import { Telegraf, Context } from "telegraf";
import { botEnabledPerChat } from "../state";
import { getBotStatusMessage } from "../utils";

export function disableCommand(bot: Telegraf) {
  bot.command("disable", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    botEnabledPerChat[chatId] = false;
    const botStatus = getBotStatusMessage(botEnabledPerChat[chatId]);

    console.log(botStatus);
    ctx.reply(botStatus, { parse_mode: "Markdown" });
  });
}
