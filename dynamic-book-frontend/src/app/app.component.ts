import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly title = 'dynamic-book-frontend';
  isDarkTheme = false;

  constructor(
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    const storedPreference = localStorage.getItem('dynamic-book-theme');
    if (storedPreference) {
      this.isDarkTheme = storedPreference === 'dark';
    }

    this.applyTheme();
  }

  onThemeChange(isDark: boolean): void {
    this.isDarkTheme = isDark;
    localStorage.setItem('dynamic-book-theme', isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    const body = this.document.body;
    if (this.isDarkTheme) {
      this.renderer.addClass(body, 'dark-theme');
      this.renderer.removeClass(body, 'light-theme');
    } else {
      this.renderer.addClass(body, 'light-theme');
      this.renderer.removeClass(body, 'dark-theme');
    }
  }
}
