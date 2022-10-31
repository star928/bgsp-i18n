import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartLightDataComponent } from './smart-light-data.component';

describe('SmartLightDataComponent', () => {
  let component: SmartLightDataComponent;
  let fixture: ComponentFixture<SmartLightDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartLightDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartLightDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
