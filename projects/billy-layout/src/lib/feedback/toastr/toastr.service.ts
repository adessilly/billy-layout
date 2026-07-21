import { inject, Injectable, signal } from '@angular/core';
import { BillyI18nService } from '../../core/i18n/billy-i18n';
import { Toastr, ToastrInstance, ToastrType } from './toastr';

/** Maximum number of stacked toasts: beyond it, the oldest one is evicted. */
const MAX_STACK = 5;

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  private readonly i18n = inject(BillyI18nService);

  /** Base display duration in seconds (warnings and errors stay longer). */
  public hideDelay = 5;

  public readonly messages = signal<ToastrInstance[]>([]);

  private nextId = 0;

  success(message: string, title?: string): void {
    this.push('success', title ?? this.i18n.strings().toastr.success, message);
  }

  error(message: string, title?: string): void {
    this.push('error', title ?? this.i18n.strings().toastr.error, message);
  }

  warning(message: string, title?: string): void {
    this.push('warning', title ?? this.i18n.strings().toastr.warning, message);
  }

  info(message: string, title?: string): void {
    this.push('info', title ?? this.i18n.strings().toastr.info, message);
  }

  pushSaveSuccess(message?: string): void {
    this.success(message ?? this.i18n.strings().toastr.saveSuccess);
  }

  pushSaveError(message?: string): void {
    this.error(message ?? this.i18n.strings().toastr.saveError);
  }

  pushMessage(toastr: Toastr): void {
    const type = toastr.type ?? (toastr.error ? 'error' : 'success');
    this.push(type, toastr.title, toastr.message, toastr.icon ?? null);
  }

  /** Removes a toast from the stack immediately (called after the exit animation). */
  remove(id: number): void {
    this.messages.update(messages => messages.filter(message => message.id !== id));
  }

  private push(type: ToastrType, title: string, message: string, icon: string | null = null): void {
    const durations: Record<ToastrType, number> = {
      success: this.hideDelay * 1000,
      info: this.hideDelay * 1000,
      warning: this.hideDelay * 1000 + 1500,
      error: this.hideDelay * 1000 + 3000,
    };
    const toast: ToastrInstance = {
      id: this.nextId++,
      type,
      title,
      message,
      icon,
      duration: durations[type],
    };
    this.messages.update(messages => [...messages, toast].slice(-MAX_STACK));
  }

}
