import { Injectable } from '@angular/core';

interface ScriptConfig {
  src: string;
  id?: string;
  async?: boolean;
  defer?: boolean;
  onload?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ScriptLoaderService {
  private loadedScripts: Set<string> = new Set();
  private loadingScripts: Map<string, Promise<void>> = new Map();

  constructor() {}

  /**
   * Lazily load a script after a delay or on user interaction
   * @param config Script configuration
   * @param delayMs Delay in milliseconds before loading (default: 2000)
   */
  loadScriptLazy(config: ScriptConfig, delayMs: number = 2000): Promise<void> {
    // If already loaded, resolve immediately
    if (this.loadedScripts.has(config.src)) {
      return Promise.resolve();
    }

    // If currently loading, return existing promise
    if (this.loadingScripts.has(config.src)) {
      return this.loadingScripts.get(config.src)!;
    }

    const loadPromise = new Promise<void>((resolve, reject) => {
      // Wait for the delay
      setTimeout(() => {
        this.loadScript(config).then(resolve).catch(reject);
      }, delayMs);
    });

    this.loadingScripts.set(config.src, loadPromise);
    return loadPromise;
  }

  /**
   * Load a script immediately
   */
  private loadScript(config: ScriptConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists in DOM
      if (config.id && document.getElementById(config.id)) {
        this.loadedScripts.add(config.src);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = config.src;
      if (config.id) script.id = config.id;
      if (config.async !== undefined) script.async = config.async;
      if (config.defer !== undefined) script.defer = config.defer;

      script.onload = () => {
        this.loadedScripts.add(config.src);
        this.loadingScripts.delete(config.src);
        if (config.onload) config.onload();
        resolve();
      };

      script.onerror = () => {
        this.loadingScripts.delete(config.src);
        reject(new Error(`Failed to load script: ${config.src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load script on first user interaction
   */
  loadOnInteraction(config: ScriptConfig): void {
    const events = ['mousemove', 'scroll', 'keydown', 'click', 'touchstart'];
    const loadOnce = () => {
      events.forEach(event => document.removeEventListener(event, loadOnce));
      this.loadScript(config).catch(err =>
        console.error('Failed to load script on interaction:', err)
      );
    };
    events.forEach(event =>
      document.addEventListener(event, loadOnce, { once: true, passive: true })
    );
  }
}
