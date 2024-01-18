import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai"

export const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048
}

export const getSafetyConfig = (threshold: HarmBlockThreshold) => {
  return [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold
    }
  ]
}

export const getMessage = (str: string): string => {
  const messages: {
    [key: string]: string
  } = {
    SAFETY:
      "Oluşturulan cevap güvenlik ilkelerini ihlal etmesi nedeniyle görüntülenemiyor. Lütfen başka bir soru sorun veya odayı yaş sınırlı kanal olarak ayarlayın."
  }

  return messages[str] ?? "Üzgünüm, şu anda cevap veremiyorum."
}
