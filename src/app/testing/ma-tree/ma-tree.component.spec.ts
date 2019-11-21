import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaTreeComponent } from './ma-tree.component';

describe('MaTreeComponent', () => {
  let component: MaTreeComponent;
  let fixture: ComponentFixture<MaTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
