import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaEmailComponent } from './ma-email.component';

@NgModule({
  declarations: [MaEmailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [MaEmailComponent]
})
export class MaEmailModule { }