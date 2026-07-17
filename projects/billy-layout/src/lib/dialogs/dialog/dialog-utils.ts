import { Observable, Subject } from 'rxjs';

// ═══════════════════════════════════════════════════════════════════════════
// BILLy — dialogue modal du design system (sans Bootstrap)
// Coque de présentation : src/styles-dialog.scss (classes .billy-modal*).
// ═══════════════════════════════════════════════════════════════════════════

/** Posée sur la racine .billy-modal à l'ouverture : pilote opacité + transforms. */
const OPEN_CLASS = 'is-open';

/** Posée sur <body> tant qu'au moins un dialogue est ouvert (verrou de scroll). */
const BODY_OPEN_CLASS = 'billy-dialog-open';

/** Ferme le dialogue au clic, où qu'il soit dans l'arbre (ex-`data-bs-dismiss`). */
const DISMISS_SELECTOR = '[data-billy-dismiss]';

/**
 * Filet de sécurité : `transitionend` n'arrive jamais si la transition ne part
 * pas (onglet en arrière-plan, prefers-reduced-motion, transition surchargée à
 * `none`). Sans ce délai le dialogue resterait affiché et `listenClose()` muet.
 */
const TRANSITION_FALLBACK_MS = 400;

/** Dialogues ouverts, du plus ancien au plus récent : seul le dernier capte Échap. */
const openStack: Dialog[] = [];

type DialogState = 'idle' | 'opening' | 'open' | 'closing' | 'closed';

/**
 * Dialogue modal, sans dépendance à Bootstrap.
 *
 * Reprend à l'identique le contrat de l'ancienne coque `bootstrap.Modal` :
 * `show()` / `hide()`, et deux évènements *terminaux* — `listenShow()` et
 * `listenClose()` — émis une fois la transition finie. Ce différé est essentiel :
 * les appelants retirent l'élément du <body> et enchaînent la navigation dans
 * `listenClose()`, ce qui casserait l'animation s'ils étaient notifiés plus tôt.
 *
 * Structure attendue côté template (voir src/styles-dialog.scss) :
 *
 *   <div class="billy-modal" #ref>          ← l'élément passé au constructeur
 *     <div class="billy-modal-dialog">
 *       <div class="billy-modal-content"> … </div>
 *
 * Ferment le dialogue : la touche Échap, un clic sur le fond, et tout élément
 * portant l'attribut `data-billy-dismiss`.
 */
export class Dialog {

  private readonly shown = new Subject<void>();
  private readonly hidden = new Subject<void>();

  private state: DialogState = 'idle';

  /** Annule l'attente de transition en cours (une fermeture peut couper l'ouverture). */
  private cancelPending: (() => void) | null = null;

  /** Un glisser démarré dans le dialogue et relâché sur le fond ne doit pas fermer. */
  private pressedOnBackdrop = false;

  constructor(private readonly host: HTMLElement) {}

  show(): void {
    if (this.state !== 'idle') { return; }

    // Réouverture sur le même élément (app-ai-extract-dialog en enchaîne) :
    // l'instance précédente resterait dans la pile avec ses écouteurs. On la
    // démonte en silence — la notifier ferait retirer du <body> l'élément que
    // l'on s'apprête justement à réafficher.
    openStack.filter(dialog => dialog.host === this.host)
             .forEach(dialog => dialog.teardown());

    this.state = 'opening';
    openStack.push(this);
    document.body.classList.add(BODY_OPEN_CLASS);

    this.host.addEventListener('mousedown', this.onMouseDown);
    this.host.addEventListener('click', this.onClick);
    document.addEventListener('keydown', this.onKeyDown);

    this.host.setAttribute('aria-modal', 'true');
    this.host.style.display = 'block';
    void this.host.offsetHeight; // reflow : fige l'état initial, sinon pas de transition
    this.host.classList.add(OPEN_CLASS);

    this.afterTransition(() => {
      this.state = 'open';
      this.shown.next();
      this.shown.complete();
    });
  }

  hide(): void {
    if (this.state !== 'opening' && this.state !== 'open') { return; }

    this.state = 'closing';
    this.host.classList.remove(OPEN_CLASS);

    this.afterTransition(() => {
      this.teardown();
      this.hidden.next();
      this.hidden.complete();
    });
  }

  /** Émet une fois, quand le dialogue est entièrement ouvert. */
  listenShow(): Observable<void> {
    return this.shown.asObservable();
  }

  /** Émet une fois, quand le dialogue est entièrement fermé (transition comprise). */
  listenClose(): Observable<void> {
    return this.hidden.asObservable();
  }

  /**
   * Exécute `done` à la fin de la transition d'opacité de la racine, avec un
   * délai de repli si elle ne se déclenche pas.
   */
  private afterTransition(done: () => void): void {
    this.cancelPending?.();

    const onTransitionEnd = (event: TransitionEvent): void => {
      // Les transitions des enfants (transform du dialogue, animations SVG)
      // remontent jusqu'ici : ne réagir qu'à l'opacité de la racine.
      if (event.target === this.host && event.propertyName === 'opacity') {
        finish();
      }
    };

    const timer = setTimeout(() => finish(), TRANSITION_FALLBACK_MS);

    const cancel = (): void => {
      clearTimeout(timer);
      this.host.removeEventListener('transitionend', onTransitionEnd);
      this.cancelPending = null;
    };

    const finish = (): void => {
      cancel();
      done();
    };

    this.cancelPending = cancel;
    this.host.addEventListener('transitionend', onTransitionEnd);
  }

  /** Remet l'élément et le <body> dans leur état de repos. N'émet rien. */
  private teardown(): void {
    this.cancelPending?.();

    this.host.removeEventListener('mousedown', this.onMouseDown);
    this.host.removeEventListener('click', this.onClick);
    document.removeEventListener('keydown', this.onKeyDown);

    this.host.classList.remove(OPEN_CLASS);
    this.host.removeAttribute('aria-modal');
    this.host.style.display = 'none';

    const index = openStack.indexOf(this);
    if (index !== -1) { openStack.splice(index, 1); }

    // Un dialogue peut en ouvrir un autre (suppression demandée depuis un
    // formulaire) : ne rendre le scroll qu'une fois le dernier fermé.
    if (openStack.length === 0) {
      document.body.classList.remove(BODY_OPEN_CLASS);
    }

    this.state = 'closed';
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') { return; }
    // Dialogues empilés : seul celui du dessus répond.
    if (openStack[openStack.length - 1] !== this) { return; }

    event.preventDefault();
    this.hide();
  };

  private readonly onMouseDown = (event: MouseEvent): void => {
    this.pressedOnBackdrop = event.target === this.host;
  };

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;

    if (target?.closest(DISMISS_SELECTOR)) {
      this.hide();
      return;
    }

    // Le fond, c'est la racine elle-même : un clic qui l'atteint a traversé
    // .billy-modal-dialog (pointer-events: none) sans toucher le contenu.
    if (event.target === this.host && this.pressedOnBackdrop) {
      this.hide();
    }
  };

}
