import { Component, Input } from '@angular/core';

@Component({
  selector: 'ma-loader',
  template: `<div id="overlay" *ngIf="isLoading">
                <div id="divLoading" [class.show]="isLoading">
                <img [src]="loaderImagePath">
                </div>
</div>`,
  styleUrls: ['./ma-loader.css']
})
export class MaLoaderComponent {
  @Input() isLoading: boolean;
  @Input() loaderImagePath: string;
  @Input() loaderClass?: string;
}