import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaTextAreaComponent } from './ma-text-area.component';

@NgModule({
  declarations: [MaTextAreaComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaTextAreaComponent, FormsModule]
})
export class MaTextAreaModule { }
