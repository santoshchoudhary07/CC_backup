import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaModalComponent } from './ma-modal.component';

@NgModule({
  declarations: [MaModalComponent],
  imports: [
    CommonModule
  ],
  exports: [MaModalComponent]
})
export class MaModalModule { }
