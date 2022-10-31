import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolderDataComponent } from './holder-data.component';

describe('HolderDataComponent', () => {
  let component: HolderDataComponent;
  let fixture: ComponentFixture<HolderDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolderDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HolderDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
