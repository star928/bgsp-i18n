import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavePoleComponent } from './save-pole.component';

describe('UpdatePoleComponent', () => {
  let component: SavePoleComponent;
  let fixture: ComponentFixture<SavePoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavePoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavePoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
