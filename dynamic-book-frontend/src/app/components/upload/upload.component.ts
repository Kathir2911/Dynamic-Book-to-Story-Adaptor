import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { ApiService, BookDetail } from '../../services/api.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  selectedFile: File | null = null;
  isUploading = false;
  uploadedBook?: BookDetail;

  constructor(
    private readonly apiService: ApiService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;

    if (file) {
      input.value = '';
    }
  }

  uploadBook(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Please choose a PDF before uploading.', 'Dismiss', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('book', this.selectedFile, this.selectedFile.name);

    this.isUploading = true;
    this.apiService
      .uploadBook(formData)
      .pipe(finalize(() => (this.isUploading = false)))
      .subscribe({
        next: (book) => {
          this.uploadedBook = book;
          this.selectedFile = null;
          this.apiService.setActiveBook(book);
          this.snackBar.open('Book uploaded successfully!', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Upload failed. Please try again.', 'Close', { duration: 4000 });
        }
      });
  }

  proceedToScenario(): void {
    if (!this.uploadedBook) {
      return;
    }

    this.router.navigate(['/scenario', this.uploadedBook.id]);
  }
}
