import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaAssignmentComponent } from './ma-assignment.component';

@NgModule({
  declarations: [MaAssignmentComponent],
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [MaAssignmentComponent]
})
export class MaAssignmentModule { }
