import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config";
import { disableCommand } from "./commands/disable";
import { enableCommand } from "./commands/enable";
import { startCommand } from "./commands/start";
import { summarizeCommand } from "./commands/summarize";
import { textHandler } from "./commands/text";

const bot = new Telegraf(BOT_TOKEN!);

startCommand(bot);
enableCommand(bot);
disableCommand(bot);
summarizeCommand(bot);
textHandler(bot);

bot.launch();
console.log("Bot está corriendo...");
