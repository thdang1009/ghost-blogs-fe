import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {
  LanguageDetectionService,
  Language,
} from '../../services/language-detection.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent implements OnInit {
  @Input() post: any;
  @Output() languageChanged = new EventEmitter<Language>();
  @Output() contentUpdated = new EventEmitter<any>();

  currentLanguage: Language = 'en';
  primaryLanguage: Language = 'en';
  alternativeLanguage: Language = 'vi';
  isTranslating = false;

  constructor(
    private languageDetection: LanguageDetectionService,
    private translationService: TranslationService
  ) {}

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
   * Handle click on alternative language button
   */
  async handleAlternativeLanguageClick(): Promise<void> {
    if (this.isAlternativeLanguageDisabled()) {
      return; // Do nothing if disabled
    }

    if (this.hasAlternativeContent) {
      this.switchLanguage(this.alternativeLanguage);
    } else {
      await this.autoTranslateAndSwitch();
    }
  }

  /**
   * Check if alternative language button should be disabled
   */
  isAlternativeLanguageDisabled(): boolean {
    // Disable if there's no alternativeContent AND no primary content to translate from
    return (
      !this.hasAlternativeContent || !this.post?.alternativeContent?.trim()
    );
  }
  /**
   * Get tooltip text for alternative language button
   */
  getButtonTooltip(): string {
    if (this.isTranslating) {
      return 'Translating...';
    }
    if (this.isAlternativeLanguageDisabled()) {
      return 'No content available to translate';
    }
    if (this.hasAlternativeContent) {
      return `Switch to ${this.languageDetection.getLanguageDisplayName(this.alternativeLanguage)}`;
    }
    return `Translate to ${this.languageDetection.getLanguageDisplayName(this.alternativeLanguage)}`;
  }

  /**
   * Auto-translate content and switch to alternative language
   */
  private async autoTranslateAndSwitch(): Promise<void> {
    if (!this.post?.content?.trim()) {
      return;
    }

    if (!this.translationService.canTranslate(this.post.content)) {
      return;
    }

    this.isTranslating = true;

    try {
      const translatedContent = await this.translationService
        .translateContent(
          this.post.content,
          this.primaryLanguage,
          this.alternativeLanguage
        )
        .toPromise();

      if (translatedContent) {
        this.post.alternativeContent = translatedContent;
        this.switchLanguage(this.alternativeLanguage);
        // Emit the updated post data
        this.contentUpdated.emit(this.post);
      }
    } catch (error) {
      console.error('Auto-translation failed:', error);
    } finally {
      this.isTranslating = false;
    }
  }
}
