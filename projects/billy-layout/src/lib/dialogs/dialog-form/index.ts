import { DialogFormBodyComponent } from './dialog-form-body/dialog-form-body.component';
import { DialogFormFooterComponent } from './dialog-form-footer/dialog-form-footer.component';
import { DialogFormHeaderComponent } from './dialog-form-header/dialog-form-header.component';
import { DialogFormComponent } from './dialog-form.component';

export { DialogFormComponent } from './dialog-form.component';
export { DialogFormBodyComponent } from './dialog-form-body/dialog-form-body.component';
export { DialogFormFooterComponent } from './dialog-form-footer/dialog-form-footer.component';
export { DialogFormHeaderComponent } from './dialog-form-header/dialog-form-header.component';

export const DialogFormModule = [
  DialogFormComponent,
  DialogFormBodyComponent,
  DialogFormHeaderComponent,
  DialogFormFooterComponent
] as const;
