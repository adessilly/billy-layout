import { Component, OnInit, AfterViewInit, input, OnChanges, SimpleChanges, viewChild, ElementRef } from '@angular/core';

// source : https://codepen.io/jeremenichelli/pen/vegymB
@Component({
    selector: 'billy-circular-loading',
    templateUrl: './circular-loading.component.html',
    styleUrls: ['./circular-loading.component.css']
})
export class CircularLoadingComponent implements OnInit, AfterViewInit, OnChanges {

  readonly circle = viewChild<ElementRef<SVGCircleElement>>('circle');
  readonly percent = input(0);

  radius = 0;
  circumference = 0;

  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.circle()) {
      this.setProgress(this.percent());
    }
  }

  ngAfterViewInit(): void {
    const circle = this.circle()!.nativeElement;
    this.radius = circle.r.baseVal.value;
    this.circumference = this.radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    circle.style.strokeDashoffset = `${this.circumference}`;
    this.setProgress(this.percent());
  }

  setProgress(percent: number): void {
    const offset = this.circumference - percent / 100 * this.circumference;
    this.circle()!.nativeElement.style.strokeDashoffset = '' + offset;
  }

}
