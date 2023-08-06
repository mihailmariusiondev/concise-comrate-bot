import { CreateChatCompletionRequest } from "openai";
import { ERROR_SUMMARIZING, BOT_REPLY, languageDetector, openAiApi, NOT_STARTED_MESSAGE } from "../config";
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

export function createMessageData(sender: string, text: string, id: number, reply_to_id?: number): MessageData {
  return {
    sender,
    text,
    id,
    reply_to: reply_to_id ? { id: reply_to_id } : undefined,
  };
}

// This function checks if the bot is started for the specific chatId
export function checkBotStarted(chatId: number, ctx: Context, includeReply: BOT_REPLY = BOT_REPLY.NO): boolean {
  const isBotStarted = chatState[chatId]?.isBotStarted;
  if (!isBotStarted && includeReply === BOT_REPLY.YES) {
    console.log(NOT_STARTED_MESSAGE);
    ctx.reply(NOT_STARTED_MESSAGE, { parse_mode: "Markdown" });
  }

  return isBotStarted;
}
