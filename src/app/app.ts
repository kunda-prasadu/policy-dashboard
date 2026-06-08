import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from './core/services/theme.service';
import { ThemePickerComponent } from './shared/theme-picker/theme-picker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconButton, MatIconModule, MatTooltipModule, ThemePickerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly themeService = inject(ThemeService);
}
