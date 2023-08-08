import LanguageDetect from "languagedetect";

export function detectLanguage(text: string): string {
  const languageDetector = new LanguageDetect();
  const result = languageDetector.detect(text, 1);
  return result[0]?.[0] || "english";
}
