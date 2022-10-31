import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignageSettingComponent } from './signage-setting.component';

describe('SignageSettingComponent', () => {
  let component: SignageSettingComponent;
  let fixture: ComponentFixture<SignageSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignageSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignageSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
