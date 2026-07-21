import { Component, inject } from '@angular/core';
import { BillyIconComponent } from '../../../core/icon/billy-icon.component';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';

/** Empty state of a notification list: "nothing to handle". */
@Component({
  selector: 'billy-notif-empty',
  imports: [BillyIconComponent],
  template: `
    <div class="billy-notif-empty">
      <span class="billy-notif-empty-icon">
        <billy-icon name="check" [size]="24" [strokeWidth]="1.8" />
      </span>
      <div class="billy-notif-empty-title">{{ i18n.strings().notifications.emptyTitle }}</div>
      <div class="billy-notif-empty-text">{{ i18n.strings().notifications.emptySubtitle }}</div>
    </div>
  `,
  styles: `
    .billy-notif-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
      padding: 34px 20px;
    }

    .billy-notif-empty-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: #F1F4F7;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #B6C2CE;
    }

    .billy-notif-empty-title {
      font-size: 13.5px;
      font-weight: 600;
      color: #64748B;
    }

    .billy-notif-empty-text {
      font-size: 12px;
      color: #A6B2BE;
      max-width: 200px;
    }

    :host-context(body.dark-mode) .billy-notif-empty-icon {
      background: #2a373b;
      color: #64747c;
    }
  `,
})
export class BillyNotifEmptyComponent {
  protected readonly i18n = inject(BillyI18nService);
}
