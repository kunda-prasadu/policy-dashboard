import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryPannl } from './summary-pannl';

describe('SummaryPannl', () => {
  let component: SummaryPannl;
  let fixture: ComponentFixture<SummaryPannl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryPannl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryPannl);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
