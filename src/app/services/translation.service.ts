import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Language } from './language-detection.service';
import { StorageService } from './storage/storage.service';

interface TranslationCache {
  [key: string]: string;
}

interface CodeBlock {
  index: number;
  content: string;
  placeholder: string;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private cache: TranslationCache = {};
  private readonly CACHE_PREFIX = 'translation_cache_';
  private readonly MAX_CACHE_SIZE = 1000;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.loadCacheFromStorage();
  }

  /**
   * Translate content from one language to another
   * @param content - Text to translate
   * @param fromLang - Source language
   * @param toLang - Target language
   * @returns Observable with translated content
   */
  translateContent(
    content: string,
    fromLang: Language,
    toLang: Language
  ): Observable<string> {
    if (!content || content.trim().length === 0) {
      return of('');
    }

    if (fromLang === toLang) {
      return of(content);
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(content, fromLang, toLang);

    // Check cache first
    if (this.cache[cacheKey]) {
      return of(this.cache[cacheKey]);
    }

    // Preserve code blocks and special formatting
    const { text, codeBlocks } = this.preserveCodeBlocks(content);

    // For now, we'll use a simple client-side approach
    // In production, you might want to use Google Translate API or similar
    return this.performTranslation(text, fromLang, toLang).pipe(
      map(translatedText => {
        const finalContent = this.restoreCodeBlocks(translatedText, codeBlocks);

        // Cache the result
        this.cache[cacheKey] = finalContent;
        this.saveCacheToStorage();

        return finalContent;
      }),
      catchError(error => {
        console.error('Translation error:', error);
        // Return original content if translation fails
        return of(content);
      })
    );
  }

  /**
   * Preserve code blocks and other special formatting during translation
   * @param content - Original content
   * @returns Object with text and extracted code blocks
   */
  private preserveCodeBlocks(content: string): {
    text: string;
    codeBlocks: CodeBlock[];
  } {
    const codeBlocks: CodeBlock[] = [];
    let index = 0;

    // Preserve markdown code blocks (```)
    let text = content.replace(/```[\s\S]*?```/g, match => {
      const placeholder = `__CODE_BLOCK_${index}__`;
      codeBlocks.push({ index, content: match, placeholder });
      index++;
      return placeholder;
    });

    // Preserve inline code (`)
    text = text.replace(/`[^`]+`/g, match => {
      const placeholder = `__INLINE_CODE_${index}__`;
      codeBlocks.push({ index, content: match, placeholder });
      index++;
      return placeholder;
    });

    // Preserve HTML tags
    text = text.replace(/<[^>]+>/g, match => {
      const placeholder = `__HTML_TAG_${index}__`;
      codeBlocks.push({ index, content: match, placeholder });
      index++;
      return placeholder;
    });

    // Preserve URLs
    text = text.replace(/https?:\/\/[^\s]+/g, match => {
      const placeholder = `__URL_${index}__`;
      codeBlocks.push({ index, content: match, placeholder });
      index++;
      return placeholder;
    });

    return { text, codeBlocks };
  }

  /**
   * Restore preserved code blocks back into translated text
   * @param text - Translated text with placeholders
   * @param codeBlocks - Array of preserved code blocks
   * @returns Text with code blocks restored
   */
  private restoreCodeBlocks(text: string, codeBlocks: CodeBlock[]): string {
    let result = text;

    codeBlocks.forEach(block => {
      result = result.replace(
        new RegExp(block.placeholder, 'g'),
        block.content
      );
    });

    return result;
  }

  /**
   * Perform the actual translation
   * For now using a mock translation - in production use Google Translate API
   * @param text - Text to translate
   * @param fromLang - Source language
   * @param toLang - Target language
   * @returns Observable with translated text
   */
  private performTranslation(
    text: string,
    fromLang: Language,
    toLang: Language
  ): Observable<string> {
    // Mock translation for development
    // In production, replace this with actual translation API call
    return new Observable(observer => {
      setTimeout(() => {
        // Simple mock: add language indicator
        const mockTranslated = `[${toLang.toUpperCase()} TRANSLATION] ${text}`;
        observer.next(mockTranslated);
        observer.complete();
      }, 1000); // Simulate API delay
    });

    // Example of how to integrate with Google Translate API:
    /*
    const translateRequest = {
      q: text,
      source: fromLang,
      target: toLang,
      format: 'text'
    };

    return this.http.post<any>('/api/translate', translateRequest).pipe(
      map(response => response.translatedText)
    );
    */
  }

  /**
   * Generate a cache key for the translation
   * @param content - Content to translate
   * @param fromLang - Source language
   * @param toLang - Target language
   * @returns Cache key string
   */
  private generateCacheKey(
    content: string,
    fromLang: Language,
    toLang: Language
  ): string {
    // Use first 100 characters + language pair as cache key
    const contentSample = content.substring(0, 100);
    return `${fromLang}-${toLang}-${btoa(contentSample).substring(0, 20)}`;
  }

  /**
   * Load translation cache from storage
   */
  private loadCacheFromStorage(): void {
    try {
      const stored = this.storageService.getItem(this.CACHE_PREFIX + 'data');
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load translation cache from storage:', error);
      this.cache = {};
    }
  }

  /**
   * Save translation cache to storage
   */
  private saveCacheToStorage(): void {
    try {
      // Limit cache size
      const cacheKeys = Object.keys(this.cache);
      if (cacheKeys.length > this.MAX_CACHE_SIZE) {
        // Remove oldest entries (simple FIFO)
        const keysToRemove = cacheKeys.slice(
          0,
          cacheKeys.length - this.MAX_CACHE_SIZE
        );
        keysToRemove.forEach(key => delete this.cache[key]);
      }

      this.storageService.setItem(
        this.CACHE_PREFIX + 'data',
        JSON.stringify(this.cache)
      );
    } catch (error) {
      console.warn('Failed to save translation cache to storage:', error);
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache = {};
    this.storageService.removeItem(this.CACHE_PREFIX + 'data');
  }

  /**
   * Get cache statistics
   * @returns Object with cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.cache).length,
      keys: Object.keys(this.cache),
    };
  }

  /**
   * Check if content can be translated
   * @param content - Content to check
   * @returns True if content is suitable for translation
   */
  canTranslate(content: string): boolean {
    if (!content || content.trim().length === 0) {
      return false;
    }

    // Don't translate very short content
    if (content.trim().length < 10) {
      return false;
    }

    // Don't translate content that's mostly code
    const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;
    const inlineCodeCount = (content.match(/`[^`]+`/g) || []).length;
    const totalLength = content.length;
    const codeLength =
      (content.match(/```[\s\S]*?```/g) || []).join('').length +
      (content.match(/`[^`]+`/g) || []).join('').length;

    // If more than 70% is code, don't auto-translate
    if (codeLength / totalLength > 0.7) {
      return false;
    }

    return true;
  }
}
