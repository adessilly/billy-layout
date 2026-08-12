import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BillyButtonColor,
  ButtonSwitchComponent,
  ConsultLineComponent,
  DropdownComponent,
  DropdownOption,
  FormSidePanelComponent,
  InputLineComponent,
  InputPrefixSuffixComponent,
  LabelClipboardComponent,
  SaveBarComponent,
  ToastrService,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';
import { DemoLocaleToggleComponent } from './demo-locale-toggle.component';

/** billy-input-line : the label + projected field row. */
@Component({
  selector: 'demo-input-line',
  imports: [FormsModule, InputLineComponent, DemoStageComponent],
  template: `
    <demo-stage title="The canonical form row" description="Label, mandatory asterisk, tooltip: the field is projected inside. The label names it — click a label to focus its field." [center]="false">
      <div class="demo-form-block il-center">
        <billy-input-line label="Invoice label" [mandatory]="true">
          <input class="demo-field" [(ngModel)]="label" placeholder="July services" />
        </billy-input-line>
        <billy-input-line label="Internal reference" info="Visible only to you, never on the invoice.">
          <input class="demo-field" [(ngModel)]="reference" placeholder="2026-042" />
        </billy-input-line>
        <billy-input-line label="Payment deadline" fieldId="il-demo-days">
          <span class="il-inline">
            <input id="il-demo-days" class="demo-field il-days" type="number" [(ngModel)]="days" placeholder="30" />
            <span>days after issue</span>
          </span>
        </billy-input-line>
      </div>
    </demo-stage>
  `,
  styles: `
    .il-center { margin: 0 auto; }
    .il-inline { display: flex; align-items: center; gap: 8px; }
    .il-days { width: 90px; }
  `,
})
export class InputLineDemoComponent {
  readonly label = signal('');
  readonly reference = signal('');
  readonly days = signal<number | null>(null);
}

/** billy-consult-line : the read-only counterpart. */
@Component({
  selector: 'demo-consult-line',
  imports: [ConsultLineComponent, DemoStageComponent],
  template: `
    <demo-stage title="Read without editing" description="Same template as input-line, but for consult screens." [center]="false">
      <div class="demo-form-block cl-center">
        <billy-consult-line label="Client">Billy SPRL</billy-consult-line>
        <billy-consult-line label="Amount incl. VAT">€1,210.00</billy-consult-line>
        <billy-consult-line label="Due date">31/07/2026</billy-consult-line>
      </div>
    </demo-stage>
  `,
  styles: `.cl-center { margin: 0 auto; }`,
})
export class ConsultLineDemoComponent {}

/** billy-input-prefix-suffix : field group + clickable addons. */
@Component({
  selector: 'demo-input-prefix-suffix',
  imports: [FormsModule, InputPrefixSuffixComponent, InputLineComponent, DemoStageComponent],
  template: `
    <demo-stage title="Attached prefixes and suffixes" description="Clickable addons emit prefixClick / suffixClick — here the suffix clears the field." [center]="false">
      <div class="demo-form-block ips-center">
        <billy-input-line label="Amount excl. VAT">
          <billy-input-prefix-suffix suffix="€ excl. VAT">
            <input class="demo-field" type="number" [(ngModel)]="amount" placeholder="0.00" />
          </billy-input-prefix-suffix>
        </billy-input-line>
        <billy-input-line label="Website">
          <billy-input-prefix-suffix prefix="https://" suffixIcon="fa-solid fa-xmark" [suffixClickable]="true" (suffixClick)="site.set('')">
            <input class="demo-field" [(ngModel)]="site" placeholder="billy.be" />
          </billy-input-prefix-suffix>
        </billy-input-line>
      </div>
    </demo-stage>
  `,
  styles: `.ips-center { margin: 0 auto; }`,
})
export class InputPrefixSuffixDemoComponent {
  readonly amount = signal<number | null>(null);
  readonly site = signal('');
}

/** billy-label-clipboard : copyable label. */
@Component({
  selector: 'demo-label-clipboard',
  imports: [LabelClipboardComponent, DemoStageComponent],
  template: `
    <demo-stage title="Copy with one click" description="Click the value: it goes to the clipboard with visual feedback.">
      <div class="lc-col">
        <billy-label-clipboard label="BE71 0961 2345 6769" />
        <billy-label-clipboard label="invoice-2026-042" />
      </div>
    </demo-stage>
  `,
  styles: `
    .lc-col { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  `,
})
export class LabelClipboardDemoComponent {}

/** billy-save-bar : the conclusion of every form. */
@Component({
  selector: 'demo-save-bar',
  imports: [SaveBarComponent, DropdownComponent, ButtonSwitchComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Save / Cancel" description="Buttons delegated to billy-button (tinted plain + ghost). disabled = form validity, loading = request in flight (the label switches and clicks are neutralized). In a dialog footer, add class='no-theme'." [center]="false">
      <demo-locale-toggle stage-controls />
      <div stage-controls class="sb-controls">
        <label>
          <billy-button-switch [disabled]="loading()" (valueChange)="disabled.set($event)" />
          disabled
        </label>
        <label>
          <billy-button-switch (valueChange)="noTheme.set($event)" />
          no-theme
        </label>
        <label class="sb-control--color">
          colorSave
          <billy-dropdown
            [values]="colorOptions"
            [searchable]="false"
            (selectionChange)="colorSave.set($event)" />
        </label>
      </div>
      <div class="sb-frame" [class.sb-frame--flat]="noTheme()">
        <billy-save-bar
          [class.no-theme]="noTheme()"
          [disabled]="disabled()"
          [loading]="loading()"
          [colorSave]="colorSave()"
          (save)="fakeSave()"
          (cancel)="toastr.info('Going back (simulated).', 'Cancel')" />
      </div>
    </demo-stage>
  `,
  styles: `
    .sb-controls {
      display: flex;
      gap: 14px;

      label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--billy-text-soft);
      }

      input { accent-color: var(--billy-accent); }
    }

    .sb-frame {
      border: 1px dashed var(--billy-surface-border);
      border-radius: 12px;
      padding: 10px;

      &--flat { background: var(--billy-section-bg); }
    }
  `,
})
export class SaveBarDemoComponent {

  readonly toastr = inject(ToastrService);
  readonly disabled = signal(false);
  readonly noTheme = signal(false);
  readonly loading = signal(false);
  readonly colorSave = signal<BillyButtonColor>('primary');
  // 'primary' first: the dropdown shows the 1st option as long as no value
  // is written, which must match the colorSave default.
  readonly colorOptions: DropdownOption[] = (
    ['primary', 'neutral', 'info', 'warning', 'error'] as BillyButtonColor[]
  ).map(c => ({ id: c, text: c, value: c }));

  fakeSave(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.toastr.success('The sample form was saved.', 'Saved');
    }, 1400);
  }

}

/** billy-form-side-panel : side panel with overlay. */
@Component({
  selector: 'demo-form-side-panel',
  imports: [FormsModule, SaveBarComponent, FormSidePanelComponent, InputLineComponent, DemoStageComponent],
  template: `
    <demo-stage title="The side panel" description="Overlay + scroll lock, closes on backdrop click (overlayClick). The footer uses a save-bar in no-theme.">
      <button type="button" class="demo-btn--submit" (click)="open.set(true)">Open the panel</button>

      @if (open()) {
        <billy-form-side-panel (overlayClick)="open.set(false)">
          <div class="fsp-head">
            <h3>Quick payment</h3>
            <p>A short form, without leaving the page.</p>
          </div>
          <div class="fsp-body">
            <billy-input-line label="Amount received" [mandatory]="true">
              <input class="demo-field" type="number" [(ngModel)]="amount" placeholder="0.00" />
            </billy-input-line>
            <billy-input-line label="Payment reference">
              <input class="demo-field" [(ngModel)]="reference" placeholder="+++123/4567/89012+++" />
            </billy-input-line>
          </div>
          <billy-save-bar class="no-theme" (save)="save()" (cancel)="open.set(false)" />
        </billy-form-side-panel>
      }
    </demo-stage>
  `,
  styles: `
    .fsp-head {
      padding: 20px 22px 8px;

      h3 { margin: 0 0 4px; font-size: 17px; font-weight: 700; color: var(--site-heading); }
      p { margin: 0; font-size: 12.5px; color: var(--billy-text-soft); }
    }

    .fsp-body {
      flex: 1;
      padding: 12px 22px;
      overflow-y: auto;
    }
  `,
})
export class FormSidePanelDemoComponent {

  private readonly toastr = inject(ToastrService);

  readonly open = signal(false);
  readonly amount = signal<number | null>(null);
  readonly reference = signal('');

  save(): void {
    this.open.set(false);
    this.toastr.success('Sample payment recorded.', 'Saved');
  }

}
