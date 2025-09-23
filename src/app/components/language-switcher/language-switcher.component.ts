import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  LanguageDetectionService,
  Language,
} from '../../services/language-detection.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent implements OnInit {
  @Input() post: any;
  @Output() languageChanged = new EventEmitter<Language>();

  currentLanguage: Language = 'en';
  primaryLanguage: Language = 'en';
  alternativeLanguage: Language = 'vi';

  constructor(private languageDetection: LanguageDetectionService) {}

  ngOnInit(): void {
    this.initializeLanguages();
    this.loadUserPreference();
  }

  /**
   * Initialize language detection from post content
   */
  private initializeLanguages(): void {
    if (this.post?.content) {
      this.primaryLanguage = this.languageDetection.detectLanguage(
        this.post.content
      );
      this.alternativeLanguage = this.languageDetection.getOppositeLanguage(
        this.primaryLanguage
      );
    }
  }

  /**
   * Load user's preferred language from storage
   */
  private loadUserPreference(): void {
    const preferredLanguage = this.languageDetection.getPreferredLanguage();
    if (preferredLanguage && this.hasAlternativeContent) {
      this.currentLanguage = preferredLanguage;
    } else {
      this.currentLanguage = this.primaryLanguage;
    }
  }

  /**
   * Check if post has alternative content
   */
  get hasAlternativeContent(): boolean {
    return this.post?.alternativeContent?.trim()?.length > 0;
  }

  /**
   * Get the content to display based on current language
   */
  get displayContent(): string {
    if (this.currentLanguage === this.primaryLanguage) {
      return this.post.content || '';
    }
    return this.post.alternativeContent || this.post.content || '';
  }

  /**
   * Switch to specified language
   */
  switchLanguage(language: Language): void {
    if (language === this.currentLanguage) {
      return; // Already on this language
    }

    // If switching to alternative language but no alternative content exists,
    // stay on primary language
    if (language === this.alternativeLanguage && !this.hasAlternativeContent) {
      return;
    }

    this.currentLanguage = language;
    this.languageDetection.setPreferredLanguage(language);
    this.languageChanged.emit(language);
  }

  /**
   * Get display name for a language
   */
  getLanguageDisplayName(language: Language): string {
    return this.languageDetection.getLanguageDisplayName(language);
  }

  /**
   * Get flag emoji for a language
   */
  getLanguageFlag(language: Language): string {
    return this.languageDetection.getLanguageFlag(language);
  }

  /**
   * Check if a language is currently active
   */
  isLanguageActive(language: Language): boolean {
    return this.currentLanguage === language;
  }

  /**
   * Check if a language option should be disabled
   */
  isLanguageDisabled(language: Language): boolean {
    return language === this.alternativeLanguage && !this.hasAlternativeContent;
  }
}
