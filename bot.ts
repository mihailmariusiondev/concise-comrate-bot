import * as dotenv from "dotenv";
import { Telegraf, Context } from "telegraf";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";

dotenv.config();

// Constants and environment variables
const MAX_CHAT_MESSAGES = 300;
const BOT_TOKEN = process.env.BOT_TOKEN;
const GPT_API_KEY = process.env.GPT_API_KEY;

// Constants reply messages
const START_MESSAGE = "¡Qué pasa crack! Vamos a resumir tu mierda de chats de Telegram";
const BOT_ALREADY_ENABLED_MESSAGE = "El bot ya está activado.";
const BOT_ENABLED_MESSAGE = "¡Bot activado!";
const BOT_ALREADY_DISABLED_MESSAGE = "El bot ya está desactivado.";
const BOT_DISABLED_MESSAGE = "¡Bot desactivado!";
const BOT_NOT_ENABLED_REPLY = "El bot está desactivado. Usa /enable para activarlo.";
const NOT_ENOUGH_MESSAGES_REPLY = "No hay suficientes mensajes para resumir. Necesito al menos 5 mensajes.";
const COOLDOWN_MESSAGE = "Machooo, espérate un poco antes de volver a usar el comando";
const ERROR_SUMMARIZING = "Ya la hemos liao... Error al resumir los mensajes";

if (!BOT_TOKEN || !GPT_API_KEY) {
  console.error("Environment variables BOT_TOKEN or GPT_API_KEY are not set.");
  process.exit(1);
}

const configuration = new Configuration({
  apiKey: GPT_API_KEY,
});
const openai = new OpenAIApi(configuration);

const bot = new Telegraf(BOT_TOKEN);

type MessageData = { sender: string; text: string };
const recentMessages: { [chatId: number]: MessageData[] } = {};
const lastCommandUsage: { [chatId: number]: number } = {};
const botEnabledPerChat: { [chatId: number]: boolean } = {};
const COMMAND_COOLDOWN = 60 * 1000;

bot.start((ctx) => {
  ctx.reply(START_MESSAGE);
  const chatId = ctx.chat?.id;
  if (chatId) {
    botEnabledPerChat[chatId] = true; // Default to enabled when bot is started
  }
});

bot.command("enable", (ctx) => {
  const chatId = ctx.chat?.id;
  if (chatId) {
    if (botEnabledPerChat[chatId]) {
      ctx.reply(BOT_ALREADY_ENABLED_MESSAGE);
      return;
    }
    botEnabledPerChat[chatId] = true;
    ctx.reply(BOT_ENABLED_MESSAGE);
  }
});

bot.command("disable", (ctx) => {
  const chatId = ctx.chat?.id;
  if (chatId) {
    if (!botEnabledPerChat[chatId]) {
      ctx.reply(BOT_ALREADY_DISABLED_MESSAGE);
      return;
    }
    botEnabledPerChat[chatId] = false;
    ctx.reply(BOT_DISABLED_MESSAGE);
  }
});

bot.command("summarize", async (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId || !botEnabledPerChat[chatId]) {
    ctx.reply(BOT_NOT_ENABLED_REPLY);
    return;
  }

  // Check if there are at least 5 messages to summarize
  const messageCount = recentMessages[chatId]?.length || 0;
  if (messageCount < 5) {
    ctx.reply(NOT_ENOUGH_MESSAGES_REPLY);
    return;
  }

  const lastUsed = lastCommandUsage[chatId] || 0;
  const currentTime = Date.now();

  if (currentTime - lastUsed < COMMAND_COOLDOWN) {
    ctx.reply(COOLDOWN_MESSAGE);
    return;
  }

  ctx.reply(await getSummaryForChat(ctx, MAX_CHAT_MESSAGES));
  lastCommandUsage[chatId] = currentTime;
});

bot.on("text", (ctx: Context) => {
  const chatId = ctx.chat?.id;
  if (!chatId || !botEnabledPerChat[chatId]) {
    return;
  }

  const messageText = (ctx.message as { text: string }).text;
  const senderName = ctx.from?.first_name || "Unknown";

  if (messageText) {
    const messageData: MessageData = { sender: senderName, text: messageText };
    recentMessages[chatId] = [...(recentMessages[chatId] || []), messageData].slice(-MAX_CHAT_MESSAGES);
  }
});

async function getSummaryForChat(ctx: Context, count: number): Promise<string> {
  let messages: string[] = [];
  if (ctx.chat && typeof ctx.chat.id === "number") {
    const messageDataList = recentMessages[ctx.chat.id]?.slice(-count) || [];
    messages = messageDataList.map((data) => `${data.sender}: ${data.text}`);
  }

  const systemMessage: ChatCompletionRequestMessage = {
    role: "system" as ChatCompletionRequestMessageRoleEnum,
    content: `
    You are an assistant helping friends catch up in a busy chat group. Your goal is to help friends in this group stay up to date without having to read all the messages. The conversation provided to you is in a specific language, and you should adapt to it, ensuring your summary is in the same language.
    Respond with a short and concise summary of the conversation while following these guidelines:
    - Adapt to and match the tone of the conversation, acting like you are part of the group.
    - Use 3 sentences or less for your summary.
    - Be specific: mention who said what without being too general.
    `,
  };

  const userMessage: ChatCompletionRequestMessage = {
    role: "user" as ChatCompletionRequestMessageRoleEnum,
    content: messages.join("\n"),
  };

  console.log("Payload being sent to OpenAI:", {
    model: "gpt-3.5-turbo-16k",
    messages: [systemMessage, userMessage],
  });

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-16k",
      messages: [systemMessage, userMessage],
    });

    return completion.data?.choices[0]?.message?.content?.trim() || ERROR_SUMMARIZING;
  } catch (error) {
    console.error(ERROR_SUMMARIZING, error);
    return ERROR_SUMMARIZING;
  }
}

bot.launch();
console.log("Bot está corriendo...");
