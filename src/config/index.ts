import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

// Constants and environment variables
export const MAX_CHAT_MESSAGES = 300;
export const MAX_MESSAGE_LENGTH = 100;
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const GPT_API_KEY = process.env.GPT_API_KEY;

// Constants reply messages
export const START_MESSAGE = "¡Qué pasa crack! Vamos a resumir tu mierda de chats de Telegram";
export const BOT_ALREADY_ENABLED_MESSAGE = "El bot ya está activado.";
export const BOT_ENABLED_MESSAGE = "¡Bot activado!";
export const BOT_ALREADY_DISABLED_MESSAGE = "El bot ya está desactivado.";
export const BOT_DISABLED_MESSAGE = "¡Bot desactivado!";
export const BOT_NOT_ENABLED_REPLY = "El bot está desactivado. Usa /enable para activarlo.";
export const NOT_ENOUGH_MESSAGES_REPLY = "No hay suficientes mensajes para resumir. Necesito al menos 5 mensajes.";
export const COOLDOWN_MESSAGE = "Machooo, espérate un poco antes de volver a usar el comando";
export const ERROR_SUMMARIZING = "Ya la hemos liao... Error al resumir los mensajes";

if (!BOT_TOKEN || !GPT_API_KEY) {
  console.error("Environment variables BOT_TOKEN or GPT_API_KEY are not set.");
  process.exit(1);
}

export const configuration = new Configuration({
  apiKey: GPT_API_KEY,
});

export const openAiApi = new OpenAIApi(configuration);
