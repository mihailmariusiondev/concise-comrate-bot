
import { Telegraf, Context } from "telegraf";
import axios from "axios";

const BOT_TOKEN = "6610691916:AAHAVageSJ5M7wSb4PRZozgJmVcCTVWYaQk";
const GPT_API_ENDPOINT = "https://api.openai.com/v1/engines/davinci/completions";
const GPT_API_KEY = "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";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Welcome to the Summary Bot!"));

bot.command('summarize', async (ctx: Context) => {
    const messages = await fetchRecentMessages(ctx, 50);
    const summary = await getSummary(messages);
    ctx.reply(summary);
});

bot.command('summarize_100', async (ctx: Context) => {
    const messages = await fetchRecentMessages(ctx, 100);
    const summary = await getSummary(messages);
    ctx.reply(summary);
});

async function fetchRecentMessages(ctx: Context, count: number): Promise<string[]> {
    // TODO: Fetch the recent messages (up to the specified count) from the Telegram chat.
    // This is a placeholder and might need adjustments based on the Telegram API's capabilities and the Telegraf library.
    const messages: string[] = [];
    return messages;
}

async function getSummary(messages: string[]): Promise<string> {
    // Send the messages to the OpenAI API for summarization.
    const response = await axios.post(GPT_API_ENDPOINT, {
        prompt: messages.join("\n"),
        max_tokens: 150
    }, {
        headers: {
            'Authorization': `Bearer ${GPT_API_KEY}`
        }
    });

    return response.data.choices[0].text.trim();
}

bot.launch();

console.log("Bot is running...");
