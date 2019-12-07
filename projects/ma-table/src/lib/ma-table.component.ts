import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { Table } from './ma-table.model';

@Component({
  selector: 'ma-table',
  templateUrl: './ma-table.component.html',
  styleUrls: ['./ma-table.component.css']
})
export class MaTableComponent implements OnInit, OnChanges {
  @Input() options: Table;
  @Input() sortingList: any[];
  @Input() loaderImagePath: string;
  @Output() sortingListChange = new EventEmitter<any[]>();

  sortField: string;
  loading: boolean;

  constructor() {
    this.sortingList = [];
    this.loading = true;
  }

  ngOnInit() {
  }

  ngOnChanges(): void {
    this.columnList();
    if (this.options.dataList && this.options.dataList.length > 0) {
      this.loading = false;
    }
  }

  sortBy(head: any): void {
    if (this.options.sorting && head.isSorting) {
      this.sortField = (this.sortField === head.sortBy ? '' : head.sortBy);
      this.sortingList = this.sortByKey(this.sortingList, head.sortBy, this.sortField !== head.sortBy);
      this.sortingList = Object.assign([], this.sortingList);
      this.sortingListChange.emit(this.sortingList);
    }
  }

  private columnList(): void {
    let columnName = [];
    let keyArray = [];
    let uniqueArray = [];
    if (!this.options.headList) {
      if (this.options.dataList && this.options.dataList.length > 0) {
        for (let obj of this.options.dataList) {
          for (let key in obj) {
            keyArray.push(key)
            uniqueArray = keyArray.filter((v, i, a) => a.indexOf(v) === i);
          }
        }
        uniqueArray.forEach(element => {
          columnName.push({ columnName: element, sortBy: element, isSorting: true });
        });
        this.options.headList = columnName;
      }
    }
  }

  private sortByKey(array: any[], key: string, desc: boolean): any[] {
    let x: number, y: number;
    if (key) {
      if (key.indexOf('.') > -1) {
        const keys = key.split('.');
        return array.sort((a, b) => {
          if (isNaN(a[keys[0]] && a[keys[0]][keys[1]]) && isNaN(b[keys[0]] && b[keys[0]][keys[1]])) {
            x = a[keys[0]] ? (a[keys[0]][keys[1]] && a[keys[0]][keys[1]].toLowerCase()) || '' : '';
            y = b[keys[0]] ? (b[keys[0]][keys[1]] && b[keys[0]][keys[1]].toLowerCase()) || '' : '';
          } else {
            x = a[keys[0]] ? a[keys[0]][keys[1]] || '' : '';
            y = b[keys[0]] ? b[keys[0]][keys[1]] || '' : '';
          }
          if (desc) {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
          } else {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          }
        });
      } else {
        return array.sort((a, b) => {
          if (isNaN(a[key]) && isNaN(b[key])) {
            x = (a[key] && a[key].toLowerCase()) || '';
            y = (b[key] && b[key].toLowerCase()) || '';
          } else {
            x = a[key] || '';
            y = b[key] || '';
          }
          if (desc) {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
          } else {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          }
        });
      }
    }
  }
}
