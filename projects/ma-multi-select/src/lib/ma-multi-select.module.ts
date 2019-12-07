import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaMultiSelectComponent } from './ma-multi-select.component';

@NgModule({
  declarations: [MaMultiSelectComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaMultiSelectComponent]
})
export class MaMultiSelectModule { }
