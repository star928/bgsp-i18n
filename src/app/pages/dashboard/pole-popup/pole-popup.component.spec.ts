import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolePopupComponent } from './pole-popup.component';

describe('PoleDialogComponent', () => {
  let component: PolePopupComponent;
  let fixture: ComponentFixture<PolePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
