import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaPaginationComponent } from './ma-pagination.component';

@NgModule({
  declarations: [MaPaginationComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [MaPaginationComponent]
})
export class MaPaginationModule { }
