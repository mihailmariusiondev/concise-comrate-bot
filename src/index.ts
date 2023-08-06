import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config";
import { disableCommand } from "./commands/disable";
import { enableCommand } from "./commands/enable";
import { startCommand } from "./commands/start";
import { summarizeCommand } from "./commands/summarize";
import { textHandler } from "./commands/text";

const bot = new Telegraf(BOT_TOKEN!);

bot.catch((err: any, ctx) => {
  console.log(`Encountered an error for ${ctx.updateType}`, err);

  // Handle all 403 errors
  if (err.code === 403) {
    console.log("Bot is not authorized to perform the requested operation. Error description:", err.description);
  }
});

startCommand(bot);
enableCommand(bot);
disableCommand(bot);
summarizeCommand(bot);
textHandler(bot);

bot.launch();
console.log("Bot está corriendo...");
