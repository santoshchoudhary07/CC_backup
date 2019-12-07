import { NgModule } from '@angular/core';
import { MaToggleComponent } from './ma-toggle.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MaToggleComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  exports: [MaToggleComponent, FormsModule, ReactiveFormsModule, CommonModule]
})
export class MaToggleModule { }
