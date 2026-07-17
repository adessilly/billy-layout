import { Component } from '@angular/core';

interface TokenGroup {
  title: string;
  tokens: string[];
}

/**
 * Nuancier vivant des tokens --billy-* : chaque pastille est peinte avec la
 * variable CSS elle-même — basculer le mode sombre depuis la topbar met le
 * nuancier à jour en direct.
 */
@Component({
  selector: 'site-tokens-gallery',
  template: `
    <div class="tokens site-card">
      <div class="tokens-hint">
        Nuancier vivant — activez le mode sombre depuis la topbar
        <span class="tokens-hint-accent">pour voir les valeurs basculer</span>.
      </div>
      <div class="tokens-groups">
        @for (group of groups; track group.title) {
          <div class="tokens-group">
            <div class="tokens-group-title">{{ group.title }}</div>
            <div class="tokens-swatches">
              @for (token of group.tokens; track token) {
                <div class="token">
                  <span class="token-swatch" [style.background]="'var(' + token + ')'"></span>
                  <code class="token-name">{{ token }}</code>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .tokens-hint {
      font-size: 13px;
      color: var(--billy-text-soft);
      margin-bottom: 18px;
    }

    .tokens-hint-accent { color: var(--billy-accent-strong); font-weight: 600; }

    .tokens-groups {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }

    .tokens-group-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: var(--billy-section-title);
      margin-bottom: 10px;
    }

    .tokens-swatches {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .token {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .token-swatch {
      width: 34px;
      height: 22px;
      border-radius: 6px;
      border: 1px solid var(--billy-surface-border);
      flex-shrink: 0;
      transition: background .3s ease;
    }

    .token-name {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11.5px;
      color: var(--billy-text-soft);
    }
  `,
})
export class TokensGalleryComponent {

  readonly groups: TokenGroup[] = [
    { title: 'Accent', tokens: ['--billy-accent', '--billy-accent-strong', '--billy-accent-soft', '--billy-accent-border'] },
    { title: 'Champs', tokens: ['--billy-input-bg', '--billy-input-border', '--billy-input-color', '--billy-input-disabled-bg'] },
    { title: 'Surfaces', tokens: ['--billy-surface', '--billy-surface-border', '--billy-divider', '--billy-section-bg'] },
    { title: 'Textes & états', tokens: ['--billy-text-soft', '--billy-text-muted', '--billy-danger', '--billy-focus-border'] },
  ];

}
