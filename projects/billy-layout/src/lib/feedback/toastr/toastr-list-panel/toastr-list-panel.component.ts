import { Component, computed, inject } from '@angular/core';
import { ToastrService } from '../toastr.service';
import { ToastrComponent } from '../toastr.component';

@Component({
    selector: 'billy-toastr-list-panel',
    templateUrl: './toastr-list-panel.component.html',
    styleUrls: ['./toastr-list-panel.component.scss'],
    imports: [ToastrComponent]
})
export class ToastrListPanelComponent {

  readonly toastrService = inject(ToastrService);
  readonly messages = computed(() => this.toastrService.messages());

}
