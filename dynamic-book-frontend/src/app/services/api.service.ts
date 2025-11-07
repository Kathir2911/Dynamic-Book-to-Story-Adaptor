import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface ChapterSummary {
  number: number;
  title: string;
}

export interface BookDetail {
  id: string;
  title: string;
  author?: string;
  chapters: ChapterSummary[];
}

export interface ChapterResponse {
  number: number;
  title: string;
  content: string;
}

export interface GenerateStoryPayload {
  bookId: string;
  chapterNumber: number;
  scenarioText: string;
}

export interface GenerateStoryResponse {
  bookId: string;
  chapterNumber: number;
  originalText: string;
  generatedText: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly activeBookSubject = new BehaviorSubject<BookDetail | null>(null);

  readonly activeBook$ = this.activeBookSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  uploadBook(formData: FormData): Observable<BookDetail> {
    return this.http
      .post<BookDetail>(`${this.baseUrl}/upload`, formData)
      .pipe(tap((book) => this.activeBookSubject.next(book)));
  }

  listBooks(): Observable<BookDetail[]> {
    return this.http.get<BookDetail[]>(`${this.baseUrl}/books`);
  }

  getChapter(bookId: string, chapterNumber: number): Observable<ChapterResponse> {
    return this.http.get<ChapterResponse>(
      `${this.baseUrl}/books/${bookId}/chapters/${chapterNumber}`
    );
  }

  generateStory(
    bookId: string,
    chapterNumber: number,
    scenarioText: string
  ): Observable<GenerateStoryResponse> {
    const payload: GenerateStoryPayload = {
      bookId,
      chapterNumber,
      scenarioText
    };

    return this.http.post<GenerateStoryResponse>(`${this.baseUrl}/generate-story`, payload);
  }

  exportStory(bookId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export/${bookId}`, { responseType: 'blob' });
  }

  setActiveBook(book: BookDetail | null): void {
    this.activeBookSubject.next(book);
  }
}
