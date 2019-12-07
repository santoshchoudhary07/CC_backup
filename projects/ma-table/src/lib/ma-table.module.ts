import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaTableComponent } from './ma-table.component';
import { MaSearchPipe } from './ma-search.pipe';

@NgModule({
  declarations: [MaTableComponent, MaSearchPipe],
  imports: [FormsModule, CommonModule],
  providers: [MaSearchPipe],
  exports: [MaTableComponent, MaSearchPipe]
})
export class MaTableModule { }
