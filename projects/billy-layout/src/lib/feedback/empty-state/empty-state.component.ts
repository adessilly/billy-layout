import { Component, computed, input, output } from '@angular/core';

export type EmptyStateType =
  | 'achat'
  | 'vente'
  | 'devis'
  | 'client'
  | 'evenements'
  | 'recurrences'
  | 'recherche';

interface EmptyStateCopy {
  titre: string;
  sousTitre: string;
  cta?: string;
}

const COPY: Record<EmptyStateType, EmptyStateCopy> = {
  achat: {
    titre: 'Aucun achat',
    sousTitre: 'Déposez vos factures d’achat,\nBilly en extrait les données pour vous',
    cta: 'Ajouter un achat'
  },
  vente: {
    titre: 'Aucune vente',
    sousTitre: 'Créez votre première facture\net envoyez-la en un clic',
    cta: 'Ajouter une vente'
  },
  devis: {
    titre: 'Aucun devis',
    sousTitre: 'Rédigez votre premier devis,\nune fois accepté il devient facture',
    cta: 'Ajouter un devis'
  },
  client: {
    titre: 'Aucun client',
    sousTitre: 'Ajoutez votre premier client pour créer\ndevis et factures en un clin d’œil',
    cta: 'Ajouter un client'
  },
  evenements: {
    titre: 'Aucun événement',
    sousTitre: 'Créez votre premier événement\npour suivre vos échéances',
    cta: 'Créer un événement'
  },
  recurrences: {
    titre: 'Aucune récurrence',
    sousTitre: 'Configurez des récurrences pour\nautomatiser vos événements réguliers',
    cta: 'Créer une récurrence'
  },
  recherche: {
    titre: 'Aucun résultat',
    sousTitre: 'Aucun élément ne correspond à vos critères,\najustez la recherche ou la période'
  }
};

@Component({
  selector: 'billy-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  readonly type = input.required<EmptyStateType>();
  readonly createClicked = output<void>();

  protected readonly copy = computed(() => COPY[this.type()]);
}
