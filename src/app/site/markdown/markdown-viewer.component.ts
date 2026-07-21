import { Component, ViewEncapsulation, computed, inject, input, resource } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import scss from 'highlight.js/lib/languages/scss';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import { AppLoadingComponent } from 'billy-layout';

// Languages present in the docs/ pages (ts, html, scss, bash, json).
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('css', css);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);

/** Fence alias → highlight.js language. */
const LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  html: 'xml',
  angular: 'xml',
  shell: 'bash',
  sh: 'bash',
};

/**
 * Renders a markdown page from the embedded documentation (assets /docs).
 *
 * Relative links between pages (`../display/page-header.md`, `README.md`,
 * `ux-guidelines.md`) are rewritten to site routes; http links open in a new
 * tab. Code blocks are highlighted by highlight.js (in-house theme aligned
 * with the --billy-* tokens). The content comes from the repository itself:
 * it is trusted (bypassSecurityTrustHtml).
 */
@Component({
  selector: 'site-markdown',
  imports: [AppLoadingComponent],
  template: `
    <div class="site-md loadable">
      @if (doc.isLoading()) {
        <billy-loading [loading]="true" />
      } @else if (doc.error()) {
        <p class="site-md-error">Unable to load this doc page ({{ src() }}).</p>
      } @else {
        <div class="site-md-body" [innerHTML]="html()" (click)="onClick($event)"></div>
      }
    </div>
  `,
  styleUrl: './markdown-viewer.component.scss',
  // HTML injected via [innerHTML] escapes emulated encapsulation: the doc
  // page styles must be global (all prefixed with .site-md-body).
  encapsulation: ViewEncapsulation.None,
})
export class MarkdownViewerComponent {

  /** Path of the doc page, relative to the docs/ root (e.g. 'core/billy-icon.md'). */
  readonly src = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);

  readonly doc = resource({
    params: () => this.src(),
    loader: async ({ params }) => {
      const response = await fetch(`docs/${params}`);
      if (!response.ok) { throw new Error(`HTTP ${response.status}`); }
      return response.text();
    },
  });

  readonly html = computed<SafeHtml>(() => {
    const markdown = this.doc.value();
    if (!markdown) { return ''; }
    const marked = new Marked({ gfm: true });
    marked.use({
      renderer: {
        link({ href, title, text }): string {
          const titleAttr = title ? ` title="${title}"` : '';
          if (/^https?:\/\//.test(href)) {
            return `<a href="${href}"${titleAttr} target="_blank" rel="noopener">${text}</a>`;
          }
          return `<a href="${href}"${titleAttr} data-doc-link="${href}">${text}</a>`;
        },
        code({ text, lang }): string {
          const requested = (lang ?? '').trim().toLowerCase();
          const language = LANG_ALIASES[requested] ?? requested;
          const known = language && hljs.getLanguage(language);
          const body = known
            ? hljs.highlight(text, { language }).value
            : escapeHtml(text);
          const label = known ? ` data-lang="${requested || language}"` : '';
          return `<pre${label}><code class="hljs">${body}</code></pre>`;
        },
      },
    });
    return this.sanitizer.bypassSecurityTrustHtml(marked.parse(markdown, { async: false }));
  });

  /** Internal navigation: relative .md links become site routes. */
  onClick(event: Event): void {
    const anchor = (event.target as HTMLElement).closest('a[data-doc-link]');
    if (!anchor) { return; }
    event.preventDefault();
    const route = this.resolveRoute(anchor.getAttribute('data-doc-link') ?? '');
    if (route) { void this.router.navigateByUrl(route); }
  }

  private resolveRoute(href: string): string | null {
    const link = href.split('#')[0];
    if (!link) { return null; }
    // Resolution relative to the current doc page's folder, inside docs/.
    const baseDir = this.src().split('/').slice(0, -1);
    const segments = [...baseDir];
    for (const part of link.split('/')) {
      if (part === '..') { segments.pop(); }
      else if (part !== '.' && part !== '') { segments.push(part); }
    }
    const path = segments.join('/').replace(/\.md$/, '');
    if (path === 'README') { return '/components'; }
    if (path === 'ux-guidelines') { return '/guidelines'; }
    if (path === 'styles/styles') { return '/styles'; }
    const [category, slug] = path.split('/');
    return category && slug ? `/c/${category}/${slug}` : null;
  }

}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
