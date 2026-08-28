import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogFormComponent } from './dialog-form.component';
import { DialogFormBodyComponent } from './dialog-form-body/dialog-form-body.component';
import { BILLY_DIALOG_ROUTER } from '../dialog/billy-dialog-router';

/** jsdom fires no transitionend: the 400 ms fallback timer does the work. */
const TRANSITION = 400;

@Component({
  selector: 'billy-test-host',
  imports: [DialogFormComponent, DialogFormBodyComponent],
  template: `
    <billy-dialog-form>
      <billy-dialog-form-body>
        <p class="test-content">Contenu</p>
      </billy-dialog-form-body>
    </billy-dialog-form>`,
})
class HostComponent {
  readonly dialog = viewChild.required(DialogFormComponent);
}

describe('DialogFormComponent', () => {

  let fixture: ComponentFixture<HostComponent>;
  let closeOverlay: ReturnType<typeof vi.fn>;

  const dialogInBody = (): HTMLElement | null =>
    document.body.querySelector(':scope > .billy-modal');

  beforeEach(async () => {
    vi.useFakeTimers();
    closeOverlay = vi.fn();

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: BILLY_DIALOG_ROUTER, useValue: { closeOverlay } }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();          // ngAfterViewInit → the dialog opens
    vi.advanceTimersByTime(TRANSITION);
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    dialogInBody()?.remove();
  });

  it('moves its root under the <body> when it opens', () => {
    expect(dialogInBody()).not.toBeNull();
    expect(dialogInBody()!.querySelector('.test-content')).not.toBeNull();
  });

  // ── Le cœur du correctif ──────────────────────────────────────────────────
  // Détruit par le routeur, le composant a déjà perdu ses feuilles de style :
  // le gabarit ne doit pas rester une image de plus sous le <body>, sans quoi
  // il s'y affiche sans styles — mise en page effondrée et SVG en `fill: black`.

  it('leaves the <body> at once when the router destroys it — no frame unstyled', () => {
    fixture.destroy();

    // Aucun timer avancé : la sortie ne doit pas attendre la transition.
    expect(dialogInBody()).toBeNull();
    // Le verrou de défilement part avec lui.
    expect(document.body.classList.contains('billy-dialog-open')).toBe(false);
    // Et surtout : pas de navigation. Le routeur vient déjà de la faire, la
    // refaire écraserait un overlay fraîchement ouvert.
    expect(closeOverlay).not.toHaveBeenCalled();
  });

  it('a close asked from a button keeps its animation, then closes the overlay', () => {
    fixture.componentInstance.dialog().askCloseDialog();

    // Le composant est encore vivant, ses styles avec lui : on anime.
    expect(dialogInBody()).not.toBeNull();

    vi.advanceTimersByTime(TRANSITION);

    expect(dialogInBody()).toBeNull();
    expect(closeOverlay).toHaveBeenCalledTimes(1);
  });

  it('closeThen runs its action after the animation, and only then', () => {
    const suite = vi.fn();
    fixture.componentInstance.dialog().closeThen(suite);

    expect(suite).not.toHaveBeenCalled();

    vi.advanceTimersByTime(TRANSITION);

    expect(suite).toHaveBeenCalledTimes(1);
    // L'action porte la navigation : la coque ne la double pas.
    expect(closeOverlay).not.toHaveBeenCalled();
    expect(dialogInBody()).toBeNull();
  });

});
