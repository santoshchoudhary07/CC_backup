import { Component, Input } from '@angular/core';

@Component({
  selector: 'ma-loader',
  template: `<div *ngIf="isLoading">
                <div [ngClass]="loaderClass">
                <img [src]="loaderImagePath">
                </div>
                </div>`,
})
export class MaLoaderComponent {
  @Input() isLoading: boolean;
  @Input() loaderImagePath: string;
  @Input() loaderClass?: string;
}