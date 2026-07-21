import { Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';
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
  protected readonly i18n = inject(BillyI18nService);

  readonly file = input<BillyViewerFile | null>(null);
  readonly visible = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly xmlHtml = signal<SafeHtml | null>(null);
  readonly copied = signal<boolean>(false);

  private rawXml = '';

  constructor(private readonly sanitizer: DomSanitizer) {
    effect(() => {
      this.file();
      this.refreshXml();
    });
  }

  async refreshXml(): Promise<void> {
    const file = this.file();
    if (!file) {
      return;
    }
    try {
      this.loading.set(true);
      if (!file.id) { throw new Error('File id is null'); }
      const text = await lastValueFrom(this.fileSource.downloadText(file.id));
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
   * Re-indents an XML string (one tag per line, indentation by depth).
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
        // Closing tag: dedent first.
        pad = Math.max(pad - 1, 0);
      } else if (node.match(/^<[^!?][^>]*[^/]>.*$/) && !node.match(/^<\w[^>]*>.*<\/\w[^>]*>$/)) {
        // Opening tag without a closing tag on the same line.
        indent = 1;
      }

      formatted += PADDING.repeat(pad) + node + '\n';
      pad += indent;
    });

    return formatted.trim();
  }

  /**
   * Highlights the (escaped) XML for HTML display: tags, attributes, values,
   * prolog and comments.
   */
  private static highlightXml(xml: string): string {
    const escaped = xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped
      // Comments
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>')
      // Prolog / processing instructions <?xml ... ?>
      .replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="xml-prolog">$1</span>')
      // Tags + attributes
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
