import { NgModule } from '@angular/core';

import { MaModalComponent } from './ma-modal.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MaModalComponent],
  imports: [
    CommonModule
  ],
  exports: [MaModalComponent]
})
export class MaModalModule { }
