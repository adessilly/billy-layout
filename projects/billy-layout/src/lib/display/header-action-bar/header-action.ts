export interface HeaderAction {
  label: string;
  icon: string;
  title: string;
  click: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  hidden?: boolean;
}
