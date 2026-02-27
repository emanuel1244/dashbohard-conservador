import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiderPanel } from './lider-panel';

describe('LiderPanel', () => {
  let component: LiderPanel;
  let fixture: ComponentFixture<LiderPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiderPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiderPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
