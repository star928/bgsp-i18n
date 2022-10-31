import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveEnergyComponent } from './save-energy.component';

describe('SaveEnergyComponent', () => {
  let component: SaveEnergyComponent;
  let fixture: ComponentFixture<SaveEnergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveEnergyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
