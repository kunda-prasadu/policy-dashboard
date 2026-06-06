import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyDashboard } from './policy-dashboard';

describe('PolicyDashboard', () => {
  let component: PolicyDashboard;
  let fixture: ComponentFixture<PolicyDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
