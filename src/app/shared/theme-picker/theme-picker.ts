import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService, THEME_PALETTES } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-picker',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="paletteMenu"
      matTooltip="Choose colour theme"
      aria-label="Choose colour theme">
      <mat-icon aria-hidden="true">palette</mat-icon>
    </button>

    <mat-menu #paletteMenu="matMenu" class="theme-picker-menu">
      <div class="theme-picker-menu__grid" (click)="$event.stopPropagation()">
        @for (p of palettes; track p.id) {
          <button
            class="theme-picker-menu__swatch"
            [class.theme-picker-menu__swatch--active]="themeService.palette() === p.id"
            [style.background]="p.swatch"
            [matTooltip]="p.label"
            [attr.aria-label]="p.label + (themeService.palette() === p.id ? ' (active)' : '')"
            [attr.aria-pressed]="themeService.palette() === p.id"
            (click)="themeService.setPalette(p.id)"
            type="button">
            @if (themeService.palette() === p.id) {
              <mat-icon class="theme-picker-menu__check" aria-hidden="true">check</mat-icon>
            }
          </button>
        }
      </div>
    </mat-menu>
  `,
  styles: [`
    ::ng-deep .theme-picker-menu {
      .mat-mdc-menu-panel {
        min-width: 0 !important;
        max-width: none !important;
        border-radius: 14px !important;
        border: 1px solid var(--mat-sys-outline-variant);
        box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
      }
      .mat-mdc-menu-content {
        padding: 0 !important;
      }
    }

    .theme-picker-menu__grid {
      display: grid;
      grid-template-columns: repeat(5, 22px);
      gap: 6px;
      padding: 10px;
    }

    .theme-picker-menu__swatch {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: border-color 0.15s, transform 0.15s;
      outline-offset: 2px;

      &:hover {
        transform: scale(1.18);
        border-color: var(--mat-sys-outline);
      }

      &:focus-visible {
        outline: 2px solid var(--mat-sys-primary);
      }

      &--active {
        border-color: var(--mat-sys-on-surface) !important;
        transform: scale(1.1);
      }
    }

    .theme-picker-menu__check {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      line-height: 1;
    }
  `],
})
export class ThemePickerComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly palettes = THEME_PALETTES;
}
