import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleMgmtComponent } from './pole-mgmt.component';

describe('PoleMgmtComponent', () => {
  let component: PoleMgmtComponent;
  let fixture: ComponentFixture<PoleMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoleMgmtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoleMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
