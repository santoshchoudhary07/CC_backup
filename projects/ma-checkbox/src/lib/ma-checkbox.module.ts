import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaCheckboxComponent } from './ma-checkbox.component';

@NgModule({
  declarations: [MaCheckboxComponent],
  imports: [CommonModule, FormsModule ],
  exports: [MaCheckboxComponent]
})
export class MaCheckboxModule { }
