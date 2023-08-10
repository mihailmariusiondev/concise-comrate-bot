import { CreateChatCompletionRequest } from "openai";
import { openAiApi, ERROR_SUMMARIZING, ContentType } from "../config";
import { detectLanguage } from "./detectLanguage";

export async function getSummary(contentToSummarize: string, contentType: ContentType = ContentType.GENERAL): Promise<string> {
  const language = detectLanguage(contentToSummarize);

  let systemMessage = "";
  if (contentType === ContentType.CHAT) {
    systemMessage = `You are an assistant helping friends catch up in a busy chat group. Your goal is to help friends in this group stay up to date without having to read all the messages.
      You will receive a recent conversation that happened in the group. Respond immediately with a short and concise summary of the conversation, capturing key details and significant events.
      - (PRIORITY) NEVER reference message IDs (e.g., #360).
      - Don't be too general, mention who said what`;
  } else if (contentType === ContentType.VIDEO) {
    systemMessage = `You are an assistant summarizing video content. Your goal is to provide a concise summary of the video.`;
  } else if (contentType === ContentType.GENERAL) {
    systemMessage = `You are an assistant tasked with summarizing general content. Provide a concise summary.`;
  }

  // Adding common characteristics for all content types
  systemMessage += `
    The summary should have the following characteristics:
    - (PRIORITY) Should be in ${language} language
    - Should have a tone that is similar to the conversation, act like you are part of the group
    - Use 3 sentences or less`;

  const payload: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: contentToSummarize,
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
