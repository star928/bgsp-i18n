import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveEnergyDataComponent } from './save-energy-data.component';

describe('SaveEnergyDataComponent', () => {
  let component: SaveEnergyDataComponent;
  let fixture: ComponentFixture<SaveEnergyDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveEnergyDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveEnergyDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
