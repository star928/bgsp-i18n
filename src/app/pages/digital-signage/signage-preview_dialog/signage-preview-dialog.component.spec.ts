import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignagePreviewDialogComponent } from './signage-preview-dialog.component';


describe('SignagePreviewDialogComponent', () => {
  let component: SignagePreviewDialogComponent;
  let fixture: ComponentFixture<SignagePreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignagePreviewDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignagePreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
