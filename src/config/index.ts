import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { Telegraf } from "telegraf";

dotenv.config();

export enum IncludeBotReply {
  YES,
  NO,
}

export enum ContentType {
  CHAT = "chat",
  VIDEO = "video",
  GENERAL = "general",
}

// Constants and environment variables
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const GPT_API_KEY = process.env.GPT_API_KEY;

// Bot messages
export const START_MESSAGE_REPLY = "Qué pasa crackovich, vamos a resumir tus chats de mierda";
export const NOT_STARTED_MESSAGE_REPLY = "El bot no está iniciado. Usa */start* para iniciar el bot.";
export const NOT_ENOUGH_MESSAGES_REPLY = "No hay suficientes mensajes para resumir. Necesito al menos 5 mensajes";
export const COOLDOWN_MESSAGE_REPLY = "Machooo, espérate un poco antes de volver a usar el comando";
export const ERROR_SUMMARIZING = "Ya la hemos liao... Error al resumir los mensajes";

// Bot settings
export const MAX_CHAT_MESSAGES = 300;
export const COMMAND_COOLDOWN = 60 * 1000;

// Regex
export const YOUTUBE_URL_REGEX = /(?:\/|%3D|v=|vi=)([0-9A-z-_]{11})(?:[%#?&]|$)/;

if (!BOT_TOKEN || !GPT_API_KEY) {
  console.error("Environment variables BOT_TOKEN or GPT_API_KEY are not set.");
  process.exit(1);
}

export const openAiConfiguration = new Configuration({
  apiKey: GPT_API_KEY,
});

export const openAiApi = new OpenAIApi(openAiConfiguration);

export const bot = new Telegraf(BOT_TOKEN!);
