import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaMultiSelectComponent } from './ma-multi-select.component';
import { AsteriskDirective } from './ma-asterik.directive';

@NgModule({
  declarations: [MaMultiSelectComponent, AsteriskDirective],
  imports: [CommonModule, FormsModule],
  exports: [MaMultiSelectComponent]
})
export class MaMultiSelectModule { }
