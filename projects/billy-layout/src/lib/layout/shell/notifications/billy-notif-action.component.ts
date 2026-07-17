import { Component, input } from '@angular/core';
import { BillyIconComponent, BillyIconName } from '../../../core/icon/billy-icon.component';

/**
 * Action de pied de panneau (« Synchroniser », « Tout marquer comme lu »…) :
 * icône + libellé projeté, avec rotation de l'icône pendant le chargement.
 * Le clic se gère sur l'élément hôte, côté composant appelant.
 */
@Component({
  selector: 'billy-notif-action',
  imports: [BillyIconComponent],
  template: `
    <div class="billy-notif-action">
      <billy-icon [name]="icon()" [size]="16" [strokeWidth]="2" [class.spin]="spinning()" />
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .billy-notif-action {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 12px;
      border-radius: 10px;
      color: #0E97BB;
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
      transition: background .15s ease;
    }

    .billy-notif-action:hover {
      background: #E6F7FC;
    }

    .spin {
      animation: billyNotifSpin 1s linear infinite;
    }

    @keyframes billyNotifSpin {
      to { transform: rotate(360deg); }
    }

    :host-context(body.dark-mode) .billy-notif-action:hover {
      background: rgba(18, 180, 221, .12);
    }
  `,
})
export class BillyNotifActionComponent {

  readonly icon = input.required<BillyIconName>();
  readonly spinning = input(false);

}
