import { Context } from "telegraf";
import {
  IncludeBotReply,
  COMMAND_COOLDOWN,
  COOLDOWN_MESSAGE_REPLY,
  ContentType,
  MAX_CHAT_MESSAGES,
  NOT_ENOUGH_MESSAGES_REPLY,
  START_MESSAGE_REPLY,
  YOUTUBE_URL_REGEX,
  bot,
} from "./config";
import { chatState } from "./state";
import { handleError } from "./utils/handleError";
import { checkBotStarted } from "./utils/checkBotStarted";
import { createMessageData } from "./utils/createMessageData";
import { getVideoCaptions } from "./utils/getVideoCaptions";
import { getSummary } from "./utils/getSummary";
import { detectLanguage } from "./utils/detectLanguage";
import { translateMessage } from "./utils/translateMessage";

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
  // Check if the bot is started for the given chat
  if (!chatId || !checkBotStarted(chatId, ctx, IncludeBotReply.YES)) return;

  // Check if there are enough messages to summarize
  const messageCount = chatState[chatId]?.recentMessages?.length || 0;
  if (messageCount < 5) {
    console.log(NOT_ENOUGH_MESSAGES_REPLY);
    ctx.reply(NOT_ENOUGH_MESSAGES_REPLY).catch((err) => handleError(ctx, err));
    return;
  }

  // Check if the command is in cooldown
  const lastUsed = chatState[chatId]?.lastCommandUsage || 0;
  const currentTime = Date.now();
  if (currentTime - lastUsed < COMMAND_COOLDOWN) {
    console.log(COOLDOWN_MESSAGE_REPLY);
    ctx.reply(COOLDOWN_MESSAGE_REPLY).catch((err) => handleError(ctx, err));
    return;
  }

  const repliedToText = (ctx.message as any)?.reply_to_message?.text;

  // Format the recent messages for summarization and language detection
  const recentMessagesForChat = chatState[chatId]?.recentMessages || [];
  const formattedMessages = recentMessagesForChat
    .map((message) => {
      if (message.reply_to && message.reply_to.id) {
        return `#${message.id} ${message.sender} (replying #${message.reply_to.id})`;
      }
      return `#${message.id} ${message.sender}: ${message.text}`;
    })
    .join(" | ");

  // Detect the language based on recent messages
  // const detectedLanguage = detectLanguage(formattedMessages); // TODO this isn't working as intended for now, fix later
  const detectedLanguage = "spanish";
  console.log({ detectedLanguage });

  // Check if the replied-to message contains a YouTube link and handle video summarization
  if (repliedToText) {
    const youtubeMatch = YOUTUBE_URL_REGEX.exec(repliedToText);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      const captions = await getVideoCaptions(videoId);

      // Handle case where no captions are available
      if (captions.length === 0) {
        const originalNoCaptionsMessage = "Sorry, there are no captions available for this video. I can't summarize it.";

        // Translate the no captions message
        const translatedNoCaptionsMessage = await translateMessage(originalNoCaptionsMessage, detectedLanguage);
        ctx.reply(translatedNoCaptionsMessage).catch((err) => handleError(ctx, err));
        return;
      }

      // Video summarization
      const videoSummary = await getSummary(captions, ContentType.VIDEO, detectedLanguage);
      ctx.reply(videoSummary).catch((err) => handleError(ctx, err));
      return;
    }
  }

  // Summarize chat conversations, passing the detected language
  const chatSummary = await getSummary(formattedMessages, ContentType.CHAT, detectedLanguage);
  ctx.reply(chatSummary).catch((err) => handleError(ctx, err));
  chatState[chatId] = { ...(chatState[chatId] ?? {}), lastCommandUsage: currentTime };
});

bot.on("text", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId || !checkBotStarted(chatId, ctx, IncludeBotReply.NO)) return;

  const messageId = ctx.message?.message_id;
  const messageText = (ctx.message as { text: string }).text;
  const senderName = (ctx.from?.first_name || "Unknown").replace(/ /g, "");

  // Exit early if there's no messageText or messageId
  if (!messageText || !messageId) {
    return;
  }

  const repliedToId = (ctx.message as any)?.reply_to_message?.message_id;
  const repliedToText = (ctx.message as any)?.reply_to_message?.text;

  const messageData = createMessageData(senderName, messageText, messageId, repliedToId, repliedToText); // Include the text of the replied-to message
  // console.log(messageData);

  chatState[chatId] = {
    ...(chatState[chatId] ?? {}),
    recentMessages: [...(chatState[chatId]?.recentMessages || []), messageData].slice(-MAX_CHAT_MESSAGES),
  };
});

bot.launch();
console.log("Bot está corriendo...");
