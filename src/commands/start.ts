import { Context, Telegraf } from "telegraf";
import { START_MESSAGE } from "../config";
import { botEnabledPerChat } from "../state";
import { getBotStatusMessage } from "../utils";

export function startCommand(bot: Telegraf) {
  bot.start(async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const botStatus = getBotStatusMessage(botEnabledPerChat[chatId]);

    console.log(`${START_MESSAGE}. ${botStatus}`);
    ctx.reply(`${START_MESSAGE}. ${botStatus}`, { parse_mode: "Markdown" });
  });
}
