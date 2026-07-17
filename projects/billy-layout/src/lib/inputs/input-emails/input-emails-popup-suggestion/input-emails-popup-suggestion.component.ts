import { Component, input, output, computed, signal, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'billy-input-emails-popup-suggestion',
  templateUrl: './input-emails-popup-suggestion.component.html',
  styleUrls: ['./input-emails-popup-suggestion.component.scss'],
  imports: [CommonModule]
})
export class InputEmailsPopupSuggestionComponent {

  // Input: valeur actuelle de l'input
  inputValue = input.required<string>();

  // Input: tous les emails disponibles
  availableEmails = input.required<string[]>();

  // Input: emails déjà sélectionnés à exclure des suggestions
  excludedEmails = input<string[]>([]);

  // Input: afficher ou masquer la popup
  show = input<boolean>(false);

  // Output: email sélectionné
  suggestionSelected = output<string>();

  // Index de la suggestion actuellement sélectionnée
  selectedIndex = signal<number>(-1);

  // Emails filtrés basés sur l'input
  filteredEmails = computed(() => {
    const input = this.inputValue().toLowerCase().trim();
    const excluded = this.excludedEmails();

    if (!input || input.length < 2) {
      return [];
    }

    return this.availableEmails()
      .filter(email =>
        email.toLowerCase().includes(input) &&
        !excluded.includes(email)
      )
      .slice(0, 10); // Limiter à 10 suggestions
  });

  constructor() {
    // Réinitialiser l'index sélectionné quand les suggestions changent
    effect(() => {
      this.filteredEmails();
      this.selectedIndex.set(-1);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ne gérer les événements que si la popup est visible et a des suggestions
    if (!this.show() || this.filteredEmails().length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveDown();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.moveUp();
        break;

      case 'Enter':
        // Si une suggestion est sélectionnée, l'utiliser
        if (this.selectedIndex() >= 0) {
          event.preventDefault();
          this.selectCurrent();
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.resetSelection();
        break;
    }
  }

  selectSuggestion(email: string) {
    this.suggestionSelected.emit(email);
  }

  // Déplace la sélection vers le haut
  moveUp() {
    const emails = this.filteredEmails();
    if (emails.length === 0) return;

    const currentIndex = this.selectedIndex();
    if (currentIndex <= 0) {
      this.selectedIndex.set(emails.length - 1);
    } else {
      this.selectedIndex.set(currentIndex - 1);
    }
  }

  // Déplace la sélection vers le bas
  moveDown() {
    const emails = this.filteredEmails();
    if (emails.length === 0) return;

    const currentIndex = this.selectedIndex();
    if (currentIndex >= emails.length - 1) {
      this.selectedIndex.set(0);
    } else {
      this.selectedIndex.set(currentIndex + 1);
    }
  }

  // Sélectionne l'email actuellement en surbrillance
  selectCurrent() {
    const emails = this.filteredEmails();
    const index = this.selectedIndex();

    if (index >= 0 && index < emails.length) {
      this.selectSuggestion(emails[index]);
    }
  }

  // Réinitialise la sélection
  resetSelection() {
    this.selectedIndex.set(-1);
  }
}
