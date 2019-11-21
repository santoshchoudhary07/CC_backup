import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaTableComponent } from './ma-table.component';
import { MaSearchPipe } from './ma-search.pipe';
import { MaSelectComponent } from './ma-select.component';
import { FocusDirective } from './focus.directive';

@NgModule({
  declarations: [MaTableComponent, MaSearchPipe, MaSelectComponent, FocusDirective],
  imports: [FormsModule, CommonModule],
  providers: [MaSearchPipe],
  exports: [MaTableComponent, MaSearchPipe]
})
export class MaTableModule { }
