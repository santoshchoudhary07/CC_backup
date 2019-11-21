import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaUrlComponent } from './ma-url.component';

describe('MaUrlComponent', () => {
  let component: MaUrlComponent;
  let fixture: ComponentFixture<MaUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
