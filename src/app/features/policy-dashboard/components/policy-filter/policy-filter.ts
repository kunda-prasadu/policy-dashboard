import { Component,inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PolicyStore } from '../../store/policy.store';
import { PolicyStatus, Region, LineOfBussiness } from '../../models/policy.model';
import { empty } from 'rxjs/internal/observable/empty';

@Component({
  selector: 'app-policy-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './policy-filter.html',
  styleUrls: ['./policy-filter.scss'],
})
export class PolicyFilter {
  filterForm;
  readonly store = inject(PolicyStore);
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      status: [''],
      region: [''],
      lineOfBusiness: [''],
    });
  }

  ngOnInit() {
    this.filterForm.valueChanges.subscribe((filters) => {
      this.store.updateFilters({
        searchTerm: filters.searchTerm ?? '',
        status: (filters.status ?? '') as PolicyStatus | '',
        region: (filters.region ?? '') as Region | '',
        lineOfBusiness: (filters.lineOfBusiness ?? '') as LineOfBussiness | '',
      });
    });
  }
}
