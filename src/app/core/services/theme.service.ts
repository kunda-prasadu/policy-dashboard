import { Injectable, signal, effect, inject } from '@angular/core';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark';

export type ThemePalette =
  | 'chubb-navy'
  | 'ocean-teal'
  | 'forest-green'
  | 'sunset-coral'
  | 'royal-violet'
  | 'midnight-slate'
  | 'rose-gold'
  | 'sapphire'
  | 'exec-charcoal'
  | 'copper-bronze';

export interface ThemePaletteConfig {
  id: ThemePalette;
  label: string;
  /** Hex swatch colour used in the theme-picker UI */
  swatch: string;
}

export const THEME_PALETTES: ThemePaletteConfig[] = [
  { id: 'chubb-navy',    label: 'Chubb Navy',        swatch: '#1B3A6B' },
  { id: 'midnight-slate',label: 'Midnight Slate',     swatch: '#1E293B' },
  { id: 'exec-charcoal', label: 'Executive Charcoal', swatch: '#374151' },
  { id: 'sapphire',      label: 'Sapphire Blue',      swatch: '#1D4ED8' },
  { id: 'ocean-teal',    label: 'Ocean Teal',         swatch: '#0D7377' },
  { id: 'forest-green',  label: 'Forest Green',       swatch: '#166534' },
  { id: 'royal-violet',  label: 'Royal Violet',       swatch: '#6D28D9' },
  { id: 'sunset-coral',  label: 'Sunset Coral',       swatch: '#C2410C' },
  { id: 'copper-bronze', label: 'Copper Bronze',      swatch: '#92400E' },
  { id: 'rose-gold',     label: 'Rose Gold',          swatch: '#BE185D' },
];

const VALID_PALETTES: ThemePalette[] = THEME_PALETTES.map(p => p.id);

const STORAGE_KEY  = 'preferred-theme';
const PALETTE_KEY  = 'preferred-palette';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage  = inject(StorageService);
  private readonly _theme   = signal<Theme>(this.resolveInitialTheme());
  private readonly _palette = signal<ThemePalette>(this.resolveInitialPalette());

  readonly theme   = this._theme.asReadonly();
  readonly palette = this._palette.asReadonly();
  readonly isDark  = () => this._theme() === 'dark';

  constructor() {
    effect(() => {
      const theme = this._theme();
      document.documentElement.classList.toggle('dark-theme', theme === 'dark');
      document.documentElement.style.colorScheme = theme;
      this.storage.set(STORAGE_KEY, theme);
    });

    effect(() => {
      const palette = this._palette();
      document.documentElement.setAttribute('data-palette', palette);
      this.storage.set(PALETTE_KEY, palette);
    });
  }

  toggle(): void {
    this._theme.update(current => (current === 'light' ? 'dark' : 'light'));
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  setPalette(palette: ThemePalette): void {
    this._palette.set(palette);
  }

  private resolveInitialTheme(): Theme {
    const stored = this.storage.get<Theme>(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private resolveInitialPalette(): ThemePalette {
    const stored = this.storage.get<ThemePalette>(PALETTE_KEY);
    return VALID_PALETTES.includes(stored as ThemePalette) ? (stored as ThemePalette) : 'chubb-navy';
  }
}
