import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputLineComponent } from './input-line.component';

@Component({
  imports: [InputLineComponent],
  template: `
    <billy-input-line [label]="label()" [mandatory]="mandatory()" [info]="info()" [fieldId]="fieldId()">
      @if (showField()) {
        @switch (field()) {
          @case ('input') { <input type="text" class="form-control" /> }
          @case ('dropdown') {
            <button type="button" role="combobox">Belgium</button>
            @if (widgetOpen()) { <input type="text" class="search" /> }
          }
          @case ('aria-label') { <input type="text" aria-label="Choose a date" /> }
          @case ('two-inputs') {
            <input type="text" id="first" />
            <input type="text" id="second" />
          }
        }
      }
    </billy-input-line>
  `,
})
class HostComponent {
  readonly label = signal('Invoice label');
  readonly mandatory = signal(false);
  readonly info = signal('');
  readonly fieldId = signal('');
  readonly field = signal<'input' | 'dropdown' | 'aria-label' | 'two-inputs'>('input');
  readonly showField = signal(true);
  readonly widgetOpen = signal(false);
}

describe('InputLineComponent', () => {

  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const labelEl = (): HTMLLabelElement => fixture.nativeElement.querySelector('label');
  const control = (selector = 'input, button'): HTMLElement =>
    fixture.nativeElement.querySelector(selector);

  /** Renders, then lets the MutationObserver re-wire the freshly projected field. */
  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('names the projected field through the visible label', () => {
    expect(control().id).toBeTruthy();
    expect(labelEl().getAttribute('for')).toBe(control().id);
    expect(control().getAttribute('aria-labelledby')).toBe(labelEl().id);
  });

  it('keeps the value of a content-named trigger after the label', async () => {
    host.field.set('dropdown');
    await settle();

    const trigger = control('button');
    expect(trigger.getAttribute('aria-labelledby')).toBe(`${labelEl().id} ${trigger.id}`);
  });

  it('keeps the label on the trigger when the open widget adds inner controls', async () => {
    host.field.set('dropdown');
    await settle();
    const trigger = control('button');

    host.widgetOpen.set(true);
    await settle();

    expect(trigger.getAttribute('aria-labelledby')).toBe(`${labelEl().id} ${trigger.id}`);
    expect(labelEl().getAttribute('for')).toBe(trigger.id);
    expect(control('.search').hasAttribute('aria-labelledby')).toBe(false);
  });

  it('wins over a generic aria-label carried by the field', async () => {
    host.field.set('aria-label');
    await settle();

    expect(control().getAttribute('aria-labelledby')).toBe(labelEl().id);
  });

  it('exposes mandatory as aria-required and hides the decorative asterisk', () => {
    host.mandatory.set(true);
    fixture.detectChanges();
    expect(control().getAttribute('aria-required')).toBe('true');
    expect(labelEl().querySelector('.mandatory')?.getAttribute('aria-hidden')).toBe('true');

    host.mandatory.set(false);
    fixture.detectChanges();
    expect(control().hasAttribute('aria-required')).toBe(false);
  });

  it('describes the field with the info text', () => {
    host.info.set('Visible only to you.');
    fixture.detectChanges();

    const described = control().getAttribute('aria-describedby');
    expect(described).toBeTruthy();
    expect(fixture.nativeElement.querySelector(`#${described}`).textContent.trim())
      .toBe('Visible only to you.');
  });

  it('targets the requested control when fieldId is set', async () => {
    host.field.set('two-inputs');
    host.fieldId.set('second');
    await settle();

    expect(labelEl().getAttribute('for')).toBe('second');
    expect(fixture.nativeElement.querySelector('#first').hasAttribute('aria-labelledby')).toBe(false);
  });

  it('leaves no dangling for when no field is projected', async () => {
    host.showField.set(false);
    await settle();

    expect(labelEl().hasAttribute('for')).toBe(false);
  });

});
