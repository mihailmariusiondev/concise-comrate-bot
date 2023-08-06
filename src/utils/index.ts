import { CreateChatCompletionRequest } from "openai";
import { BOT_COMMANDS, BOT_STATUS, ERROR_SUMMARIZING, BOT_REPLY, languageDetector, openAiApi } from "../config";
import { MessageData } from "../types";
import { chatState } from "../state";
import { Context } from "telegraf";

export async function getSummaryForChat(chatId: number): Promise<string> {
  const recentMessagesForChat = chatState[chatId]?.recentMessages;
  if (!recentMessagesForChat || recentMessagesForChat.length === 0) {
    return "No recent messages to summarize.";
  }

  const formattedMessages = recentMessagesForChat
    .map((message) => {
      if (message.reply_to && message.reply_to.id) {
        return `#${message.id} ${message.sender} (replying #${message.reply_to.id})`;
      }
      return `#${message.id} ${message.sender}: ${message.text}`;
    })
    .join(" | ");

  const language = detectLanguage(formattedMessages);

  const systemMessage = `You are an assistant helping friends catch up in a busy chat group. Your goal is to help friends in this group stay up to date without having to read all the messages.
    You will receive a recent conversation that happened in the group. Respond immediately with a short and concise summary of the conversation, capturing key details and significant events.
    The summary should have the following characteristics:
    - NEVER reference message IDs (e.g., #360).
    - Should be in ${language} language
    - Should have a tone that is similar to the conversation, act like you are part of the group
    - Use 3 sentences or less
    - Don't be too general, mention who said what`;

  const payload: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: formattedMessages,
      },
    ],
  };

  console.log("Payload being sent to OpenAI:", JSON.stringify(payload, null, 2));

  try {
    const response = await openAiApi.createChatCompletion(payload);
    const assistantMessage = response.data.choices?.[0]?.message?.content;
    return assistantMessage || ERROR_SUMMARIZING;
  } catch (error) {
    console.error("Error getting summary from OpenAI:", error);
    return ERROR_SUMMARIZING;
  }
}

export function detectLanguage(text: string): string {
  const result = languageDetector.detect(text, 1);
  return result[0]?.[0] || "english";
}

export function getBotStatusMessage(isBotEnabled: boolean): string {
  const status = isBotEnabled ? BOT_STATUS.ENABLED : BOT_STATUS.DISABLED;
  const command = isBotEnabled ? BOT_COMMANDS.DISABLE : BOT_COMMANDS.ENABLE;
  return `\n\nBot *${status}*, usa ${command} para ${isBotEnabled ? "desactivarlo" : "activarlo"}`;
}

export function createMessageData(sender: string, text: string, id: number, reply_to_id?: number): MessageData {
  return {
    sender,
    text,
    id,
    reply_to: reply_to_id ? { id: reply_to_id } : undefined,
  };
}

// This function checks if the bot is enabled for the specific chatId
export function checkBotEnabled(chatId: number, ctx: Context, includeReply: BOT_REPLY = BOT_REPLY.NO): boolean {
  if (!chatState[chatId]?.isBotEnabled) {
    if (includeReply == BOT_REPLY.YES) {
      const botStatusMessage = getBotStatusMessage(false);
      console.log(botStatusMessage);
      ctx.reply(botStatusMessage, { parse_mode: "Markdown" });
    }
    return false;
  }
  return true;
}
