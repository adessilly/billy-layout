import { Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BILLY_FILE_SOURCE, BillyViewerFile } from '../billy-file-source';
import { lastValueFrom } from 'rxjs';
import { FileViewerToolbarComponent } from '../file-viewer-toolbar/file-viewer-toolbar.component';

@Component({
    selector: 'billy-file-viewer-xml',
    templateUrl: './file-viewer-xml.component.html',
    styleUrls: ['./file-viewer-xml.component.scss'],
    imports: [FileViewerToolbarComponent]
})
export class FileViewerXmlComponent {

  private readonly fileSource = inject(BILLY_FILE_SOURCE);

  readonly fichier = input<BillyViewerFile | null>(null);
  readonly visible = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly xmlHtml = signal<SafeHtml | null>(null);
  readonly copied = signal<boolean>(false);

  private rawXml = '';

  constructor(private readonly sanitizer: DomSanitizer) {
    effect(() => {
      this.fichier();
      this.refreshXml();
    });
  }

  async refreshXml(): Promise<void> {
    const fichier = this.fichier();
    if (!fichier) {
      return;
    }
    try {
      this.loading.set(true);
      if (!fichier.id) { throw new Error('Fichier id is null'); }
      const text = await lastValueFrom(this.fileSource.downloadText(fichier.id));
      this.rawXml = text;
      const formatted = FileViewerXmlComponent.formatXml(text);
      const highlighted = FileViewerXmlComponent.highlightXml(formatted);
      this.xmlHtml.set(this.sanitizer.bypassSecurityTrustHtml(highlighted));
    } catch (ex) {
      console.error(ex);
      this.xmlHtml.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.rawXml);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch (ex) {
      console.error(ex);
    }
  }

  show(): void {
    this.refreshXml();
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }

  /**
   * Ré-indente une chaîne XML (une balise par ligne, indentation par profondeur).
   */
  private static formatXml(xml: string): string {
    const PADDING = '  ';
    let formatted = '';
    let pad = 0;

    const normalized = xml
      .replace(/\r\n/g, '\n')
      .replace(/>\s*</g, '>\n<')
      .trim();

    normalized.split('\n').forEach((rawNode) => {
      const node = rawNode.trim();
      if (!node) { return; }

      let indent = 0;
      if (node.match(/^<\/\w/)) {
        // Balise fermante : on désindente d'abord.
        pad = Math.max(pad - 1, 0);
      } else if (node.match(/^<[^!?][^>]*[^/]>.*$/) && !node.match(/^<\w[^>]*>.*<\/\w[^>]*>$/)) {
        // Balise ouvrante sans fermeture sur la même ligne.
        indent = 1;
      }

      formatted += PADDING.repeat(pad) + node + '\n';
      pad += indent;
    });

    return formatted.trim();
  }

  /**
   * Colore l'XML (échappé) pour affichage HTML : balises, attributs, valeurs,
   * prologue et commentaires.
   */
  private static highlightXml(xml: string): string {
    const escaped = xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      // Commentaires
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>')
      // Prologue / instructions de traitement <?xml ... ?>
      .replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="xml-prolog">$1</span>')
      // Balises + attributs
      .replace(
        /(&lt;\/?)([\w:.\-]+)((?:\s+[\w:.\-]+(?:=(?:&quot;[^&]*&quot;|"[^"]*"|'[^']*'))?)*)(\s*\/?&gt;)/g,
        (_match, open: string, tag: string, attrs: string, close: string) => {
          const attrsHtml = attrs.replace(
            /([\w:.\-]+)(=)(&quot;[^&]*&quot;|"[^"]*"|'[^']*')/g,
            '<span class="xml-attr">$1</span>$2<span class="xml-value">$3</span>'
          );
          return `${open}<span class="xml-tag">${tag}</span>${attrsHtml}${close}`;
        }
      );
  }

}
