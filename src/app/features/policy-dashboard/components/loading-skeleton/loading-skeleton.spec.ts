import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoadingSkeleton } from './loading-skeleton';

describe('LoadingSkeleton', () => {
  let component: LoadingSkeleton;
  let fixture: ComponentFixture<LoadingSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSkeleton],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSkeleton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
