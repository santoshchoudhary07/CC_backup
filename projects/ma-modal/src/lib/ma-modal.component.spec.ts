import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaModalComponent } from './ma-modal.component';

describe('MaModalComponent', () => {
  let component: MaModalComponent;
  let fixture: ComponentFixture<MaModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
