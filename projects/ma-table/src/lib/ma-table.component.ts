import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { isObject } from 'util';

import { Table } from './ma-table.model';

@Component({
  selector: 'ma-table',
  templateUrl: './ma-table.component.html',
  styleUrls: ['./ma-table.component.css']
})
export class MaTableComponent implements OnInit, OnChanges {
  @Input() list: any[];
  @Input() selectList: any[];
  @Input() selectDisplayProperty: string;
  @Input() selectValueProperty: string;
  @Input() selectBindProperty: string;
  @Input() selectPlaceholder: string;
  @Input() checkBoxBindProperty: string;
  @Input() loaderImagePath: string;
  @Input() loading: boolean;
  @Output() listChange = new EventEmitter<any[]>();
  @Output() maTableInputOnChange = new EventEmitter<any[]>();
  @Output() editData = new EventEmitter<any[]>();
  public tableOption: Table;
  @Input() get options(): Table {
    return this.tableOption;
  }
  set options(value: Table) {
    this.tableOption = value;
  }

  sortField: any;
  checkedSelectAll: boolean;
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

  maInputOnChange(item: any, index: number, columnName: string): void {
    this.checkIfAllSelected(index);
    this.inputChange(item, index, columnName);
  }

  onMaSelectChange(value: any, item: any, index: number, columnName: string): void {
    this.inputChange(item, index, columnName);
  }

  inputChange(item: any, index: number, columnName: any, inputLabel?: string): void {
    item.index = index;
    if (inputLabel) {
      item.actionLabelType = inputLabel;
    }
    item.columnName = columnName;
    this.isPage ? this.listChange.emit(this.options.dataList) : '';
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

  editTable(item: any, index: number): void {
    item.index = index;
    this.editData.emit(item);
  }

  displayProperty(keyPath: any, obj: any): any {
    if (Array.isArray(keyPath)) {
      for (const i of keyPath) {
        obj = obj[i] = obj[i] || {};
      }
      return isObject(obj) ? Object.keys(obj).length > 0 ? obj : null : obj;
    } else {
      return obj[keyPath];
    }
  }

  isArray(item: any): boolean {
    return Array.isArray(item) ? true : false;
  }

  private columnList(): void {
    const columnName = [];
    const keyArray = [];
    let uniqueArray = [];
    if (!this.options.headList) {
      if (this.options.dataList && this.options.dataList.length > 0) {
        for (const obj of this.options.dataList) {
          for (const key in obj) {
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
    let x: any;
    let y: any;
    if (key) {
      return array.sort((a, b) => {
        if (isNaN(this.displayProperty(key, a)) && isNaN(this.displayProperty(key, b))) {
          x = (this.displayProperty(key, a) && this.displayProperty(key, a).toLowerCase()) || '';
          y = (this.displayProperty(key, b) && this.displayProperty(key, b).toLowerCase()) || '';
        } else {
          x = this.displayProperty(key, a) || '';
          y = this.displayProperty(key, b) || '';
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
