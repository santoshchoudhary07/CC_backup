import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaCustomPatternComponent } from './ma-custom-pattern.component';

@NgModule({
  declarations: [MaCustomPatternComponent],
  imports: [FormsModule, CommonModule],
  exports: [MaCustomPatternComponent]
})
export class MaCustomPatternModule { }
