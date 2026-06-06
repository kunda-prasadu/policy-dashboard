import { Component,inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { PolicyStore } from '../../store/policy.store';
import { PolicyStatus, Region, LineOfBussiness } from '../../models/policy.model';
import { POLICY_STATUSES, REGIONS, LINE_OF_BUSINESS } from '../../constants/policy.constants';

@Component({
  selector: 'app-policy-filter',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatOptionModule],
  templateUrl: './policy-filter.html',
  styleUrls: ['./policy-filter.scss'],
})
export class PolicyFilter {
  private fb: FormBuilder = inject(FormBuilder);
  // filterForm;
  readonly store = inject(PolicyStore);
  readonly statuses = POLICY_STATUSES;
  readonly regions = REGIONS;
  readonly lineOfBusiness = LINE_OF_BUSINESS;

  readonly filterForm = this.fb.group({
    searchTerm: [''],
    status: [''],
    region: [''],
    lineOfBusiness: [''],
  });
  constructor() {
    this.filterForm.valueChanges.subscribe((filters) => {
      this.store.updateFilters({
        searchTerm: filters.searchTerm ?? '',
        status: (filters.status ?? '') as PolicyStatus | '',
        region: (filters.region ?? '') as Region | '',
        lineOfBusiness: (filters.lineOfBusiness ?? '') as LineOfBussiness | '',
      });
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      status: '',
      region: '',
      lineOfBusiness: '',
    });
  }
}
