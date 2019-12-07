import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaAutoCompleteComponent } from './ma-auto-complete.component';
import { MaSearchPipe } from './ma-search.pipe';
import { MaHighlightText } from './ma-highlight.pipe';

@NgModule({
  declarations: [MaAutoCompleteComponent, MaSearchPipe, MaHighlightText],
  imports: [CommonModule, FormsModule],
  providers: [MaSearchPipe],
  exports: [MaAutoCompleteComponent]
})
export class MaAutoCompleteModule { }
