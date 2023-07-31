import { Telegraf, Context } from "telegraf";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";

const BOT_TOKEN = "6610691916:AAHAVageSJ5M7wSb4PRZozgJmVcCTVWYaQk";
const GPT_API_KEY = "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";

const configuration = new Configuration({
  apiKey: GPT_API_KEY,
});
const openai = new OpenAIApi(configuration);

const bot = new Telegraf(BOT_TOKEN);

const recentMessages: { [chatId: number]: string[] } = {};
const lastCommandUsage: { [chatId: number]: number } = {};
const COMMAND_COOLDOWN = 60 * 1000; // 30 seconds in milliseconds

bot.start((ctx) => ctx.reply("Qué pasa crack! Soy tu fiel compi que resume conversaciones de telegram"));

bot.command("summarize", async (ctx: Context) => {
  const chatId = ctx.chat?.id;

  if (chatId) {
    const lastUsed = lastCommandUsage[chatId] || 0;
    const currentTime = Date.now();

    if (currentTime - lastUsed < COMMAND_COOLDOWN) {
      ctx.reply("Machooo espérate un poco antes de volver a usar el comando");
      return;
    }

    ctx.reply(await getSummaryForChat(ctx, 100));
    lastCommandUsage[chatId] = currentTime;
  }
});

bot.on("text", (ctx: Context) => {
  const chatId = ctx.chat?.id;
  const messageText = (ctx.message as { text: string }).text;

  if (chatId && messageText) {
    recentMessages[chatId] = [...(recentMessages[chatId] || []), messageText].slice(-100);
  }
});

async function getSummaryForChat(ctx: Context, count: number): Promise<string> {
  let messages: string[] = [];
  if (ctx.chat && typeof ctx.chat.id === "number") {
    messages = recentMessages[ctx.chat.id]?.slice(-count) || [];
  }

  const systemMessage: ChatCompletionRequestMessage = {
    role: "system" as ChatCompletionRequestMessageRoleEnum,
    content: `
    You are an assistant helping friends catch up in a busy chat group. Your goal is to help friends in this group stay up to date without having to read all the messages.
    You will receive a recent conversation that happened in the group. Respond immediately with a short and concise summary of the conversation.
    The summary should have the following characteristics:
    - Should be automatically translated to the language of the chat group
    - Should have a tone that is similar to the conversation, act like you are part of the group
    - Use 5 sentences or less
    - Don't be too general, mention who said what
    `,
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

    return completion.data?.choices[0]?.message?.content?.trim() || "Ya la hemos liao... Error al resumir los mensajes";
  } catch (error) {
    console.error("Ya la hemos liao... Error al resumir los mensajes", error);
    return "Ya la hemos liao... Error al resumir los mensajes";
  }
}

bot.launch();

console.log("Bot está corriendo...");
