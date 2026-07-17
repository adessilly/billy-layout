export type ToastrType = 'success' | 'error' | 'warning' | 'info';

/** Message applicatif poussé par les appelants (API historique de pushMessage). */
export interface Toastr {
  titre: string;
  message: string;
  /** Icône font-awesome optionnelle ; à défaut, l'icône du type est utilisée. */
  icone?: string;
  type?: ToastrType;
  /** @deprecated utiliser `type: 'error'` */
  error?: boolean;
}

/** Toast concret dans la pile affichée. */
export interface ToastrInstance {
  id: number;
  type: ToastrType;
  titre: string;
  message: string;
  icone: string | null;
  /** Durée avant fermeture automatique, en millisecondes. */
  duration: number;
}
