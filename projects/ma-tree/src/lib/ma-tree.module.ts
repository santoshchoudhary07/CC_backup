import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaTreeComponent } from './ma-tree.component';

@NgModule({
  declarations: [MaTreeComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaTreeComponent]
})
export class MaTreeModule { }
