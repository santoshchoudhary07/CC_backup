import { NgModule, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MaTextAreaComponent } from './ma-text-area.component';

@NgModule({
  declarations: [MaTextAreaComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaTextAreaComponent, FormsModule]
})
export class MaTextAreaModule { }
