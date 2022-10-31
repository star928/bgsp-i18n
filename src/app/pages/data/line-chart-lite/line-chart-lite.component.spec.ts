import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartLiteComponent } from './line-chart-lite.component';

describe('LineChartLiteComponent', () => {
  let component: LineChartLiteComponent;
  let fixture: ComponentFixture<LineChartLiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineChartLiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartLiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
