import { NgModule } from '@angular/core';
import { PaginationComponent } from './pagination.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [PaginationComponent],
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [PaginationComponent]
})
export class PaginationModule { }
