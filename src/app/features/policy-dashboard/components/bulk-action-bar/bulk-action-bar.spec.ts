import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkActionBar } from './bulk-action-bar';

describe('BulkActionBar', () => {
  let component: BulkActionBar;
  let fixture: ComponentFixture<BulkActionBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkActionBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkActionBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
