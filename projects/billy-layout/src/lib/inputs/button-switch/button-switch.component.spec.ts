import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonSwitchComponent } from './button-switch.component';

describe('ButtonSwitchComponent', () => {

  let fixture: ComponentFixture<ButtonSwitchComponent>;
  let component: ButtonSwitchComponent;

  const button = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonSwitchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('writeValue reflects the form value in the DOM', () => {
    component.writeValue(true);
    fixture.detectChanges();
    expect(component.checked()).toBe(true);
    expect(button().classList.contains('bsw--on')).toBe(true);
    expect(button().getAttribute('aria-checked')).toBe('true');

    component.writeValue(null);
    fixture.detectChanges();
    expect(component.checked()).toBe(false);
    expect(button().getAttribute('aria-checked')).toBe('false');
  });

  it('a click toggles and notifies the registered onChange', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);

    button().click();
    expect(component.checked()).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);

    button().click();
    expect(component.checked()).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('toggling marks the control as touched and emits valueChange', () => {
    const onTouched = vi.fn();
    const emitted: boolean[] = [];
    component.registerOnTouched(onTouched);
    component.valueChange.subscribe(value => emitted.push(value));

    button().click();
    expect(onTouched).toHaveBeenCalledTimes(1);
    expect(emitted).toEqual([true]);
  });

  it('setDisabledState blocks toggling', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    component.setDisabledState(true);
    fixture.detectChanges();

    expect(button().disabled).toBe(true);
    component.toggle();
    expect(component.checked()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('the disabled input blocks toggling too', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    component.toggle();
    expect(component.checked()).toBe(false);
    expect(button().classList.contains('bsw--disabled')).toBe(true);
  });

  it('space and enter toggle the switch', () => {
    button().dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
    expect(component.checked()).toBe(true);

    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    expect(component.checked()).toBe(false);

    button().dispatchEvent(new KeyboardEvent('keydown', { key: 'a', cancelable: true }));
    expect(component.checked()).toBe(false);
  });

});
