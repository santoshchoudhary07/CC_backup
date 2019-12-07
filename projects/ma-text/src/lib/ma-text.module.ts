import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaTextComponent } from './ma-text.component';

@NgModule({
  declarations: [MaTextComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaTextComponent]
})
export class MaTextModule { }
