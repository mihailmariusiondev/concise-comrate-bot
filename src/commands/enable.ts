import { Telegraf, Context } from "telegraf";
import { botEnabledPerChat } from "../state";
import { getBotStatusMessage } from "../utils";

export function enableCommand(bot: Telegraf) {
  bot.command("enable", async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    botEnabledPerChat[chatId] = true;
    const botStatus = getBotStatusMessage(botEnabledPerChat[chatId]);

    console.log(botStatus);
    ctx.reply(botStatus, { parse_mode: "Markdown" });
  });
}
