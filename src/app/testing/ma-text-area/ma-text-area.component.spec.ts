import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaTextAreaComponent } from './ma-text-area.component';

describe('MaTextAreaComponent', () => {
  let component: MaTextAreaComponent;
  let fixture: ComponentFixture<MaTextAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaTextAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
