import { Component, computed, input, linkedSignal, OnInit } from '@angular/core';

@Component({
    template: '',
    styleUrls: []
})
export class DefaultFormSignalComponent {

  id = input<number | null>(null);
  beanId = linkedSignal( () => {
    const id = this.id();
    // withComponentInputBinding pousse undefined quand le paramètre :id est absent,
    // et Number.isNaN ne coerce pas (Number.isNaN(undefined) === false)
    return id === null || id === undefined || Number.isNaN(+id) ? null : +id;
  });
  editionMode = computed(() => {
    return this.beanId() !== null;
  });

}
