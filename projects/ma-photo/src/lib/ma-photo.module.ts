import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaPhotoComponent } from './ma-photo.component';
import { PhotosModalComponent } from './photo-modal.component';

@NgModule({
  declarations: [MaPhotoComponent, PhotosModalComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaPhotoComponent, PhotosModalComponent]
})
export class MaPhotoModule { }
