import { Injectable, signal } from '@angular/core';
import { Toastr, ToastrInstance, ToastrType } from './toastr';

/** Nombre maximum de toasts empilés : au-delà, le plus ancien est évincé. */
const MAX_STACK = 5;

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  /** Durée d'affichage de base en secondes (warnings et erreurs restent plus longtemps). */
  public hideDelay = 5;

  public readonly messages = signal<ToastrInstance[]>([]);

  private nextId = 0;

  success(message: string, titre = 'Succès'): void {
    this.push('success', titre, message);
  }

  error(message: string, titre = 'Erreur'): void {
    this.push('error', titre, message);
  }

  warning(message: string, titre = 'Attention'): void {
    this.push('warning', titre, message);
  }

  info(message: string, titre = 'Information'): void {
    this.push('info', titre, message);
  }

  pushSaveSuccess(message = 'Sauvegarde effectuée avec succès'): void {
    this.success(message);
  }

  pushSaveError(message = 'Erreur durant la sauvegarde'): void {
    this.error(message);
  }

  pushMessage(toastr: Toastr): void {
    const type = toastr.type ?? (toastr.error ? 'error' : 'success');
    this.push(type, toastr.titre, toastr.message, toastr.icone ?? null);
  }

  /** Retire immédiatement un toast de la pile (appelé après l'animation de sortie). */
  remove(id: number): void {
    this.messages.update(messages => messages.filter(message => message.id !== id));
  }

  private push(type: ToastrType, titre: string, message: string, icone: string | null = null): void {
    const durations: Record<ToastrType, number> = {
      success: this.hideDelay * 1000,
      info: this.hideDelay * 1000,
      warning: this.hideDelay * 1000 + 1500,
      error: this.hideDelay * 1000 + 3000,
    };
    const toast: ToastrInstance = {
      id: this.nextId++,
      type,
      titre,
      message,
      icone,
      duration: durations[type],
    };
    this.messages.update(messages => [...messages, toast].slice(-MAX_STACK));
  }

}
