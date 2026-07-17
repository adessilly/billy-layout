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

/** billy-panel : la coque de panneau flottant, ancrée par le parent. */
@Component({
  selector: 'demo-billy-panel',
  imports: [BillyPanelComponent, ClickOutsideDirective, DemoStageComponent],
  template: `
    <demo-stage titre="Un panneau flottant ancré" description="Purement présentationnel : l'état open, l'ancrage et la fermeture (clic extérieur) sont pilotés par le parent.">
      <div class="bp-anchor" (clickOutside)="open.set(false)" [listenClickOutside]="open()">
        <button type="button" class="demo-btn--submit" (click)="open.set(!open())">
          {{ open() ? 'Fermer' : 'Ouvrir' }} le panneau
        </button>
        <billy-panel [open]="open()" heading="Exports" subheading="Documents de la période">
          <div class="bp-item">📄 Journal des ventes (PDF)</div>
          <div class="bp-item">📊 Écritures comptables (CSV)</div>
          <div class="bp-item">🧾 Justificatifs (ZIP)</div>
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

/** billy-consult-card : la carte titrée des écrans de lecture. */
@Component({
  selector: 'demo-consult-card',
  imports: [ConsultCardComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Un bloc d'information en consultation" description="Titre à pastille, badge de comptage, et une seule action contextuelle projetée dans [card-actions]." [center]="false">
      <billy-consult-card label="Pièces jointes" icon="fa-solid fa-paperclip" [badge]="3">
        <button card-actions type="button" class="demo-btn" (click)="toastr.info('Ouverture du gestionnaire (simulée).', 'Gérer')">Gérer</button>
        <div class="cc-files">
          <div class="cc-file"><i class="fa-solid fa-file-pdf"></i> facture-scan.pdf</div>
          <div class="cc-file"><i class="fa-solid fa-file-image"></i> ticket-caisse.jpg</div>
          <div class="cc-file"><i class="fa-solid fa-file-code"></i> facture-ubl.xml</div>
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

/** billy-nav-card : la tuile de navigation des grilles d'accueil. */
@Component({
  selector: 'demo-nav-card',
  imports: [NavCardComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Une grille de points d'entrée" description="Sélecteur d'attribut sur <a> ou <button> : la navigation reste portée par l'hôte. Pastille-icône, badge de comptage, chevron au survol et apparition en cascade ([stagger]). Les cartes de la page d'accueil sont ce composant." [center]="false">
      <div class="nc-grid">
        <button type="button" billy-nav-card
                label="Ventes" icon="ventes" [badge]="12"
                description="Factures, notes de crédit et suivi des paiements."
                [stagger]="0" (click)="note('Ventes')"></button>
        <button type="button" billy-nav-card
                label="Achats" icon="achats" [badge]="0"
                description="Un badge à 0 s'affiche — null le masque."
                [stagger]="1" (click)="note('Achats')"></button>
        <button type="button" billy-nav-card
                label="Agenda" icon="agenda" [chevron]="false"
                description="Sans badge ni chevron : juste la tuile."
                [stagger]="2" (click)="note('Agenda')"></button>
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
    this.toastr.info(`Navigation vers « ${destination} » (simulée).`, 'nav-card');
  }

}

/** billy-page-header : l'en-tête de page (celui du site est le même). */
@Component({
  selector: 'demo-page-header',
  imports: [PageHeaderComponent, HeaderActionBarComponent, DemoStageComponent],
  template: `
    <demo-stage titre="L'en-tête d'une page métier" description="Titre + sous-titre + bouton retour optionnel ; les boutons d'action y sont projetés (header-action-bar). L'en-tête de cette page-ci est le même composant." [center]="false">
      <div class="ph-frame">
        <billy-page-header
          titre="Ventes"
          sousTitre="Liste de vos ventes"
          [retourVisible]="true"
          (retour)="toastr.info('Retour (simulé).', 'Navigation')">
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
    { label: 'Exporter', icon: 'fa-solid fa-download', title: 'Exporter la liste', click: () => this.toastr.info('Export (simulé).', 'Exporter') },
    { label: 'Ajouter une vente', icon: 'fa-solid fa-plus', title: 'Ajouter une vente', variant: 'primary', click: () => this.toastr.success('Formulaire de vente (simulé).', 'Ajouter') },
  ];

}

/** billy-header-action-bar : le vocabulaire complet des actions. */
@Component({
  selector: 'demo-header-action-bar',
  imports: [HeaderActionBarComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Le trio d'actions canonique" description="Les actions sans variant se regroupent en segment ; une seule primary par page, danger réservé au destructif (cf. guidelines §1).">
      <billy-header-action-bar [actions]="actions" />
      <div class="demo-note">Réduisez la fenêtre : la barre passe en icônes seules (d'où l'importance d'un title par action).</div>
    </demo-stage>
  `,
})
export class HeaderActionBarDemoComponent {

  private readonly toastr = inject(ToastrService);

  readonly actions: HeaderAction[] = [
    { label: 'Dupliquer', icon: 'fa-solid fa-copy', title: 'Dupliquer', click: () => this.note('Dupliquer') },
    { label: 'Télécharger', icon: 'fa-solid fa-download', title: 'Télécharger le PDF', click: () => this.note('Télécharger') },
    { label: 'Envoyer', icon: 'fa-solid fa-paper-plane', title: 'Envoyer par email', variant: 'primary', click: () => this.note('Envoyer') },
    { label: 'Supprimer', icon: 'fa-solid fa-trash-can', title: 'Supprimer', variant: 'danger', click: () => this.note('Supprimer') },
  ];

  private note(action: string): void {
    this.toastr.info(`Action « ${action} » cliquée.`, 'header-action-bar');
  }

}

/** billy-tabs : onglets projetés, montés en permanence. */
@Component({
  selector: 'demo-tabs',
  imports: [TabsComponent, TabComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Onglets segmentés" description="Mode projeté : les panneaux restent montés, seul l'affichage bascule — la pastille active glisse. (La page que vous lisez utilise le même composant pour Démo / Documentation.)" [center]="false">
      <billy-tabs>
        <billy-tab label="Encodage" icon="fa-solid fa-pen">
          <div class="tab-pane">Contenu de l'onglet <strong>Encodage</strong> — jamais détruit, son état persiste.</div>
        </billy-tab>
        <billy-tab label="Paiements" icon="fa-solid fa-coins">
          <div class="tab-pane">Contenu de l'onglet <strong>Paiements</strong>.</div>
        </billy-tab>
        <billy-tab label="Historique" icon="fa-solid fa-clock-rotate-left">
          <div class="tab-pane">Contenu de l'onglet <strong>Historique</strong>.</div>
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

/** billy-filter-toggle-buttons : segments et chips de filtrage. */
@Component({
  selector: 'demo-filter-toggle-buttons',
  imports: [FilterToggleButtonsComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Filtrer par segments" description="Variante toggle pour les périodes, variante chips colorées pour les statuts — value null = « tout »." [center]="false">
      <div class="ftb-col">
        <div>
          <div class="ftb-label">variant="toggle" · période</div>
          <billy-filter-toggle-buttons [options]="periodes" [value]="periode()" (valueChange)="periode.set($event)" />
        </div>
        <div>
          <div class="ftb-label">variant="chips" · statut</div>
          <billy-filter-toggle-buttons variant="chips" [options]="statuts" [value]="statut()" (valueChange)="statut.set($event)" />
        </div>
        <div class="demo-note">période : <code>{{ periode() ?? 'toutes' }}</code> · statut : <code>{{ statut() ?? 'tous' }}</code></div>
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

  readonly periode = signal<string | null>('2026');
  readonly statut = signal<string | null>(null);

  readonly periodes: FilterToggleOption[] = [
    { value: null, label: 'Tout' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: 'T3', label: 'Trimestre 3' },
  ];

  readonly statuts: FilterToggleOption[] = [
    { value: null, label: 'Tous' },
    { value: 'payee', label: 'Payées', activeColor: '#15803d', activeBg: '#dcfce7' },
    { value: 'attente', label: 'En attente', activeColor: '#b45309', activeBg: '#fef3c7' },
    { value: 'echue', label: 'Échues', activeColor: '#dc2626', activeBg: '#fee2e2' },
  ];

}
