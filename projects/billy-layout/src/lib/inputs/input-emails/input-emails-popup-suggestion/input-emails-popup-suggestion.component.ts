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

  // Input: all available emails
  availableEmails = input.required<string[]>();

  // Input: already-selected emails to exclude from the suggestions
  excludedEmails = input<string[]>([]);

  // Input: show or hide the popup
  show = input<boolean>(false);

  // Output: selected email
  suggestionSelected = output<string>();

  // Index of the currently selected suggestion
  selectedIndex = signal<number>(-1);

  // Emails filtered based on the input
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
      .slice(0, 10); // Limit to 10 suggestions
  });

  constructor() {
    // Reset the selected index when the suggestions change
    effect(() => {
      this.filteredEmails();
      this.selectedIndex.set(-1);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Only handle events when the popup is visible and has suggestions
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
        // If a suggestion is selected, use it
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

  // Moves the selection up
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

  // Moves the selection down
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

  // Selects the currently highlighted email
  selectCurrent() {
    const emails = this.filteredEmails();
    const index = this.selectedIndex();

    if (index >= 0 && index < emails.length) {
      this.selectSuggestion(emails[index]);
    }
  }

  // Resets the selection
  resetSelection() {
    this.selectedIndex.set(-1);
  }
}
