import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BulkActionBar } from './bulk-action-bar';
import { PolicyStore } from '../../store/policy.store';

describe('BulkActionBar', () => {
  let component: BulkActionBar;
  let fixture: ComponentFixture<BulkActionBar>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let storeSpy: jasmine.SpyObj<PolicyStore>;

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    storeSpy = jasmine.createSpyObj('PolicyStore', ['flagSelectedPolicies'], {
      selectedCount: jasmine.createSpy().and.returnValue(1),
      hasSelection: jasmine.createSpy().and.returnValue(true),
    });

    await TestBed.configureTestingModule({
      imports: [BulkActionBar],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatSnackBar,   useValue: snackBarSpy },
        { provide: PolicyStore,   useValue: storeSpy   },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(BulkActionBar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('flagForReview', () => {
    it('calls store.flagSelectedPolicies()', () => {
      component.flagForReview();
      expect(storeSpy.flagSelectedPolicies).toHaveBeenCalledOnceWith();
    });

    it('shows singular snackbar message when 1 policy is selected', () => {
      (storeSpy.selectedCount as jasmine.Spy).and.returnValue(1);
      component.flagForReview();
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        '1 policy flagged for review', 'Dismiss',
        jasmine.objectContaining({ duration: 4000 })
      );
    });

    it('shows plural snackbar message when multiple policies are selected', () => {
      (storeSpy.selectedCount as jasmine.Spy).and.returnValue(5);
      component.flagForReview();
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        '5 policies flagged for review', 'Dismiss',
        jasmine.anything()
      );
    });
  });
});
