import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ma-pagination',
  template: `
  <header class="section-head">
  <div class="filter">
    <strong class="filter-label">Results Per Page:</strong>
    <div class="select select-inline inline-space-left inline-space-right">
      <select [(ngModel)]="pageSize" (change)="onSelectPage()">
        <option *ngFor="let item of pageSizeList" [ngValue]="item">{{item}}</option>
      </select>
    </div>

    <span class="filter-result"> Returned Rows {{ pageSize>paginationList.length ? 1: pageSize*(pageNumber-1)+1 >paginationList.length? 1: pageSize*(pageNumber-1)+1
      }} through
      {{ pageSize>paginationList.length?paginationList.length:(pageSize*pageNumber)>paginationList.length?paginationList.length:(pageSize*pageNumber)}}
      of {{paginationList.length}}</span>

  </div>
  <div class="paging pagination">
    <a [ngClass]="{disabled:pager.currentPage === 1}" (click)="pager.currentPage !== 1 && setPage(1)"
      class="btn btn-transparent disabled">
      <i class="arrow arrow-left inline-space-right">
      </i>First</a>

    <a [ngClass]="{disabled:pager.currentPage === 1}"
      (click)="pager.currentPage !== 1 && setPage(pager.currentPage - 1)" class="btn btn-transparent disabled">
      <i class="arrow arrow-left inline-space-right">
      </i> Previous</a>

    <div class="select select-inline inline-space-left inline-space-right">
      <div>
        <select [(ngModel)]="pageNumber" (change)="changePage()">
          <option *ngFor="let item of pageArray" [ngValue]="item.id">{{item.name}} </option>
        </select>
      </div>
    </div>

    <span class="paging-counter">of 1</span>
    <a [ngClass]="{disabled:pager.currentPage === pager.totalPages}" class="btn btn-transparent disabled"
      (click)="pager.currentPage !== pager.totalPages && setPage(pager.currentPage + 1)">
      Next <i class="arrow arrow-right inline-space-left"></i>
    </a>

    <a [ngClass]="{disabled:pager.currentPage === pager.totalPages}" class="btn btn-transparent disabled"
      (click)="pager.currentPage !== pager.totalPages && setPage(pager.totalPages)">
      Last <i class="arrow arrow-right inline-space-left"></i></a>
  </div>

</header>
  `,
  styles: [`header.section-head{
    background: none;
    color: #000;
}`]
})
export class PaginationComponent implements OnInit {

  @Input() paginationList: any[];
  @Input() pageSize: number;
  @Input() pageSizeList: any[];
  @Output() filteredList = new EventEmitter<any>();

  pager: any;
  pagedItems: any;
  pageNumber: number = 1;
  pageArray: any[] = [];
  returnedRows: any;

  ngOnInit() {
    this.setPage(1);
    this.getPageNumber();
    this.getRows();
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.ngOnInit();
  }

  constructor() { }

  setPage(page: number) {
    this.pager = this.getPage(this.paginationList.length, page, this.pageSize);
    this.pagedItems = this.paginationList.slice(this.pager.startIndex, this.pager.endIndex + 1);
    this.filteredList.emit(this.pagedItems);
  }

  getRows() {
    this.returnedRows = this.pager.totalPages;
  }

  getPageNumber() {
    this.pageArray = [];
    for (let i = 0; i < this.pager.totalPages; i++) {
      this.pageArray.push({ name: 'Page ' + (i === 0 ? 1 : i+1), id: i === 0 ? 1 : i });
    }
  }

  onSelectPage() {
    this.changePage();
    this.setPage(1);
    this.getPageNumber();
  }

  changePage() {
    this.setPage(this.pageNumber);
  }

  getPage(totalItems: number, currentPage: number = 1, pageSize: number) {
    let totalPages = Math.ceil(totalItems / pageSize);

    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    let startPage: number, endPage: number;
    if (totalPages <= pageSize) {

      startPage = 1;
      endPage = totalPages;
    } else {

      startPage = currentPage + 1;
      endPage = currentPage * 2;

    }

    let startIndex = (currentPage - 1) * pageSize;
    let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex
    };
  }
}
