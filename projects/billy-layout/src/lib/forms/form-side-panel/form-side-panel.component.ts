import { Component, OnDestroy, OnInit, inject, input, output } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'billy-form-side-panel',
  templateUrl: './form-side-panel.component.html',
  styleUrls: ['./form-side-panel.component.scss'],
})
export class FormSidePanelComponent implements OnInit, OnDestroy {
  readonly wide = input(false);
  readonly overlayClick = output<void>();

  private readonly doc = inject(DOCUMENT);
  private scrollY = 0;

  ngOnInit(): void {
    const win = this.doc.defaultView;
    this.scrollY = win?.scrollY ?? 0;
    const body = this.doc.body;
    body.style.position = 'fixed';
    body.style.top = `-${this.scrollY}px`;
    body.style.width = '100%';
    // preserve scrollbar width on desktop to avoid layout shift
    body.style.overflowY = 'scroll';
  }

  ngOnDestroy(): void {
    const body = this.doc.body;
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    body.style.overflowY = '';
    this.doc.defaultView?.scrollTo(0, this.scrollY);
  }
}
