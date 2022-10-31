import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoleBasicComponent } from './pole-basic.component';


describe('PoleBasicComponent', () => {
  let component: PoleBasicComponent;
  let fixture: ComponentFixture<PoleBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoleBasicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoleBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
