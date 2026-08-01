import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BillyIconComponent,
  BillyIconName,
  ClickOutsideDirective,
  AutofocusDirective,
  EmailUtils,
  IbanUtils,
  VatUtils,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

const ICON_NAMES: BillyIconName[] = [
  'home', 'purchases', 'quotes', 'sales', 'services', 'calendar',
  'clients', 'account', 'peppol', 'bell', 'chevron-left', 'chevron-right', 'chevron-down',
  'sync', 'check', 'clock', 'search', 'dark-mode', 'logout', 'open', 'upload', 'plus',
  'close', 'refresh', 'bolt', 'lock', 'eye', 'eye-off',
  'stats', 'chart', 'pie-chart',
  'send', 'trash', 'download', 'magic',
  'file-text', 'file-binary', 'file-image', 'file-archive',
  'info', 'warning', 'error', 'bug', 'clipboard', 'link',
  'bank', 'bank-account', 'bank-statement', 'statement-line',
  'debit', 'credit', 'transfer', 'reconcile',
  'euro', 'coins', 'banknote', 'credit-card',
];

/** Interactive gallery of the icon set: adjustable size and stroke width. */
@Component({
  selector: 'demo-icon',
  imports: [FormsModule, BillyIconComponent, DemoStageComponent],
  template: `
    <demo-stage title="The full icon set" description="Hover a tile: each icon carries its own micro-animation." [center]="false">
      <div stage-controls class="icon-controls">
        <label>Size <input type="range" min="16" max="40" [(ngModel)]="size" /></label>
        <label>Stroke <input type="range" min="1" max="3" step="0.1" [(ngModel)]="stroke" /></label>
      </div>
      <div class="icon-grid">
        @for (name of icons; track name) {
          <button type="button" class="icon-tile" (click)="copy(name)" [title]="'<billy-icon name=&quot;' + name + '&quot; />'">
            <billy-icon [name]="name" [size]="size()" [strokeWidth]="stroke()" />
            <code>{{ copied() === name ? 'copied!' : name }}</code>
          </button>
        }
      </div>
    </demo-stage>
  `,
  styles: `
    .icon-controls {
      display: flex;
      gap: 16px;

      label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--billy-text-soft);
      }

      input { accent-color: var(--billy-accent); }
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
      gap: 10px;
    }

    .icon-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      border-radius: 12px;
      border: 1px solid var(--billy-surface-border);
      background: var(--site-card-bg);
      color: var(--billy-input-color);
      cursor: pointer;
      transition: transform .15s ease, border-color .15s ease, color .15s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: var(--billy-accent-border);
        color: var(--billy-accent-strong);
      }

      code {
        font-size: 10.5px;
        color: var(--billy-text-muted);
      }
    }
  `,
})
export class IconDemoComponent {

  readonly icons = ICON_NAMES;
  readonly size = signal(24);
  readonly stroke = signal(1.9);
  readonly copied = signal<string | null>(null);

  copy(name: string): void {
    void navigator.clipboard?.writeText(`<billy-icon name="${name}" />`);
    this.copied.set(name);
    setTimeout(() => this.copied.set(null), 1200);
  }

}

/** [clickOutside] : a panel that closes as soon as you click elsewhere. */
@Component({
  selector: 'demo-click-outside',
  imports: [ClickOutsideDirective, DemoStageComponent],
  template: `
    <demo-stage title="Close on outside click" description="The directive listens with a single document listener (zoneless-friendly) while [listenClickOutside] is true.">
      <div class="co-anchor" (clickOutside)="close()" [listenClickOutside]="open()">
        <button type="button" class="demo-btn--submit" (click)="open.set(!open())">
          {{ open() ? 'Panel open' : 'Open the panel' }}
        </button>
        @if (open()) {
          <div class="co-panel">
            Click anywhere <strong>outside</strong> this card: it closes.
            A click inside does not close it.
          </div>
        }
      </div>
      <div class="demo-note">Outside-click closes: <strong>{{ closeCount() }}</strong></div>
    </demo-stage>
  `,
  styles: `
    .co-anchor { position: relative; }

    .co-panel {
      position: absolute;
      top: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      width: 260px;
      padding: 14px 16px;
      font-size: 12.5px;
      line-height: 1.55;
      color: var(--billy-input-color);
      background: var(--billy-surface);
      border: 1px solid var(--billy-surface-border);
      border-radius: 12px;
      box-shadow: var(--billy-surface-shadow);
      z-index: 5;
      animation: coIn .18s ease;
    }

    @keyframes coIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `,
})
export class ClickOutsideDemoComponent {

  readonly open = signal(false);
  readonly closeCount = signal(0);

  close(): void {
    if (this.open()) {
      this.open.set(false);
      this.closeCount.update(count => count + 1);
    }
  }

}

/** [billyAutofocus] : the field grabs focus as soon as it appears. */
@Component({
  selector: 'demo-autofocus',
  imports: [AutofocusDirective, DemoStageComponent],
  template: `
    <demo-stage title="Automatic focus on display" description="Mount the field: it receives focus without any page-side code.">
      <div class="demo-form-block af-block">
        <button type="button" class="demo-btn" (click)="mounted.set(!mounted())">
          {{ mounted() ? 'Remove the field' : 'Show the field' }}
        </button>
        @if (mounted()) {
          <input class="demo-field" billyAutofocus placeholder="I just received focus" />
        }
      </div>
    </demo-stage>
  `,
  styles: `
    .af-block {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
  `,
})
export class AutofocusDemoComponent {
  readonly mounted = signal(false);
}

/** VatUtils / IbanUtils / EmailUtils : live validation. */
@Component({
  selector: 'demo-code-utils',
  imports: [FormsModule, DemoStageComponent],
  template: `
    <demo-stage title="The value utils, live" description="Belgian mod 97 check digit for VAT, ISO mod 97 for IBAN, diagnosis + domain suggestion for email." [center]="false">
      <div class="cu-grid">

        <div class="cu-block">
          <label class="cu-label">Belgian VAT number</label>
          <input class="demo-field" [ngModel]="vat()" (ngModelChange)="vat.set($event)" placeholder="BE 0123 456 749" />
          <div class="cu-verdict" [class.ok]="vatValid()" [class.ko]="vat() && !vatValid()">
            {{ vat() ? (vatValid() ? '✓ valid mod 97 check digit' : '✗ invalid check digit') : 'Enter a number…' }}
          </div>
        </div>

        <div class="cu-block">
          <label class="cu-label">IBAN</label>
          <input class="demo-field" [ngModel]="iban()" (ngModelChange)="iban.set($event)" placeholder="BE71 0961 2345 6769" />
          <div class="cu-verdict" [class.ok]="ibanValid()" [class.ko]="iban() && !ibanValid()">
            {{ iban() ? (ibanValid() ? '✓ valid ISO mod 97' : '✗ invalid IBAN') : 'Enter an IBAN…' }}
          </div>
        </div>

        <div class="cu-block">
          <label class="cu-label">Email</label>
          <input class="demo-field" [ngModel]="email()" (ngModelChange)="email.set($event)" placeholder="firstname@gmial.com" />
          <div class="cu-verdict" [class.ok]="emailValid()" [class.ko]="email() && !emailValid()">
            @if (!email()) { Enter an email… }
            @else if (emailSuggestion()) { 🤔 did you mean <strong>{{ emailSuggestion() }}</strong>? }
            @else if (emailValid()) { ✓ valid format }
            @else { ✗ invalid format }
          </div>
        </div>

      </div>
    </demo-stage>
  `,
  styles: `
    .cu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
    }

    .cu-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--billy-text-soft);
      margin-bottom: 6px;
    }

    .cu-verdict {
      margin-top: 8px;
      font-size: 12.5px;
      color: var(--billy-text-muted);

      &.ok { color: #16a34a; }
      &.ko { color: var(--billy-danger); }
    }
  `,
})
export class CodeUtilsDemoComponent {

  readonly vat = signal('');
  readonly iban = signal('');
  readonly email = signal('');

  readonly vatValid = computed(() => VatUtils.describe(this.vat()).status === 'valid');
  readonly ibanValid = computed(() => IbanUtils.isValid(this.iban()));
  readonly emailValid = computed(() => EmailUtils.isValid(this.email()));
  readonly emailSuggestion = computed(() => EmailUtils.suggest(this.email()));

}
