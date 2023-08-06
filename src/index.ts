import { Context, Telegraf } from "telegraf";
import { BOT_REPLY, COMMAND_COOLDOWN, COOLDOWN_MESSAGE, MAX_CHAT_MESSAGES, NOT_ENOUGH_MESSAGES_REPLY, START_MESSAGE, bot } from "./config";
import { chatState } from "./state";
import { checkBotEnabled, createMessageData, getBotStatusMessage, getSummaryForChat } from "./utils";

bot.start(async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const botStatusMessage = getBotStatusMessage(chatState[chatId]?.isBotEnabled ?? false);

  console.log(`${START_MESSAGE}. ${botStatusMessage}`);
  ctx.reply(`${START_MESSAGE}. ${botStatusMessage}`, { parse_mode: "Markdown" });
});

bot.command("enable", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  chatState[chatId] = { ...(chatState[chatId] ?? {}), isBotEnabled: true };
  const botStatusMessage = getBotStatusMessage(chatState[chatId].isBotEnabled);

  console.log(botStatusMessage);
  ctx.reply(botStatusMessage, { parse_mode: "Markdown" });
});

bot.command("disable", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId || !checkBotEnabled(chatId, ctx, BOT_REPLY.NO)) return;

  chatState[chatId] = { ...(chatState[chatId] ?? {}), isBotEnabled: false };
  const botStatusMessage = getBotStatusMessage(chatState[chatId].isBotEnabled);

  console.log(botStatusMessage);
  ctx.reply(botStatusMessage, { parse_mode: "Markdown" });
});

bot.command("summarize", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId || !checkBotEnabled(chatId, ctx, BOT_REPLY.YES)) return;

  // Check if there are at least 5 messages to summarize
  const messageCount = chatState[chatId]?.recentMessages?.length || 0;
  if (messageCount < 5) {
    console.log(NOT_ENOUGH_MESSAGES_REPLY);
    ctx.reply(NOT_ENOUGH_MESSAGES_REPLY);
    return;
  }

  const lastUsed = chatState[chatId]?.lastCommandUsage || 0;
  const currentTime = Date.now();

  if (currentTime - lastUsed < COMMAND_COOLDOWN) {
    console.log(COOLDOWN_MESSAGE);
    ctx.reply(COOLDOWN_MESSAGE);
    return;
  }

  const chatSummary = await getSummaryForChat(chatId);
  console.log({ chatSummary });
  ctx.reply(chatSummary);

  chatState[chatId] = { ...(chatState[chatId] ?? {}), lastCommandUsage: currentTime };
});

bot.on("text", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId || !checkBotEnabled(chatId, ctx, BOT_REPLY.YES)) return;

  // Check if the bot is enabled before proceeding
  if (!chatState[chatId]?.isBotEnabled) {
    const botStatusMessage = getBotStatusMessage(false);
    console.log(botStatusMessage);
    ctx.reply(botStatusMessage);
    return;
  }

  const messageId = ctx.message?.message_id;
  const messageText = (ctx.message as { text: string }).text;
  const senderName = (ctx.from?.first_name || "Unknown").replace(/ /g, "");

  // Exit early if there's no message or message ID
  if (!ctx.message || !messageId) {
    return;
  }

  const repliedTo = (ctx.message as any)?.reply_to_message;
  const repliedToId = repliedTo?.message_id;

  const messageData = createMessageData(senderName, messageText, messageId, repliedToId);

  console.log(messageData);

  chatState[chatId] = {
    ...(chatState[chatId] ?? {}),
    recentMessages: [...(chatState[chatId]?.recentMessages || []), messageData].slice(-MAX_CHAT_MESSAGES),
  };
});

bot.launch();
console.log("Bot está corriendo...");
