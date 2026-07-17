import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillyLayout } from './billy-layout';

describe('BillyLayout', () => {
  let component: BillyLayout;
  let fixture: ComponentFixture<BillyLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillyLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(BillyLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
