import { Component, inject, signal } from '@angular/core';
import {
  AddButtonComponent,
  ButtonComponent,
  ToastrService,
  UploadButtonComponent,
  type BillyButtonColor,
  type BillyButtonSize,
  type BillyButtonVariant,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';
import { DemoLocaleToggleComponent } from './demo-locale-toggle.component';

/** billy-button : the versatile action button (colors × variants × sizes). */
@Component({
  selector: 'demo-button',
  imports: [ButtonComponent, DemoStageComponent],
  template: `
    <demo-stage
      title="Colors × variants"
      [center]="false"
      description="The design system's 5 hues across the 6 variants. Hover to see the motion design (elevation on solid fills, pill on the 'text-rounded' ones).">
      <div class="btn-grid">
        @for (variant of variants; track variant) {
          <div class="btn-grid__row">
            <span class="btn-grid__tag">{{ variant }}</span>
            @for (color of colors; track color) {
              <billy-button [label]="colorLabels[color]" [color]="color" [variant]="variant"
                (clicked)="toastr.info(color + ' · ' + variant, 'Click')" />
            }
          </div>
        }
      </div>
    </demo-stage>

    <demo-stage
      title="Sizes & icons"
      description="small / normal / big. Label and icon are independent: label only, icon + label, or icon only (square button, remember ariaLabel).">
      <div class="btn-line">
        <billy-button label="Small" size="small" icon="fa-solid fa-bolt" color="primary" />
        <billy-button label="Normal" size="normal" icon="fa-solid fa-bolt" color="primary" />
        <billy-button label="Big" size="big" icon="fa-solid fa-bolt" color="primary" />
      </div>
      <div class="btn-line">
        <billy-button label="Icon on the right" icon="fa-solid fa-arrow-right" iconPosition="right" variant="outline" color="info" />
        <billy-button icon="fa-solid fa-heart" ariaLabel="Favorite" variant="plain-rounded" color="error" />
        <billy-button icon="fa-solid fa-gear" ariaLabel="Settings" variant="text-rounded" color="neutral" />
        <billy-button icon="fa-solid fa-plus" ariaLabel="Add" variant="outline-rounded" color="primary" size="big" />
      </div>
    </demo-stage>

    <demo-stage
      title="Ghost / Back"
      description="The 'ghost' variant is an exact copy of the save-bar cancel button: a subtle ghost built on the DS input tokens. Ignores color — ideal for a 'Back' or a secondary action next to a solid button.">
      <div class="btn-line">
        <billy-button label="Back" icon="fa-solid fa-chevron-left" variant="ghost" (clicked)="toastr.info('Back', 'Navigation')" />
        <billy-button label="Save" icon="fa-solid fa-floppy-disk" color="primary" />
      </div>
      <div class="btn-line">
        <billy-button label="Cancel" variant="ghost-rounded" />
        <billy-button icon="fa-solid fa-arrow-left" ariaLabel="Back" variant="ghost" />
      </div>
    </demo-stage>

    <demo-stage
      title="States"
      description="loading (spinner + clicks neutralized), disabled, and full width via [block].">
      <div class="btn-line">
        <billy-button label="Save" icon="fa-solid fa-floppy-disk" color="primary"
          [loading]="saving()" (clicked)="simulateSave()" />
        <billy-button label="Unavailable" color="neutral" variant="outline" [disabled]="true" />
        <billy-button label="Delete" icon="fa-solid fa-trash" color="error" variant="text" />
      </div>
      <div class="btn-block">
        <billy-button label="Full-width action" icon="fa-solid fa-paper-plane" color="info" [block]="true" />
      </div>
    </demo-stage>
  `,
  styles: `
    .btn-grid { display: flex; flex-direction: column; gap: 14px; }
    .btn-grid__row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
    .btn-grid__tag {
      width: 128px;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 600;
      font-family: ui-monospace, monospace;
      color: var(--billy-text-soft);
    }
    .btn-line { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
    .btn-line:last-child { margin-bottom: 0; }
    .btn-block { max-width: 360px; margin: 4px auto 0; }
    @media (max-width: 640px) {
      .btn-grid__row { flex-direction: column; align-items: stretch; }
      .btn-grid__tag { width: auto; }
    }
  `,
})
export class ButtonDemoComponent {
  readonly toastr = inject(ToastrService);
  readonly saving = signal(false);

  readonly colors: BillyButtonColor[] = ['neutral', 'info', 'primary', 'warning', 'error'];
  readonly variants: BillyButtonVariant[] = [
    'plain', 'plain-rounded', 'outline', 'outline-rounded', 'text', 'text-rounded',
  ];
  readonly sizes: BillyButtonSize[] = ['small', 'normal', 'big'];
  readonly colorLabels: Record<BillyButtonColor, string> = {
    neutral: 'Neutral',
    info: 'Info',
    primary: 'Primary',
    warning: 'Warning',
    error: 'Error',
  };

  simulateSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.toastr.success('Changes saved (simulated).', 'Saved');
    }, 1400);
  }
}

/** billy-add-button : the "add" tile for home screens. */
@Component({
  selector: 'demo-add-button',
  imports: [AddButtonComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="The home screen action tiles" description="Label + subtitle + FontAwesome icon; reserved for home-actions screens (see guidelines §1). Without a label, the tile falls back to the built-in dictionary (Add).">
      <demo-locale-toggle stage-controls />
      <div class="ba-row">
        <billy-add-button label="Add a sale" subtitle="Invoice or credit note" icon="fa-solid fa-file-invoice" (clicked)="toastr.info('Opening the sale form (simulated).', 'Add')" />
        <billy-add-button label="Add a client" subtitle="Individual or company" icon="fa-solid fa-user-plus" (clicked)="toastr.info('Opening the client form (simulated).', 'Add')" />
        <billy-add-button (clicked)="toastr.info('Opening a form (simulated).', 'Add')" />
      </div>
    </demo-stage>
  `,
  styles: `
    .ba-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }
  `,
})
export class AddButtonDemoComponent {
  readonly toastr = inject(ToastrService);
}

/** billy-upload-button : the file import tile. */
@Component({
  selector: 'demo-upload-button',
  imports: [UploadButtonComponent, DemoStageComponent, DemoLocaleToggleComponent],
  template: `
    <demo-stage title="Import a file" description="Hidden file input, the same file can be re-selected, loading state while processing. Without label/subtitle the tile falls back to the built-in dictionary (Import / From a file).">
      <demo-locale-toggle stage-controls />
      <div class="ub-row">
        <billy-upload-button [loading]="loading()" (fileSelected)="onFile($event)" />
        <billy-upload-button label="Import a purchase" subtitle="PDF, JPG or PNG" [loading]="loading()" (fileSelected)="onFile($event)" />
      </div>
      <div class="demo-note">{{ lastFile() ?? 'No file selected yet.' }}</div>
    </demo-stage>
  `,
  styles: `
    .ub-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }
  `,
})
export class UploadButtonDemoComponent {

  private readonly toastr = inject(ToastrService);

  readonly loading = signal(false);
  readonly lastFile = signal<string | null>(null);

  onFile(file: File): void {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.lastFile.set(`Received: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      this.toastr.success(`${file.name} processed (simulated).`, 'Import complete');
    }, 1200);
  }

}
