import { Component, TemplateRef, inject, viewChild } from '@angular/core';
import { BillyI18nService } from '../../../core/i18n/billy-i18n';

@Component({
    selector: 'billy-dialog-form-header',
    templateUrl: './dialog-form-header.component.html',
    styleUrls: ['./dialog-form-header.component.css']
})
export class DialogFormHeaderComponent {

  protected readonly i18n = inject(BillyI18nService);

  template = viewChild.required<TemplateRef<any>>(TemplateRef);

}
