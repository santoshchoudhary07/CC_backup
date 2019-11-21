import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { Table } from './ma-table.model';
import { isDate, isString } from 'util';

@Component({
  selector: 'ma-table',
  templateUrl: './ma-table.component.html',
  styleUrls: ['./ma-table.component.css']
})
export class MaTableComponent implements OnInit, OnChanges {
  @Input() options: Table;
  @Input() list: any[];
  @Input() selectList: any[];
  @Input() selectDisplayProperty: string[];
  @Input() selectValueProperty: string;
  @Input() selectBindProperty: string;
  @Input() selectPlaceholder: string;
  @Input() checkBoxBindProperty: string;
  @Input() loaderImagePath: string;
  @Input() dateFormat: string;
  @Output() listChange = new EventEmitter<any[]>();
  @Output() maTableInputOnChange = new EventEmitter<any[]>();
  @Output() editData = new EventEmitter<any[]>();

  sortField: string;
  loading: boolean;
  checkedSelectAll: boolean;
  checkIfChanges: boolean;
  isMessage: boolean;
  isPage: boolean;

  constructor() {
    this.options = new Table();
    this.list = [];
    this.loading = true;
  }

  ngOnInit() {
  }

  ngOnChanges(): void {
    this.columnList();
    if (this.options.dataList && this.options.dataList.length > 0) {
      if (this.options.dataList.length === this.list.length) {
        this.isPage = true;
      }
      this.isMessage = false;
      this.loading = false;
    } else {
      this.isMessage = true;
      setTimeout(() => {
        this.loading = false;
      }, 8000);
    }
  }

  sortBy(head: any): void {
    if (this.options.sorting && head.isSorting && !head.inputType) {
      this.sortField = (this.sortField === head.sortBy ? '' : head.sortBy);
      this.list = this.sortByKey(this.list, head.sortBy, this.sortField !== head.sortBy);
      this.list = Object.assign([], this.list);
      this.listChange.emit(this.list);
    }
  }

  maInputOnChange(item: any, index: number, columnName: string): any {
    this.checkIfAllSelected(index);
    this.inputChange(item, index, columnName);
  }

  onMaSelectChange(value: any, item: any, index: number, columnName: string): void {
    this.inputChange(item, index, columnName);
  }

  inputChange(item: any, index: number, columnName: any): void {
    item.index = index;
    item.columnName = columnName;
    this.isPage ? this.listChange.emit(this.options.dataList): '';
    this.maTableInputOnChange.emit(item);
  }

  selectAll(): void {
    this.options.dataList.forEach(element => {
      if (this.checkedSelectAll) {
        element[this.checkBoxBindProperty] = this.checkedSelectAll;
      } else {
        element[this.checkBoxBindProperty] = this.checkedSelectAll;
      }
    });
    this.listChange.emit(this.options.dataList);
  }

  checkIfAllSelected(index: number): void {
    if (!this.options.dataList[index][this.checkBoxBindProperty]) {
      this.options.dataList[index][this.checkBoxBindProperty] = false;
      this.checkedSelectAll = false;
    } else {
      if (this.options.dataList.filter(item => !item[this.checkBoxBindProperty]).length > 0) {
        this.checkedSelectAll = false;
        this.options.dataList[index][this.checkBoxBindProperty] = true;
      } else {
        if (this.options.dataList.filter(item => item[this.checkBoxBindProperty]).length === this.options.dataList.length) {
          this.checkedSelectAll = true;
        } else {
          this.checkedSelectAll = false;
        }
        this.options.dataList[index][this.checkBoxBindProperty] = true;
      }
    }
  }

  checkIfDate(date: any): boolean {
    let newDate = date;
    if (isString(date)) {
      newDate = Date.parse(date);
      if (!isNaN(newDate)) {
        newDate = new Date(newDate);
      }
    }
    return (isDate(newDate) ? true : false);
  }

  editTable(item: any, index: number): void {
    item.index = index;
    this.editData.emit(item);
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
