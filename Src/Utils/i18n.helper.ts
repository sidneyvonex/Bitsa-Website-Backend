import { Request } from "express";

// Supported languages
export type SupportedLanguage = "en" | "sw" | "fr" | "id" | "de" | "es" | "it" | "pt" | "ja";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "sw", "fr", "id", "de", "es", "it", "pt", "ja"];

/**
 * Get the user's preferred language from request
 * Priority: 
 * 1. Query parameter (?lang=sw)
 * 2. User's saved preference (from JWT)
 * 3. Accept-Language header
 * 4. Default to 'en'
 */
export const getUserLanguage = (req: Request): SupportedLanguage => {
  // 1. Check query parameter
  const queryLang = req.query.lang as string;
  if (queryLang && SUPPORTED_LANGUAGES.includes(queryLang as SupportedLanguage)) {
    return queryLang as SupportedLanguage;
  }

  // 2. Check user's saved preference from JWT
  const user = (req as any).user;
  if (user?.preferredLanguage && SUPPORTED_LANGUAGES.includes(user.preferredLanguage)) {
    return user.preferredLanguage;
  }

  // 3. Check Accept-Language header
  const acceptLanguage = req.headers["accept-language"];
  if (acceptLanguage) {
    const languages = acceptLanguage.split(",").map(lang => lang.split(";")[0].trim().toLowerCase().substring(0, 2));
    
    // Find first matching supported language
    for (const lang of languages) {
      if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
        return lang as SupportedLanguage;
      }
    }
  }

  // 4. Default to English
  return "en";
};

/**
 * Merge content with its translation
 * If translation exists in requested language, use it
 * Otherwise, fallback to original content
 */
export const mergeWithTranslation = <T extends Record<string, any>>(
  content: T,
  translation: any,
  language: SupportedLanguage
): T => {
  if (!translation || content.language === language) {
    // No translation needed or content is already in requested language
    return content;
  }

  // Merge translation fields with original content
  return {
    ...content,
    ...translation,
    originalLanguage: content.language,
    translatedTo: language,
  };
};

/**
 * Response helper to include supported languages info
 */
export const addLanguageMetadata = (data: any, currentLanguage: SupportedLanguage, hasTranslations: boolean = false) => {
  return {
    ...data,
    _language: {
      current: currentLanguage,
      supported: SUPPORTED_LANGUAGES,
      hasTranslations,
    },
  };
};
