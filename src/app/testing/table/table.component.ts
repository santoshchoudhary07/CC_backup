import { Component, OnInit } from '@angular/core';
import { DemoService } from '../../demo.service';
import { isDate } from 'util';
import { MaSearchPipe } from 'projects/ma-table/src/public-api';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  // pagination begin
  list: any[] = [];
  name: any;
  dataValue: any;
  originalData: any[] = [];
  pages: any[] = [
    { id: 1, value: 3 },
    { id: 2, value: 5 },
    { id: 3, value: 1 }
  ];
  fighters = [
    { name: 'Conor McGregor', wins: 21, losses: 3, address: { street: 123 }, id: 1 },
    { name: 'Tony Ferguson', wins: 23, losses: 3, address: { street: 123 }, id: 1 },
    { name: 'Max Holloway', wins: 19, losses: 3, address: { street: 123 }, id: 1 },
    { name: 'Jon Jones', wins: 22, losses: 1, address: { street: 123 }, id: 1 },
    { name: 'Daniel Cormier', wins: 21, losses: 1, address: { street: 123 }, id: 1 },
    { name: 'Brock Lesnar', wins: 5, losses: 3, address: { street: 123 }, id: 1 }
  ];
  // pagination end

  // table begin
  tableList = [];
  filteredLists = []
  options: any = {};
  // tableHeadList: any[] = [
  //   { columnName: 'Id', isSorting: true, sortBy: 'id', headerClassName: 'set-width', tdPropertyName: 'tdClassName', thNgIfCondition: false, tdNgIfCondition: 'isHide' },
  //   { columnName: 'User-Id', sortBy: 'userId', isSorting: true },
  //   { columnName: 'Title', sortBy: 'title', isSorting: true },
  //   { columnName: 'Post', sortBy: 'body', isSorting: true },
  //   // { columnName: 'Action', isSorting: true, inputType: 'inputType', inputLabel: 'actionLink', },
  //   { columnName: 'Action', isSorting: true, inputType: 'inputType' },
  //   // { columnName: 'link', isSorting: true, sortBy: 'id', inputType: 'inputType', inputLabel: 'link'},
  // ];

  tableHeadList: any[] = [
    { columnName: 'Id', isSorting: true, sortBy: 'address.street' },
    { columnName: 'User-Id', sortBy: 'name', isSorting: true },
    { columnName: 'Title', sortBy: 'wins', isSorting: true },
    { columnName: 'Post', sortBy: 'losses', isSorting: true },
    // { columnName: 'Action', isSorting: true, inputType: 'inputType', inputLabel: 'actionLink', },
    // { columnName: 'Action', isSorting: true, inputType: 'inputType' },
    // { columnName: 'link', isSorting: true, sortBy: 'id', inputType: 'inputType', inputLabel: 'link'},
  ];
  // table end
  constructor(private demoSer: DemoService, private maSearch: MaSearchPipe) { }

  ngOnInit() {
    // isDate()
    this.init();
    // table begin
    this.demoSer.getData().subscribe(data => {
      this.originalData = data;
      this.tableList = data;
      this.tableList[0].isChecked = true;
      this.tableList[1].bind = 2;
      this.tableList.forEach(element => {
        element.date = new Date();
        element.inputType = 'checkbox';
        element.actionLink = 'save';
        element.link = element.id;
        // element.isChecked = true;
        // element.trClassName = element.isChecked ? 'change-background' : ''
        element.trClassName = element.isChecked ? 'change-background' : ''
        // element.isHide = element.isChecked;
        // element.trNgIfCondition = element.isChecked;


      });
      this.options.dataList = this.fighters;
      // this.options.dataList = this.tableList;
      // this.list = this.tableList
      this.options = Object.assign({}, this.options);
    });
    // table end
  }

  search() {
    this.tableList = this.maSearch.transform(this.originalData, { title: this.name }, null);
    this.options.dataList = this.tableList;
    this.options = Object.assign({}, this.options);
  }

  init() {
    this.options = {
      dataList: [],
      headList: this.tableHeadList,
      isScrollable: true,
      sorting: true,
      message: 'no records found',
    };
  }

  sortingChange(list: any[]): void {
    this.tableList.forEach(element => {
      element.inputType = 'checkbox';
      element.actionName = 'save';
      element.trClassName = element.isChecked ? 'change-background' : '',
        element.tdClassName = element.isChecked ? 'change-background' : ''
      element.isHide = element.isChecked;
      // element.trNgIfCondition = element.isChecked;

    });
    this.options.dataList = this.tableList;
    this.options = Object.assign({}, this.options);
  }

  listChange(): void {
    console.log(this.tableList)
    this.tableList.forEach(element => {
      element.inputType = 'checkbox';
      element.actionName = 'save';
      element.className = element.isChecked ? 'change-background' : '',
        element.tdClassName = element.isChecked ? 'change-background' : ''
    });
  }

  edit(item) {
    console.log(this.tableList)

    console.log(item);
  }

  maTableInputOnChange(item: any) {
    console.log(this.tableList);
    console.log(item);
  }

  pageChanged(list) {
    console.log('paginatio', list);
    this.options.dataList = list;
    this.options = Object.assign({}, this.options);
  }
}
