import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartLightComponent } from './smart-light.component';

describe('SmartLightComponent', () => {
  let component: SmartLightComponent;
  let fixture: ComponentFixture<SmartLightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartLightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartLightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
