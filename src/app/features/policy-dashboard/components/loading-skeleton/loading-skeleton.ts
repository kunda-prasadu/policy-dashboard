import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.scss',
})
export class LoadingSkeleton {
  /** Used in @for to generate 10 placeholder rows */
  readonly rows = Array.from({ length: 10 }, (_, i) => i);
}
