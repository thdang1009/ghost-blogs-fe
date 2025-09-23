import { Injectable } from '@angular/core';
import { StorageService } from './storage/storage.service';

export type Language = 'en' | 'vi';

@Injectable({
  providedIn: 'root',
})
export class LanguageDetectionService {
  constructor(private storageService: StorageService) {}

  /**
   * Detect if text is primarily in Vietnamese or English
   * @param text - The text to analyze
   * @returns 'vi' for Vietnamese, 'en' for English
   */
  detectLanguage(text: string): Language {
    if (!text || text.trim().length === 0) {
      return 'en'; // Default to English for empty text
    }

    // Vietnamese characters with diacritics
    const vietnameseChars =
      /[àáảãạầấẩẫậằắẳẵặèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵđĐ]/;

    // Common Vietnamese words
    const vietnameseWords =
      /\b(và|của|trong|với|cho|từ|đến|được|có|là|một|này|đó|sẽ|đã|những|các|khi|để|sau|trước|giữa|theo|về|qua|tại|dưới|trên|ngoài|bên|cùng|nhau|rất|nhiều|ít|lớn|nhỏ|mới|cũ|tốt|xấu|đẹp|cao|thấp|nhanh|chậm|dễ|khó|xa|gần|nóng|lạnh|sáng|tối|ngày|đêm|năm|tháng|tuần|giờ|phút|giây|người|thời|gian|phần|việc|làm|biết|thấy|nói|đi|đến|lại|ra|vào|lên|xuống|hay|hoặc|nhưng|mà|nếu|thì|bởi|vì|tuy|nhiên|chỉ|cũng|đều|luôn|không|chưa|đang|sẽ|vừa|mới|đã|rồi)\b/gi;

    // Common English words
    const englishWords =
      /\b(the|be|to|of|and|a|in|that|have|i|it|for|not|on|with|he|as|you|do|at|this|but|his|by|from|they|she|or|an|will|my|one|all|would|there|their|what|so|up|out|if|about|who|get|which|go|me|when|make|can|like|time|no|just|him|know|take|people|into|year|your|good|some|could|them|see|other|than|then|now|look|only|come|its|over|think|also|back|after|use|two|how|our|work|first|well|way|even|new|want|because|any|these|give|day|most|us)\b/gi;

    // Check for Vietnamese characteristics
    const hasVietnameseChars = vietnameseChars.test(text);
    const vietnameseWordMatches = text.match(vietnameseWords) || [];
    const englishWordMatches = text.match(englishWords) || [];

    // Count total words (simple word count)
    const totalWords = text.split(/\s+/).filter(word => word.length > 0).length;

    // Calculate ratios
    const vietnameseWordRatio =
      vietnameseWordMatches.length / Math.max(totalWords, 1);
    const englishWordRatio =
      englishWordMatches.length / Math.max(totalWords, 1);

    // Decision logic
    if (hasVietnameseChars) {
      return 'vi';
    }

    if (vietnameseWordRatio > 0.1) {
      return 'vi';
    }

    if (englishWordRatio > vietnameseWordRatio) {
      return 'en';
    }

    // Default to Vietnamese if we have more Vietnamese words
    if (vietnameseWordRatio > 0.05) {
      return 'vi';
    }

    // Default to English
    return 'en';
  }

  /**
   * Get the opposite language
   * @param language - Current language
   * @returns Opposite language
   */
  getOppositeLanguage(language: Language): Language {
    return language === 'en' ? 'vi' : 'en';
  }

  /**
   * Get language display name
   * @param language - Language code
   * @returns Human readable language name
   */
  getLanguageDisplayName(language: Language): string {
    return language === 'en' ? 'English' : 'Tiếng Việt';
  }

  /**
   * Get language flag emoji
   * @param language - Language code
   * @returns Flag emoji
   */
  getLanguageFlag(language: Language): string {
    return language === 'en' ? '🇺🇸' : '🇻🇳';
  }

  /**
   * Store user's preferred language
   * @param language - Preferred language
   */
  setPreferredLanguage(language: Language): void {
    this.storageService.setItem('preferredLanguage', language);
  }

  /**
   * Get user's preferred language from storage
   * @returns Preferred language or null if not set
   */
  getPreferredLanguage(): Language | null {
    const stored = this.storageService.getItem('preferredLanguage');
    return stored === 'en' || stored === 'vi' ? stored : null;
  }

  /**
   * Remove stored language preference
   */
  clearPreferredLanguage(): void {
    this.storageService.removeItem('preferredLanguage');
  }
}
