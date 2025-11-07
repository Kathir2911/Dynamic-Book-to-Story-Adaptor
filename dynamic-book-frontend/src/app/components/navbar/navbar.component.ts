import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() isDarkTheme = false;
  @Output() themeChange = new EventEmitter<boolean>();

  activeBookId: string | null = null;

  private subscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.subscription = this.apiService.activeBook$.subscribe((book) => {
      this.activeBookId = book?.id ?? null;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeChange.emit(!this.isDarkTheme);
  }

  goToGeneratedStories(): void {
    if (this.activeBookId) {
      this.router.navigate(['/scenario', this.activeBookId]);
    } else {
      this.router.navigate(['/upload']);
    }
  }
}
