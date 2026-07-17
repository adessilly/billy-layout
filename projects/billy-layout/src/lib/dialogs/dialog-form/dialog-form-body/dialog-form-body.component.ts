import { Component, TemplateRef, viewChild } from '@angular/core';

@Component({
    selector: 'billy-dialog-form-body',
    templateUrl: './dialog-form-body.component.html',
    styleUrls: ['./dialog-form-body.component.css'],
    standalone: true
})
export class DialogFormBodyComponent {

  template = viewChild.required<TemplateRef<any>>(TemplateRef);

}
