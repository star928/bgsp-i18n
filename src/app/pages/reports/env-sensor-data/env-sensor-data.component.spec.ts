import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvSensorDataComponent } from './env-sensor-data.component';

describe('EnvSensorDataComponent', () => {
  let component: EnvSensorDataComponent;
  let fixture: ComponentFixture<EnvSensorDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnvSensorDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvSensorDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
