import { Telegraf, Context } from "telegraf";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";

const BOT_TOKEN = "6610691916:AAHAVageSJ5M7wSb4PRZozgJmVcCTVWYaQk";
const GPT_API_KEY = "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";

const configuration = new Configuration({
  apiKey: GPT_API_KEY,
});
const openai = new OpenAIApi(configuration);

const bot = new Telegraf(BOT_TOKEN);

// A simple in-memory storage for the recent messages.
// For a production environment, consider using a more persistent storage solution.
const recentMessages: { [chatId: number]: string[] } = {};

bot.start((ctx) => ctx.reply("Welcome to the Summary Bot!"));

bot.command("summarize", async (ctx: Context) => {
  const messages = await fetchRecentMessages(ctx, 50);
  const summary = await getSummary(messages);
  console.log({ summary });
  ctx.reply(summary);
});

bot.command("summarize_100", async (ctx: Context) => {
  const messages = await fetchRecentMessages(ctx, 100);
  const summary = await getSummary(messages);
  ctx.reply(summary);
});

bot.on("text", (ctx: Context) => {
  const chatId = ctx.chat?.id;

  // Check if it's a text message
  if (ctx.message && isTextMessage(ctx.message)) {
    const messageText = ctx.message.text;
    if (chatId && messageText) {
      // Initialize the chat in the recentMessages object if it's not already present
      if (!recentMessages[chatId]) {
        recentMessages[chatId] = [];
      }

      // Add the message to the recent messages for the chat
      recentMessages[chatId].push(messageText);

      // Keep only the last 100 messages for simplicity
      if (recentMessages[chatId].length > 100) {
        recentMessages[chatId].shift();
      }
    }
  }
});

async function fetchRecentMessages(ctx: Context, count: number): Promise<string[]> {
  const chatId = ctx.chat?.id;
  if (!chatId || !recentMessages[chatId]) {
    return [];
  }

  return recentMessages[chatId].slice(-count);
}

async function getSummary(messages: string[]): Promise<string> {
  const systemMessage: ChatCompletionRequestMessage = {
    role: "system" as ChatCompletionRequestMessageRoleEnum,
    content:
      "You are an assistant helping friends catch up in a busy chat group. Your goal is to help friends in this group stay up to date without having to read all the messages.",
  };

  const userMessage: ChatCompletionRequestMessage = {
    role: "user" as ChatCompletionRequestMessageRoleEnum,
    content: messages.join("\n"),
  };

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, userMessage],
    });

    return completion.data?.choices[0]?.message?.content?.trim() || "Error summarizing the messages.";
  } catch (error) {
    console.error("Error summarizing the messages:", error);
    return "Error summarizing the messages.";
  }
}

function isTextMessage(message: any): message is { text: string } {
  return message && "text" in message;
}

bot.launch();

console.log("Bot is running...");
