import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaAccordionComponent } from './ma-accordion.component';

@NgModule({
  declarations: [MaAccordionComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaAccordionComponent]
})
export class MaAccordionModule { }
