import { CreateChatCompletionRequest } from "openai";
import { ERROR_SUMMARIZING, languageDetector, openAiApi } from "../config";
import { recentMessages } from "../state";

export async function getSummaryForChat(chatId: number): Promise<string> {
  const recentMessagesForChat = recentMessages[chatId];
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
  return result[0][0] || "unknown";
}
