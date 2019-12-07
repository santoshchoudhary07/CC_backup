import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { PageDetailModel } from './page-detail.model';

@Component({
  selector: 'ma-pagination',
  templateUrl: './ma-pagination.component.html',
  styles: ['header.section-head {  background: none; color: #000; }']
})
export class MaPaginationComponent implements OnInit {
  @Input() itemList: any[];
  @Input() itemsPerPage: number;
  @Input() itemsPerPageList: any[];
  @Output() pageChange = new EventEmitter<any>();

  pageDetails: PageDetailModel;
  pageNumber: number;
  pageArray: any[];

  private pageFinalItems: any;

  constructor() {
    this.pageNumber = 1;
    this.pageArray = [];
    this.pageDetails = new PageDetailModel();
  };

  ngOnInit() {
    this.setPage(1);
    this.getPageNumber();
    this.changePage();
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  setPage(page: number): void {
    this.pageNumber = page;
    this.pageDetails = this.getPage(this.itemList.length, this.pageNumber, this.itemsPerPage);
    this.pageFinalItems = this.itemList.slice(this.pageDetails.startIndex, this.pageDetails.endIndex + 1);
    this.pageChange.emit(this.pageFinalItems);
  }

  onSelectPage(): void {
    this.changePage();
    this.setPage(1);
    this.getPageNumber();
  }

  changePage(): void {
    this.setPage(this.pageNumber);
  }

  getPageNumber(): void {
    this.pageArray = [];
    for (let i = 0; i < this.pageDetails.totalPages; i++) {
      this.pageArray.push({ name: 'Page ' + (i === 0 ? 1 : i + 1), id: i === 0 ? 1 : i + 1 });
    }
  }

  private getPage(totalItems: number, currentPage: number = 1, itemsPerPage: number): PageDetailModel {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < 1) {
      currentPage = 1;
    } else if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    let startPage: number, endPage: number;
    if (totalPages <= itemsPerPage) {
      startPage = 1;
      endPage = totalPages;
    } else {
      startPage = currentPage + 1;
      endPage = currentPage * 2;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

    return {
      totalItems: totalItems,
      currentPage: currentPage,
      itemsPerPage: itemsPerPage,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex
    };
  }
}
