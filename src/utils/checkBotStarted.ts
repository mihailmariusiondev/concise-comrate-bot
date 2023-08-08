import { Context } from "telegraf";
import { BOT_REPLY, NOT_STARTED_MESSAGE_REPLY } from "../config";
import { chatState } from "../state";

// This function checks if the bot is started for the specific chatId
export function checkBotStarted(chatId: number, ctx: Context, includeReply: BOT_REPLY = BOT_REPLY.NO): boolean {
  const isBotStarted = chatState[chatId]?.isBotStarted;
  if (!isBotStarted && includeReply === BOT_REPLY.YES) {
    console.log(NOT_STARTED_MESSAGE_REPLY);
    ctx.reply(NOT_STARTED_MESSAGE_REPLY, { parse_mode: "Markdown" });
  }

  return isBotStarted;
}
