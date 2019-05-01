import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallFormComponent } from './call-form.component';

describe('CallFormComponent', () => {
  let component: CallFormComponent;
  let fixture: ComponentFixture<CallFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
