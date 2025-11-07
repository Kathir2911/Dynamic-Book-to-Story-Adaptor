import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, take } from 'rxjs/operators';

import {
  ApiService,
  BookDetail,
  ChapterResponse,
  GenerateStoryResponse
} from '../../services/api.service';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.scss']
})
export class ScenarioComponent implements OnInit {
  bookId!: string;
  book?: BookDetail;

  currentChapterIndex = 0;
  originalText = '';
  generatedText = '';
  scenarioText = '';

  chapterLoading = false;
  generationLoading = false;
  exportLoading = false;

  readonly scenarioPlaceholder = 'e.g. What if the antagonist secretly helped the hero from the beginning?';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const id = params.get('bookId');
      if (!id) {
        this.snackBar.open('No book was provided. Please upload a book first.', 'Dismiss', { duration: 4000 });
        return;
      }

      this.bookId = id;
      this.resolveBookContext();
    });
  }

  get currentChapter() {
    return this.book?.chapters[this.currentChapterIndex];
  }

  get canGoPrevious(): boolean {
    return !!this.book && this.currentChapterIndex > 0;
  }

  get canGoNext(): boolean {
    return !!this.book && this.currentChapterIndex < this.book.chapters.length - 1;
  }

  navigate(direction: 'previous' | 'next'): void {
    if (!this.book) {
      return;
    }

    const newIndex =
      direction === 'previous' ? this.currentChapterIndex - 1 : this.currentChapterIndex + 1;

    if (newIndex < 0 || newIndex >= this.book.chapters.length) {
      return;
    }

    this.loadChapter(newIndex);
  }

  generateStory(): void {
    if (!this.book || !this.currentChapter) {
      return;
    }

    if (!this.scenarioText.trim()) {
      this.snackBar.open('Please describe a scenario before generating a story.', 'Dismiss', { duration: 3000 });
      return;
    }

    this.generationLoading = true;
    this.apiService
      .generateStory(this.book.id, this.currentChapter.number, this.scenarioText.trim())
      .pipe(finalize(() => (this.generationLoading = false)))
      .subscribe({
        next: (response: GenerateStoryResponse) => {
          this.generatedText = response.generatedText;
          if (response.originalText) {
            this.originalText = response.originalText;
          }

          this.snackBar.open('Scenario generated successfully.', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Unable to generate a story. Please try again.', 'Close', { duration: 4000 });
        }
      });
  }

  exportStory(): void {
    if (!this.book) {
      return;
    }

    this.exportLoading = true;
    this.apiService
      .exportStory(this.book.id)
      .pipe(finalize(() => (this.exportLoading = false)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${this.book?.title ?? 'generated-story'}.pdf`;
          anchor.click();
          window.URL.revokeObjectURL(url);

          this.snackBar.open('Export started. Check your downloads.', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Export failed. Please try again.', 'Close', { duration: 4000 });
        }
      });
  }

  private resolveBookContext(): void {
    this.apiService.activeBook$.pipe(take(1)).subscribe((activeBook) => {
      if (activeBook && activeBook.id === this.bookId) {
        this.book = activeBook;
        this.loadChapter(0);
      } else {
        this.fetchBookFromServer();
      }
    });
  }

  private fetchBookFromServer(): void {
    this.apiService
      .listBooks()
      .pipe(take(1))
      .subscribe({
        next: (books) => {
          const matched = books.find((b) => b.id === this.bookId);
          if (!matched) {
            this.snackBar.open('Book not found. Please upload it again.', 'Dismiss', { duration: 4000 });
            return;
          }

          this.book = matched;
          this.apiService.setActiveBook(matched);
          this.loadChapter(0);
        },
        error: () => {
          this.snackBar.open('Unable to load the book metadata.', 'Dismiss', { duration: 4000 });
        }
      });
  }

  private loadChapter(index: number): void {
    if (!this.book) {
      return;
    }

    const chapter = this.book.chapters[index];
    if (!chapter) {
      return;
    }

    this.currentChapterIndex = index;
    this.chapterLoading = true;
    this.generatedText = '';

    this.apiService
      .getChapter(this.book.id, chapter.number)
      .pipe(finalize(() => (this.chapterLoading = false)))
      .subscribe({
        next: (response: ChapterResponse) => {
          this.originalText = response.content;
        },
        error: () => {
          this.snackBar.open('Unable to load the selected chapter.', 'Dismiss', { duration: 4000 });
        }
      });
  }
}
