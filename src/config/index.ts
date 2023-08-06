import * as dotenv from "dotenv";
import LanguageDetect from "languagedetect";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

// Constants and environment variables
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const GPT_API_KEY = process.env.GPT_API_KEY;

// Bot commands
export const BOT_ENABLE_COMMAND = "/enable";
export const BOT_DISABLE_COMMAND = "/disable";

// Bot messages
export const START_MESSAGE = "¡Paisha crack! Vamos a resumir tus chats de mierda";
export const BOT_ENABLED_MESSAGE = "Bot activado";
// export const BOT_ALREADY_ENABLED_MESSAGE = "El bot ya está activado";
export const BOT_DISABLED_MESSAGE = "Bot desactivado";
// export const BOT_ALREADY_DISABLED_MESSAGE = "El bot ya está desactivado";
export const NOT_ENOUGH_MESSAGES_REPLY = "No hay suficientes mensajes para resumir. Necesito al menos 5 mensajes";
export const COOLDOWN_MESSAGE = "Machooo, espérate un poco antes de volver a usar el comando";
export const ERROR_SUMMARIZING = "Ya la hemos liao... Error al resumir los mensajes";

// Bot settings
export const MAX_CHAT_MESSAGES = 300;

// Bot status messages
export const BOT_STATUS_ENABLED = "activado";
export const BOT_STATUS_DISABLED = "desactivado";

if (!BOT_TOKEN || !GPT_API_KEY) {
  console.error("Environment variables BOT_TOKEN or GPT_API_KEY are not set.");
  process.exit(1);
}

export const configuration = new Configuration({
  apiKey: GPT_API_KEY,
});

export const openAiApi = new OpenAIApi(configuration);

export const languageDetector = new LanguageDetect();
