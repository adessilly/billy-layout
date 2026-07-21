import { Component, computed, input, linkedSignal, OnInit } from '@angular/core';

@Component({
    template: '',
    styleUrls: []
})
export class DefaultFormSignalComponent {

  id = input<number | null>(null);
  beanId = linkedSignal( () => {
    const id = this.id();
    // withComponentInputBinding pushes undefined when the :id parameter is absent,
    // and Number.isNaN does not coerce (Number.isNaN(undefined) === false)
    return id === null || id === undefined || Number.isNaN(+id) ? null : +id;
  });
  editionMode = computed(() => {
    return this.beanId() !== null;
  });

}
