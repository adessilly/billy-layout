import { Component, TemplateRef, viewChild } from '@angular/core';

@Component({
    selector: 'billy-dialog-form-header',
    templateUrl: './dialog-form-header.component.html',
    styleUrls: ['./dialog-form-header.component.css'],
    standalone: true
})
export class DialogFormHeaderComponent {

  template = viewChild.required<TemplateRef<any>>(TemplateRef);

}
