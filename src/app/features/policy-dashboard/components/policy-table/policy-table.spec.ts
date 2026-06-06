import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyTable } from './policy-table';

describe('PolicyTable', () => {
  let component: PolicyTable;
  let fixture: ComponentFixture<PolicyTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
