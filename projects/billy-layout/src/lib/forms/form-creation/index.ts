import { ConsultLineComponent } from './consult-line/consult-line.component';
import { InputLineComponent } from './input-line/input-line.component';
import { InputPrefixSuffixComponent } from './input-prefix-suffix/input-prefix-suffix.component';
import { LabelClipboardComponent } from './label-clipboard/label-clipboard.component';

export { ConsultLineComponent } from './consult-line/consult-line.component';
export { InputLineComponent } from './input-line/input-line.component';
export { InputPrefixSuffixComponent } from './input-prefix-suffix/input-prefix-suffix.component';
export { LabelClipboardComponent } from './label-clipboard/label-clipboard.component';

export const FormCreationModule = [
  InputLineComponent,
  ConsultLineComponent,
  InputPrefixSuffixComponent,
  LabelClipboardComponent
] as const;
