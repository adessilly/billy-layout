import { Component, inject, signal } from '@angular/core';
import {
  BillyPanelComponent,
  ClickOutsideDirective,
  ConsultCardComponent,
  FilterToggleButtonsComponent,
  FilterToggleOption,
  HeaderAction,
  HeaderActionBarComponent,
  NavCardComponent,
  PageHeaderComponent,
  TabComponent,
  TabsComponent,
  ToastrService,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

/** billy-panel : the floating panel shell, anchored by the parent. */
@Component({
  selector: 'demo-billy-panel',
  imports: [BillyPanelComponent, ClickOutsideDirective, DemoStageComponent],
  template: `
    <demo-stage title="An anchored floating panel" description="Purely presentational: the open state, anchoring and closing (outside click) are driven by the parent.">
      <div class="bp-anchor" (clickOutside)="open.set(false)" [listenClickOutside]="open()">
        <button type="button" class="demo-btn--submit" (click)="open.set(!open())">
          {{ open() ? 'Close' : 'Open' }} the panel
        </button>
        <billy-panel [open]="open()" heading="Exports" subheading="Documents for the period">
          <div class="bp-item">📄 Sales journal (PDF)</div>
          <div class="bp-item">📊 Accounting entries (CSV)</div>
          <div class="bp-item">🧾 Receipts (ZIP)</div>
        </billy-panel>
      </div>
    </demo-stage>
  `,
  styles: `
    .bp-anchor {
      position: relative;

      billy-panel {
        position: absolute;
        top: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        width: 260px;
        display: block;
      }
    }

    .bp-item {
      padding: 9px 10px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--billy-input-color);
      cursor: pointer;

      &:hover { background: var(--billy-accent-soft); }
    }
  `,
})
export class BillyPanelDemoComponent {
  readonly open = signal(false);
}

/** billy-consult-card : the titled card of read-only screens. */
@Component({
  selector: 'demo-consult-card',
  imports: [ConsultCardComponent, DemoStageComponent],
  template: `
    <demo-stage title="An information block in consult mode" description="Icon-chip title, count badge, and a single contextual action projected into [card-actions]." [center]="false">
      <billy-consult-card label="Attachments" icon="fa-solid fa-paperclip" [badge]="3">
        <button card-actions type="button" class="demo-btn" (click)="toastr.info('Opening the manager (simulated).', 'Manage')">Manage</button>
        <div class="cc-files">
          <div class="cc-file"><i class="fa-solid fa-file-pdf"></i> invoice-scan.pdf</div>
          <div class="cc-file"><i class="fa-solid fa-file-image"></i> receipt.jpg</div>
          <div class="cc-file"><i class="fa-solid fa-file-code"></i> invoice-ubl.xml</div>
        </div>
      </billy-consult-card>
    </demo-stage>
  `,
  styles: `
    .cc-files {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cc-file {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      background: var(--billy-section-bg);
      border: 1px solid var(--billy-section-border);
      font-size: 13px;
      color: var(--billy-input-color);

      i { color: var(--billy-accent-strong); }
    }
  `,
})
export class ConsultCardDemoComponent {
  readonly toastr = inject(ToastrService);
}

/** billy-nav-card : the navigation tile of home grids. */
@Component({
  selector: 'demo-nav-card',
  imports: [NavCardComponent, DemoStageComponent],
  template: `
    <demo-stage title="A grid of entry points" description="Attribute selector on <a> or <button>: navigation stays on the host. Icon chip, count badge, chevron on hover and staggered entrance ([stagger]). The home page cards are this component." [center]="false">
      <div class="nc-grid">
        <button type="button" billy-nav-card
                label="Sales" icon="sales" [badge]="12"
                description="Invoices, credit notes and payment tracking."
                [stagger]="0" (click)="note('Sales')"></button>
        <button type="button" billy-nav-card
                label="Purchases" icon="purchases" [badge]="0"
                description="A badge at 0 is shown — null hides it."
                [stagger]="1" (click)="note('Purchases')"></button>
        <button type="button" billy-nav-card
                label="Calendar" icon="calendar" [chevron]="false"
                description="No badge, no chevron: just the tile."
                [stagger]="2" (click)="note('Calendar')"></button>
      </div>
    </demo-stage>
  `,
  styles: `
    .nc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 14px;
    }
  `,
})
export class NavCardDemoComponent {

  private readonly toastr = inject(ToastrService);

  note(destination: string): void {
    this.toastr.info(`Navigating to "${destination}" (simulated).`, 'nav-card');
  }

}

/** billy-page-header : the page header (this site's is the same one). */
@Component({
  selector: 'demo-page-header',
  imports: [PageHeaderComponent, HeaderActionBarComponent, DemoStageComponent],
  template: `
    <demo-stage title="The header of a business page" description="Title + subtitle + optional back button; the action buttons are projected into it (header-action-bar). The header of this very page is the same component." [center]="false">
      <div class="ph-frame">
        <billy-page-header
          title="Sales"
          subtitle="List of your sales"
          [backVisible]="true"
          (back)="toastr.info('Back (simulated).', 'Navigation')">
          <billy-header-action-bar [actions]="actions" />
        </billy-page-header>
      </div>
    </demo-stage>
  `,
  styles: `
    .ph-frame {
      border: 1px dashed var(--billy-surface-border);
      border-radius: 14px;
      padding: 4px 16px 12px;
      background: var(--site-page-bg);
    }
  `,
})
export class PageHeaderDemoComponent {

  readonly toastr = inject(ToastrService);

  readonly actions: HeaderAction[] = [
    { label: 'Export', icon: 'fa-solid fa-download', title: 'Export the list', click: () => this.toastr.info('Export (simulated).', 'Export') },
    { label: 'Add a sale', icon: 'fa-solid fa-plus', title: 'Add a sale', variant: 'primary', click: () => this.toastr.success('Sale form (simulated).', 'Add') },
  ];

}

/** billy-header-action-bar : the full action vocabulary. */
@Component({
  selector: 'demo-header-action-bar',
  imports: [HeaderActionBarComponent, DemoStageComponent],
  template: `
    <demo-stage title="The canonical action trio" description="Actions without a variant group into a segment; a single primary per page, danger reserved for destructive actions (see guidelines §1).">
      <billy-header-action-bar [actions]="actions" />
      <div class="demo-note">Shrink the window: the bar collapses to icons only (hence the importance of a title per action).</div>
    </demo-stage>
  `,
})
export class HeaderActionBarDemoComponent {

  private readonly toastr = inject(ToastrService);

  readonly actions: HeaderAction[] = [
    { label: 'Duplicate', icon: 'fa-solid fa-copy', title: 'Duplicate', click: () => this.note('Duplicate') },
    { label: 'Download', icon: 'fa-solid fa-download', title: 'Download the PDF', click: () => this.note('Download') },
    { label: 'Send', icon: 'fa-solid fa-paper-plane', title: 'Send by email', variant: 'primary', click: () => this.note('Send') },
    { label: 'Delete', icon: 'fa-solid fa-trash-can', title: 'Delete', variant: 'danger', click: () => this.note('Delete') },
  ];

  private note(action: string): void {
    this.toastr.info(`Action "${action}" clicked.`, 'header-action-bar');
  }

}

/** billy-tabs : projected tabs, permanently mounted. */
@Component({
  selector: 'demo-tabs',
  imports: [TabsComponent, TabComponent, DemoStageComponent],
  template: `
    <demo-stage title="Segmented tabs" description="Projected mode: the panels stay mounted, only their visibility toggles — the active pill slides. (The page you are reading uses the same component for Demo / Documentation.)" [center]="false">
      <billy-tabs>
        <billy-tab label="Entry" icon="fa-solid fa-pen">
          <div class="tab-pane">Content of the <strong>Entry</strong> tab — never destroyed, its state persists.</div>
        </billy-tab>
        <billy-tab label="Payments" icon="fa-solid fa-coins">
          <div class="tab-pane">Content of the <strong>Payments</strong> tab.</div>
        </billy-tab>
        <billy-tab label="History" icon="fa-solid fa-clock-rotate-left">
          <div class="tab-pane">Content of the <strong>History</strong> tab.</div>
        </billy-tab>
      </billy-tabs>
    </demo-stage>
  `,
  styles: `
    .tab-pane {
      margin-top: 14px;
      padding: 18px;
      border-radius: 12px;
      background: var(--site-card-bg);
      border: 1px solid var(--billy-surface-border);
      font-size: 13.5px;
      color: var(--billy-input-color);
    }
  `,
})
export class TabsDemoComponent {}

/** billy-filter-toggle-buttons : segments and filter chips. */
@Component({
  selector: 'demo-filter-toggle-buttons',
  imports: [FilterToggleButtonsComponent, DemoStageComponent],
  template: `
    <demo-stage title="Filter by segments" description="Toggle variant for periods, colored chips variant for statuses — value null = 'all'." [center]="false">
      <div class="ftb-col">
        <div>
          <div class="ftb-label">variant="toggle" · period</div>
          <billy-filter-toggle-buttons [options]="periods" [value]="period()" (valueChange)="period.set($event)" />
        </div>
        <div>
          <div class="ftb-label">variant="chips" · status</div>
          <billy-filter-toggle-buttons variant="chips" [options]="statuses" [value]="status()" (valueChange)="status.set($event)" />
        </div>
        <div class="demo-note">period: <code>{{ period() ?? 'all' }}</code> · status: <code>{{ status() ?? 'all' }}</code></div>
      </div>
    </demo-stage>
  `,
  styles: `
    .ftb-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: flex-start;
    }

    .ftb-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .04em;
      color: var(--billy-text-muted);
      margin-bottom: 8px;
    }
  `,
})
export class FilterToggleButtonsDemoComponent {

  readonly period = signal<string | null>('2026');
  readonly status = signal<string | null>(null);

  readonly periods: FilterToggleOption[] = [
    { value: null, label: 'All' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: 'Q3', label: 'Quarter 3' },
  ];

  readonly statuses: FilterToggleOption[] = [
    { value: null, label: 'All' },
    { value: 'paid', label: 'Paid', activeColor: '#15803d', activeBg: '#dcfce7' },
    { value: 'pending', label: 'Pending', activeColor: '#b45309', activeBg: '#fef3c7' },
    { value: 'overdue', label: 'Overdue', activeColor: '#dc2626', activeBg: '#fee2e2' },
  ];

}
