import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  let component: ErrorState;
  let fixture: ComponentFixture<ErrorState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorState],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorState);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
