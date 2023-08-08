import { Context } from "telegraf";
import {
  BOT_REPLY,
  COMMAND_COOLDOWN,
  COOLDOWN_MESSAGE_REPLY,
  MAX_CHAT_MESSAGES,
  NOT_ENOUGH_MESSAGES_REPLY,
  START_MESSAGE_REPLY,
  bot,
} from "./config";
import { chatState } from "./state";
import { handleError } from "./utils/handleError";
import { getSummaryForChat } from "./utils/getSummaryForChat";
import { checkBotStarted } from "./utils/checkBotStarted";
import { createMessageData } from "./utils/createMessageData";

bot.start(async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  // Set the isBotStarted property to true
  chatState[chatId] = { ...(chatState[chatId] ?? {}), isBotStarted: true };

  console.log(START_MESSAGE_REPLY);
  ctx.reply(START_MESSAGE_REPLY, { parse_mode: "Markdown" }).catch((err) => handleError(ctx, err));
});

bot.command("summarize", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId || !checkBotStarted(chatId, ctx, BOT_REPLY.YES)) return;

  // Check if there are at least 5 messages to summarize
  const messageCount = chatState[chatId]?.recentMessages?.length || 0;
  if (messageCount < 5) {
    console.log(NOT_ENOUGH_MESSAGES_REPLY);
    ctx.reply(NOT_ENOUGH_MESSAGES_REPLY).catch((err) => handleError(ctx, err));
    return;
  }

  const lastUsed = chatState[chatId]?.lastCommandUsage || 0;
  const currentTime = Date.now();

  if (currentTime - lastUsed < COMMAND_COOLDOWN) {
    console.log(COOLDOWN_MESSAGE_REPLY);
    ctx.reply(COOLDOWN_MESSAGE_REPLY).catch((err) => handleError(ctx, err));
    return;
  }

  const chatSummary = await getSummaryForChat(chatId);
  console.log({ chatSummary });
  ctx.reply(chatSummary).catch((err) => handleError(ctx, err));

  chatState[chatId] = { ...(chatState[chatId] ?? {}), lastCommandUsage: currentTime };
});

bot.on("text", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId || !checkBotStarted(chatId, ctx, BOT_REPLY.NO)) return;

  const messageId = ctx.message?.message_id;
  const messageText = (ctx.message as { text: string }).text;
  const senderName = (ctx.from?.first_name || "Unknown").replace(/ /g, "");

  // Exit early if there's no messageText or messageId
  if (!messageText || !messageId) {
    return;
  }

  const repliedTo = (ctx.message as any)?.reply_to_message;
  const repliedToId = repliedTo?.message_id;
  const repliedToText = repliedTo?.text;
  const messageData = createMessageData(senderName, messageText, messageId, repliedToId, repliedToText); // Include the text of the replied-to message
  console.log(messageData);

  chatState[chatId] = {
    ...(chatState[chatId] ?? {}),
    recentMessages: [...(chatState[chatId]?.recentMessages || []), messageData].slice(-MAX_CHAT_MESSAGES),
  };
});

bot.launch();
console.log("Bot está corriendo...");
