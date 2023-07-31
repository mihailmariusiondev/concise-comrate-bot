import { Telegraf, Context } from "telegraf";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";

const BOT_TOKEN = "6610691916:AAHAVageSJ5M7wSb4PRZozgJmVcCTVWYaQk";
const GPT_API_KEY = "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";

const configuration = new Configuration({
  apiKey: GPT_API_KEY,
});
const openai = new OpenAIApi(configuration);

const bot = new Telegraf(BOT_TOKEN);

type MessageData = { sender: string; text: string };
const recentMessages: { [chatId: number]: MessageData[] } = {};
const lastCommandUsage: { [chatId: number]: number } = {};
const COMMAND_COOLDOWN = 60 * 1000; // 60 seconds in milliseconds

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
  const senderName = ctx.from?.first_name || "Unknown";

  if (chatId && messageText) {
    const messageData: MessageData = { sender: senderName, text: messageText };
    recentMessages[chatId] = [...(recentMessages[chatId] || []), messageData].slice(-100);
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

  // Log the entire payload being sent to OpenAI
  console.log("Payload being sent to OpenAI:", {
    model: "gpt-3.5-turbo",
    messages: [systemMessage, userMessage],
  });

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
