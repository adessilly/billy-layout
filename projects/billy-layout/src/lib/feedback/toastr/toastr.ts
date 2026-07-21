export type ToastrType = 'success' | 'error' | 'warning' | 'info';

/** Application message pushed by callers (historical pushMessage API). */
export interface Toastr {
  title: string;
  message: string;
  /** Optional font-awesome icon; defaults to the type's icon. */
  icon?: string;
  type?: ToastrType;
  /** @deprecated use `type: 'error'` */
  error?: boolean;
}

/** Concrete toast in the displayed stack. */
export interface ToastrInstance {
  id: number;
  type: ToastrType;
  title: string;
  message: string;
  icon: string | null;
  /** Delay before automatic dismissal, in milliseconds. */
  duration: number;
}
