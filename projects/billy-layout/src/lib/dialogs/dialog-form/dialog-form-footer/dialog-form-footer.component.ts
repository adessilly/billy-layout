import { Component, OnInit, TemplateRef, viewChild } from '@angular/core';

@Component({
    selector: 'billy-dialog-form-footer',
    templateUrl: './dialog-form-footer.component.html',
    styleUrls: ['./dialog-form-footer.component.css'],
    standalone: true
})
export class DialogFormFooterComponent {

  template = viewChild.required<TemplateRef<any>>(TemplateRef);

}
