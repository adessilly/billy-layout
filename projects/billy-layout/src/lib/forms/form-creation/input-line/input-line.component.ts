import { Component, DestroyRef, ElementRef, afterNextRender, afterRenderEffect, inject, input, signal } from '@angular/core';

let nextUniqueId = 0;

/** Native fields that take their accessible name from an associated `<label>`. */
const FIELD_SELECTOR = 'input:not([type="hidden"]), select, textarea';
/** Widget triggers to fall back on when no native field is projected (dropdown…). */
const WIDGET_SELECTOR = 'button, [role="combobox"], [role="listbox"], [contenteditable="true"]';
/** Elements a `<label for>` can legally point at. */
const LABELABLE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'METER', 'OUTPUT', 'PROGRESS']);
/** Roles whose accessible name comes from their own content (the current value). */
const CONTENT_NAMED_ROLES = new Set(['button', 'combobox']);

@Component({
    selector: 'billy-input-line',
    templateUrl: './input-line.component.html',
    styleUrls: ['./input-line.component.scss'],
    imports: []
})
export class InputLineComponent {

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  label = input('');
  mandatory = input(false);
  info = input('');
  nomarginbottom = input(false);
  /**
   * Id of the projected control to name. Left empty, the first projected field
   * is detected automatically — set it when the row holds several controls.
   */
  fieldId = input('');

  private readonly uid = `billy-input-line-${nextUniqueId++}`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly infoId = `${this.uid}-info`;
  /** Id the `<label for>` points at, empty while no labelable control is resolved. */
  protected readonly controlId = signal('');

  /** Control currently wired, kept to clean its attributes up when it changes. */
  private wired: HTMLElement | null = null;

  constructor() {
    // Re-wires after every render affected by these states.
    afterRenderEffect(() => {
      this.label();
      this.info();
      this.mandatory();
      this.fieldId();
      this.wireControl();
    });

    // Projected fields can appear later (@if, @for): re-wire on content changes.
    afterNextRender(() => {
      const observer = new MutationObserver(() => this.wireControl());
      observer.observe(this.host.nativeElement, { childList: true, subtree: true });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Associates the label, the info text and the required state with the projected control. */
  private wireControl(): void {
    const control = this.resolveControl();

    if (control !== this.wired) {
      this.releaseAttributes(this.wired);
      this.wired = control;
    }
    // A field carrying its own <label> (billy-input-password with a label) is
    // already named: adding ours would give it two labels.
    if (!control || this.hasForeignLabel(control)) {
      this.releaseAttributes(control);
      this.controlId.set('');
      return;
    }

    if (!control.id) control.id = this.uid;
    this.controlId.set(LABELABLE_TAGS.has(control.tagName) ? control.id : '');

    this.applyName(control);
    this.applyDescription(control);
    this.applyRequired(control);
  }

  /**
   * Keeps the control already wired as long as it is still projected: an open
   * widget can grow inner controls (the dropdown search box) that must not steal
   * the row label from its trigger.
   */
  private resolveControl(): HTMLElement | null {
    const current = this.wired;
    const explicit = this.fieldId();
    if (current && this.host.nativeElement.contains(current) && (!explicit || current.id === explicit)) {
      return current;
    }
    return this.findControl();
  }

  /** First projected field, or the widget trigger standing in for it. */
  private findControl(): HTMLElement | null {
    const host = this.host.nativeElement;
    const explicit = this.fieldId();
    if (explicit) return host.querySelector<HTMLElement>(`[id="${explicit.replace(/["\\]/g, '\\$&')}"]`);
    return host.querySelector<HTMLElement>(FIELD_SELECTOR) ?? host.querySelector<HTMLElement>(WIDGET_SELECTOR);
  }

  /**
   * Points the control at the visible label. `aria-labelledby` is used rather than
   * the sole `for`, so the row label also wins over a generic `aria-label` carried
   * by a library field (datepicker…) — the visible name is the authoritative one.
   */
  private applyName(control: HTMLElement): void {
    if (!this.owns(control, 'aria-labelledby')) return;
    if (!this.label()) {
      control.removeAttribute('aria-labelledby');
      return;
    }
    this.claim(control, 'aria-labelledby');
    // Controls named from their content (dropdown trigger…) keep it after the
    // label, so the current value is still announced.
    const contentNamed = control.tagName === 'BUTTON'
      || CONTENT_NAMED_ROLES.has(control.getAttribute('role') ?? '');
    control.setAttribute('aria-labelledby', contentNamed ? `${this.labelId} ${control.id}` : this.labelId);
  }

  /**
   * Exposes the `info` tooltip — mouse-only as a native `title` — to assistive tech.
   * Appended to any description the field already carries (the validation message
   * of a code field) rather than replacing it.
   */
  private applyDescription(control: HTMLElement): void {
    const kept = (control.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(id => id && id !== this.infoId);
    const ids = this.info() ? [...kept, this.infoId] : kept;

    if (ids.length) control.setAttribute('aria-describedby', ids.join(' '));
    else control.removeAttribute('aria-describedby');
  }

  /** True when a `<label>` other than this row's already names the control. */
  private hasForeignLabel(control: HTMLElement): boolean {
    const labels = (control as HTMLInputElement).labels;
    return !!labels && Array.from(labels).some(label => label.id !== this.labelId);
  }

  /** Conveys the asterisk, which is decorative, as a machine-readable state. */
  private applyRequired(control: HTMLElement): void {
    if (!this.owns(control, 'aria-required')) return;
    if (!this.mandatory()) {
      control.removeAttribute('aria-required');
      return;
    }
    this.claim(control, 'aria-required');
    control.setAttribute('aria-required', 'true');
  }

  /** True when the attribute is absent or was set by this row — a consumer value wins. */
  private owns(control: HTMLElement, attribute: string): boolean {
    return !control.hasAttribute(attribute) || control.dataset[this.ownerKey(attribute)] === this.uid;
  }

  private claim(control: HTMLElement, attribute: string): void {
    control.dataset[this.ownerKey(attribute)] = this.uid;
  }

  /** `aria-labelledby` → `data-billy-line-aria-labelledby` (camelCase dataset key). */
  private ownerKey(attribute: string): string {
    return `billyLine${attribute.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase())}`;
  }

  private releaseAttributes(control: HTMLElement | null): void {
    if (!control) return;
    for (const attribute of ['aria-labelledby', 'aria-required']) {
      if (control.dataset[this.ownerKey(attribute)] !== this.uid) continue;
      control.removeAttribute(attribute);
      delete control.dataset[this.ownerKey(attribute)];
    }
    // Only our own id is pulled out of the description: the rest belongs to the field.
    const kept = (control.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(id => id && id !== this.infoId);
    if (kept.length) control.setAttribute('aria-describedby', kept.join(' '));
    else control.removeAttribute('aria-describedby');

    if (control.id === this.uid) control.removeAttribute('id');
  }

}
