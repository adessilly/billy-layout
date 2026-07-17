import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BillyIconComponent,
  BillyIconName,
  ClickOutsideDirective,
  AutofocusDirective,
  EmailUtils,
  IbanUtils,
  TvaUtils,
} from 'billy-layout';
import { DemoStageComponent } from './demo-stage.component';

const ICON_NAMES: BillyIconName[] = [
  'accueil', 'achats', 'devis', 'ventes', 'prestations', 'agenda',
  'clients', 'compte', 'peppol', 'bell', 'chevron-left', 'chevron-right',
  'sync', 'check', 'clock', 'search', 'dark-mode', 'logout', 'open', 'upload', 'plus',
];

/** Galerie interactive du jeu d'icônes : taille et épaisseur de trait réglables. */
@Component({
  selector: 'demo-icon',
  imports: [FormsModule, BillyIconComponent, DemoStageComponent],
  template: `
    <demo-stage titre="Le jeu d'icônes complet" description="Survolez une tuile : chaque icône porte sa micro-animation." [center]="false">
      <div stage-controls class="icon-controls">
        <label>Taille <input type="range" min="16" max="40" [(ngModel)]="size" /></label>
        <label>Trait <input type="range" min="1" max="3" step="0.1" [(ngModel)]="stroke" /></label>
      </div>
      <div class="icon-grid">
        @for (name of icons; track name) {
          <button type="button" class="icon-tile" (click)="copy(name)" [title]="'<billy-icon name=&quot;' + name + '&quot; />'">
            <billy-icon [name]="name" [size]="size()" [strokeWidth]="stroke()" />
            <code>{{ copied() === name ? 'copié !' : name }}</code>
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

/** [clickOutside] : un panneau qui se ferme dès qu'on clique ailleurs. */
@Component({
  selector: 'demo-click-outside',
  imports: [ClickOutsideDirective, DemoStageComponent],
  template: `
    <demo-stage titre="Fermer au clic extérieur" description="La directive écoute un unique listener document (pensé zoneless) tant que [listenClickOutside] est vrai.">
      <div class="co-anchor" (clickOutside)="close()" [listenClickOutside]="open()">
        <button type="button" class="demo-btn--submit" (click)="open.set(!open())">
          {{ open() ? 'Panneau ouvert' : 'Ouvrir le panneau' }}
        </button>
        @if (open()) {
          <div class="co-panel">
            Cliquez n’importe où <strong>en dehors</strong> de cette carte : elle se ferme.
            Un clic à l’intérieur ne la ferme pas.
          </div>
        }
      </div>
      <div class="demo-note">Fermetures au clic extérieur : <strong>{{ closeCount() }}</strong></div>
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

/** [billyAutofocus] : le champ prend le focus dès son apparition. */
@Component({
  selector: 'demo-autofocus',
  imports: [AutofocusDirective, DemoStageComponent],
  template: `
    <demo-stage titre="Focus automatique à l'affichage" description="Montez le champ : il reçoit le focus sans code côté page.">
      <div class="demo-form-block af-block">
        <button type="button" class="demo-btn" (click)="mounted.set(!mounted())">
          {{ mounted() ? 'Retirer le champ' : 'Afficher le champ' }}
        </button>
        @if (mounted()) {
          <input class="demo-field" billyAutofocus placeholder="Je viens de recevoir le focus" />
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

/** TvaUtils / IbanUtils / EmailUtils : validation en direct. */
@Component({
  selector: 'demo-code-utils',
  imports: [FormsModule, DemoStageComponent],
  template: `
    <demo-stage titre="Les utils de valeurs, en direct" description="Clé belge mod 97 pour la TVA, mod 97 ISO pour l'IBAN, diagnostic + suggestion de domaine pour l'email." [center]="false">
      <div class="cu-grid">

        <div class="cu-block">
          <label class="cu-label">Numéro de TVA belge</label>
          <input class="demo-field" [ngModel]="tva()" (ngModelChange)="tva.set($event)" placeholder="BE 0123 456 749" />
          <div class="cu-verdict" [class.ok]="tvaValid()" [class.ko]="tva() && !tvaValid()">
            {{ tva() ? (tvaValid() ? '✓ clé mod 97 valide' : '✗ clé invalide') : 'Saisissez un numéro…' }}
          </div>
        </div>

        <div class="cu-block">
          <label class="cu-label">IBAN</label>
          <input class="demo-field" [ngModel]="iban()" (ngModelChange)="iban.set($event)" placeholder="BE71 0961 2345 6769" />
          <div class="cu-verdict" [class.ok]="ibanValid()" [class.ko]="iban() && !ibanValid()">
            {{ iban() ? (ibanValid() ? '✓ mod 97 ISO valide' : '✗ IBAN invalide') : 'Saisissez un IBAN…' }}
          </div>
        </div>

        <div class="cu-block">
          <label class="cu-label">Email</label>
          <input class="demo-field" [ngModel]="email()" (ngModelChange)="email.set($event)" placeholder="prenom@gmial.com" />
          <div class="cu-verdict" [class.ok]="emailValid()" [class.ko]="email() && !emailValid()">
            @if (!email()) { Saisissez un email… }
            @else if (emailSuggestion()) { 🤔 vouliez-vous dire <strong>{{ emailSuggestion() }}</strong> ? }
            @else if (emailValid()) { ✓ format valide }
            @else { ✗ format invalide }
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

  readonly tva = signal('');
  readonly iban = signal('');
  readonly email = signal('');

  readonly tvaValid = computed(() => TvaUtils.describe(this.tva()).status === 'valid');
  readonly ibanValid = computed(() => IbanUtils.isValid(this.iban()));
  readonly emailValid = computed(() => EmailUtils.isValid(this.email()));
  readonly emailSuggestion = computed(() => EmailUtils.suggest(this.email()));

}
