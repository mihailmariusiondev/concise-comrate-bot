import { Telegraf } from "telegraf";
import { startCommand } from "./commands/start";
import { enableCommand } from "./commands/enable";
import { disableCommand } from "./commands/disable";
import { summarizeCommand } from "./commands/summarize";
import { textHandler } from "./commands/text";
import { BOT_TOKEN } from "./config";

const bot = new Telegraf(BOT_TOKEN!);

startCommand(bot);
enableCommand(bot);
disableCommand(bot);
summarizeCommand(bot);
textHandler(bot);

bot.launch();
console.log("Bot está corriendo...");
