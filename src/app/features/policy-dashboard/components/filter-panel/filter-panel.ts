import { Component, inject, LOCALE_ID } from '@angular/core';
import { getCurrencySymbol } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { POLICY_STATUSES, REGIONS, LINE_OF_BUSINESS } from '../../constants/policy.constants';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatSliderModule,
    MatIconModule,
  ],
  templateUrl: './filter-panel.html',
  styleUrls: ['./filter-panel.scss'],
})
export class FilterPanel {
  private readonly sheetRef = inject(MatBottomSheetRef<FilterPanel>);
  private readonly fb       = inject(FormBuilder);
  private readonly locale   = inject(LOCALE_ID);
  readonly data             = inject(MAT_BOTTOM_SHEET_DATA);

  readonly statuses = POLICY_STATUSES;
  readonly regions  = REGIONS;
  readonly lobs     = LINE_OF_BUSINESS;

  readonly form = this.fb.group({
    startDate:      [this.data?.startDate      ?? null as Date | null],
    endDate:        [this.data?.endDate        ?? null as Date | null],
    status:         [this.data?.status         ?? ''],
    region:         [this.data?.region         ?? ''],
    lineOfBusiness: [this.data?.lineOfBusiness ?? ''],
    minPremium:     [this.data?.minPremium      ?? 0],
  });

  get premiumLabel(): string {
    const v = this.form.get('minPremium')?.value ?? 0;
    const sym = getCurrencySymbol('USD', 'narrow', this.locale as string);
    if (v >= 1_000_000) return `${sym}1M+`;
    if (v >= 1_000)     return `${sym}${Math.round(v / 1_000)}K`;
    return `${sym}${v}`;
  }

  apply(): void {
    this.sheetRef.dismiss(this.form.value);
  }

  reset(): void {
    this.sheetRef.dismiss('reset');
  }

  close(): void {
    this.sheetRef.dismiss();
  }
}
