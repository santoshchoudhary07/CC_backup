import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaTextComponent } from './ma-text.component';

describe('MaTextComponent', () => {
  let component: MaTextComponent;
  let fixture: ComponentFixture<MaTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
