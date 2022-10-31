import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvSensorComponent } from './env-sensor.component';

describe('EnvSensorComponent', () => {
  let component: EnvSensorComponent;
  let fixture: ComponentFixture<EnvSensorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnvSensorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
