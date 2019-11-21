import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaNumberComponent } from './ma-number.component';

@NgModule({
  declarations: [MaNumberComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaNumberComponent]
})
export class MaNumberModule { }
