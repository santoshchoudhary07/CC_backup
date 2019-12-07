import { Component, OnInit, ViewChildren, QueryList, ElementRef, Input, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';

import { MaSearchPipe } from './ma-search.pipe';
import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-auto-complete',
  template: `
  <div class="search search-secondary">
    <div class="search-body search-controls">
      <input #search class="field disable-tab ui-autocomplete-input" autocomplete="off" [(ngModel)]="filterKey" type="text" (keydown.ArrowUp)="onArrowUp()" [disabled]="isLoadData || disabled" [readonly]="readonly"
      [required]="required" [id]="id ? id : 'auto-complete-id'" [name]="name" [placeholder]="placeholder ? placeholder : 'Search'" (keydown.ArrowDown)="onArrowDown()" (keyup)=filterList()
      (focus)="onFocus()">
      <i class="ico-magnifier-medium search-icon"></i>
    </div>
</div>
  <div class="not-found" *ngIf="notFoundMessage && loading && (filteredRow && filteredRow.length === 0)">{{notFoundMessage | titlecase}}</div>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content"  *ngIf="filteredRow && filteredRow.length > 0">
    <ng-container *ngFor="let filteredItem of filteredRow; let i = index;">
      <li class="residentSearchResult ui-menu-item" #liRef tabindex="-1" (keyup.enter)="select(filteredItem)" (click)="select(filteredItem)"
      (keydown.ArrowUp)="onArrowUp(i-1)" (keydown.ArrowDown)="onArrowDown(i+1)">
      <ng-container *ngIf="isSearchHighlight; else noHighlight">
       <span class="result" innerHTML="{{filteredItem[renderKeyName] | highlight : filterKey}}"></span>
       </ng-container>
      <ng-template #noHighlight>
       <span class="result">
       {{filteredItem[renderKeyName]}}
        </span>
       </ng-template>
      </li>
      </ng-container>
    </ul>
  `,
  styleUrls: ['./ma-auto-complete.component.css'],
  providers: [MakeProvider(MaAutoCompleteComponent)]
})
export class MaAutoCompleteComponent extends MaInputComponent implements OnInit {
  @ViewChildren("liRef") liList: QueryList<ElementRef>;
  @ViewChild('search', { static: true }) searchElement: ElementRef;
  @Input() list: any[];
  @Input() renderKeyName: string;
  @Input() selectKeyName: string;
  @Input() notFoundMessage: string;
  @Input() searchRowsLimit: number;
  @Input() isSearchHighlight: boolean;
  @Input() disabled: boolean;
  @Input() readonly: boolean;
  @Input() required: boolean;
  @Input() placeholder: string;
  @Input() name: string;
  @Input() id: string;
  @Output() maAutoCompleteOnChange = new EventEmitter<any>();
  @Output() ngModelChange = new EventEmitter<any>();
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.filteredList = [];
      this.filteredRow = [];
      this.loading = false;
    }
  }

  filterKey: any;
  filteredList: any[];
  filteredRow: any[];
  loading: boolean;
  isLoadData: boolean;

  constructor(private maSearchPipe: MaSearchPipe, private elementRef: ElementRef) {
    super();
    this.initialize();
  }

  ngOnInit() {
  }

  ngOnChanges(): void {
    this.checkBinding();
  }

  onFocus(): void {
    this.filterList();
  }

  filterList(): void {
    if (this.filterKey) {
      this.filteredList = this.maSearchPipe.transform(this.list, { [this.renderKeyName]: this.filterKey }, null);
      this.filteredRow = this.filteredList.filter((x, i) => { return (i < this.searchRowsLimit) });
      this.loading = true;
    } else {
      this.filteredList = [];
      this.filteredRow = [];
      this.loading = false;
    }
  }

  select(selectedItem: any): void {
    this.filterKey = selectedItem[this.renderKeyName];
    this.value = this.selectKeyName ? selectedItem[this.selectKeyName] : selectedItem;
    this.ngModelChange.emit(this.value);
    this.maAutoCompleteOnChange.emit(this.value);
    this.filteredList = [];
    this.filteredRow = [];
    this.loading = false;
  }

  onArrowUp(index: number = 0): void {
    if (index === -1) {
      this.searchElement.nativeElement.focus();
    }
    index = index === -1 ? null : index;
    if ((this.filteredRow && this.filteredRow.length > index) && index !== null) {
      this.focusOnList(index);
    }
  }

  onArrowDown(index: number = 0): void {
    if (this.filteredRow && this.filteredRow.length > index) {
      this.focusOnList(index);
    } else {
      this.searchElement.nativeElement.focus();
    }
  }

  private checkBinding(): void {
    if ((this.list && this.list.length > 0)) {
      this.isLoadData = false;
      this.filterKey = this.value ? this.list[this.indexOfByKey(this.selectKeyName, this.value, this.list)][this.renderKeyName] : '';
    }
  }

  private focusOnList(index: number): void {
    let selectIndex = this.filteredRow.findIndex((item, listIndex) => { return (listIndex === index) });
    let elementRef = this.liList.find((item, i) => i === selectIndex);
    elementRef.nativeElement.focus();
  }

  private indexOfByKey(key: string, value: any, array: any[]): number {
    let found = -1;
    array.forEach((c, index) => {
      if (value === c[key]) {
        found = index;
        return;
      }
    });
    return found;
  }

  private initialize(): void {
    this.filteredList = [];
    this.filteredRow = [];
    this.filterKey = '';
    this.searchRowsLimit = 5;
    this.loading = false;
    this.isLoadData = true;
  }
}
