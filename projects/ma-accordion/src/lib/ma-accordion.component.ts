import { Component, OnInit, Input } from '@angular/core';

import { Accordion } from './accordion.model';

@Component({
  selector: 'ma-accordion',
  template: `
  <div class="accordion">
  <ng-container *ngFor="let accordion of accordionList; let i=index">
    <section class="section accordion-section accordion-section-expanded-only" [ngClass]="{'accordion-section-expanded': accordion?.isOpen, 'section-disabled': accordion?.isDisabled}">
      <header class="section-head accordion-head" (click)="!accordion?.isDisabled && toggleAccordion(accordion, i)">
        <h3 class="section-title">
          <span class="accordion-status"></span>
          {{accordion?.title}}
        </h3>
      </header>
      <div class="section-body accordion-body">
        <ng-container *ngTemplateOutlet="accordion?.sectionRef"></ng-container>
      </div>
    </section>
  </ng-container>
</div>
  `,
  styles: ['accordion:disabled, .section:disabled, .section-disabled .field { border-color: #e4e4e4;background: #f4f4f4;box-shadow: none;color: #999;}']
})
export class MaAccordionComponent implements OnInit {
  @Input() accordionList: Accordion[];
  @Input() closeOthers: boolean;

  constructor() { }

  ngOnInit() {
  }

  toggleAccordion(item: Accordion, index: number): void {
    item.isOpen = !item.isOpen;
    if (this.closeOthers) {
      this.accordionList.forEach((element, i) => {
        if (index !== i && !element.isDisabled) {
          element.isOpen = false;
        }
      });
    }
  }

  expandAllAccordion(isOpen: boolean): void {
    this.accordionList.forEach((element) => {
      if (!element.isDisabled) {
        element.isOpen = isOpen;
      }
    });
  }
}
