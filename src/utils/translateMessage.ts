import { translate } from '@vitalets/google-translate-api';

export async function translateMessage(text: string, targetLanguage: string): Promise<string> {
  try {
    const result = await translate(text, { to: targetLanguage });
    return result.text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Return original text if translation fails
  }
}