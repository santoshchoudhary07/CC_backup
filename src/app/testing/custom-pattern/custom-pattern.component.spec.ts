import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPatternComponent } from './custom-pattern.component';

describe('CustomPatternComponent', () => {
  let component: CustomPatternComponent;
  let fixture: ComponentFixture<CustomPatternComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomPatternComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
