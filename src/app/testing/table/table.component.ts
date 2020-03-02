import { Component, OnInit } from '@angular/core';
import { DemoService } from '../../demo.service';
import { isDate, isObject } from 'util';
import { MaSearchPipe, MaWinsSearchPipe } from 'projects/ma-table/src/public-api';

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
  check: any;
  loading: boolean = true;
  pages: any[] = [
    { id: 1, value: 3 },
    { id: 2, value: 5 },
    { id: 3, value: 1 }
  ];
  fighters: any = [
    { name: 'Conor McGregor', wins: 21, losses: 3, id: 1, date: new Date(), categoryName:[{categoryName: 'a'}] },
    { name: 'Tony Ferguson', wins: 23, losses: 3, address: { street: { area: 'sdf' } }, id: 1, date: new Date(), categoryName:[{categoryName: 'b'}] },
    { name: 'Max Holloway', wins: 19, losses: 3, address: { street: { area: 'dsfd' } }, id: 1, date: new Date(), },
    { name: 'Jon Jones', wins: 22, losses: 1, address: { street: { area: 'wewer' } }, id: 1, date: new Date() },
    { name: 'bm Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'Daniel Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'f Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'nm Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'm Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'mnb Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'z Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 't Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'c Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'r Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'v Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'm Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'e Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date(), categoryName:[{categoryName: 'c'}] },
    { name: 'k Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'z Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'v Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'q Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'w Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'n Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'n Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'm Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'o Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'n Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'p Cormier', wins: 21, losses: 1, address: { street: { area: 'uty' } }, id: 1, date: new Date() },
    { name: 'w Lesnar', wins: 5, losses: 3, address: { street: { area: 'nmn' } }, id: 1, date: new Date() }
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
    { columnName: 'Id', isSorting: true, sortBy: 'id' },
    { columnName: 'User-Id', sortBy: 'name', isSorting: true, pipe: { name: 'uppercase' } },
    { columnName: 'Title', sortBy: 'wins', isSorting: true, pipe: { name: 'currency', format: 'USD' } },
    { columnName: 'Post', sortBy: 'losses', isSorting: true },
    { columnName: 'action', sortBy: 'categoryName', isSorting: true },
    // { columnName: 'wwww', sortBy: 'abc', isSorting: true },
    { columnName: 'Date', sortBy: 'date', isSorting: false, pipe: { name: 'date', format: 'MM/dd/yyyy' }, isHideHeadKey: true },
    { columnName: 'Action', isSorting: true, inputType: 'inputType', inputLabel: 'actionLink', iconClassName: 'iconClass', actionClass: 'actionClassName' },
    // { columnName: 'Action', isSorting: true, inputType: 'inputType' },
    // { columnName: 'link', isSorting: true, sortBy: 'id', inputType: 'inputType', inputLabel: 'link'},
  ];


  // table end
  constructor(private demoSer: DemoService, private maSearch: MaSearchPipe, private winPipe: MaWinsSearchPipe) {

  }

  ngOnInit() {
    // this.check = ['address', 'street'];
    // this.fighters.forEach(element => {
    //   console.log(element['address']['street']);
    // });
    // isDate()
    this.init();
    // table begin

    this.commom();
    // table end
  }

  commom() {
    this.demoSer.getData().subscribe(data => {
      // this.originalData = data;
      // this.tableList = data;
      this.loading = false;
      // this.tableList[0].isChecked = true;
      // this.tableList[1].bind = 2;
      this.fighters.forEach((element, i) => {
        element.date = new Date();
        element.inputType = 'link-icon';
        element.iconClass = 'ico-x-o-red';
        element.actionClassName = 'link-remove';
        // element.actionName =  i === 1 ? [{id:1, actionName: 'sant'}, {id:2, actionName: 'pant'}, {id:3, actionName: 'dfgdf'}]: [{id:1, actionName: 'jkk'}, {id:2, actionName: 'ad'}, {id:3, actionName: 'mwe'}];
          // element.actionName = [];
        // i === 0 ? element.actionName.push({ actionName: 'mas' }) : i === 1 ? element.actionName.push({ actionName: 'abc' }) : element.actionName.push({ actionName: 'sas' })

        // element.abc = i === 0 ? [] : i === 1 ? []: i===2 ? [] : i ===3 ? [] : i ===4 ? [] : [{ id: 1, abc: 'hj' }, { id: 2, abc: 'jh' }, { id: 3, abc: 'jk' }];
        // element.actionLink = ['save', 'edit'];
        element.link = element.id;
        // element.isChecked = true;
        // element.trClassName = element.isChecked ? 'change-background' : ''
        element.trClassName = element.isChecked ? 'change-background' : '';
        // element.isHide = element.isChecked;
        // element.trNgIfCondition = element.isChecked;


      });
      let stringify = JSON.stringify(this.fighters);
      this.originalData = JSON.parse(stringify);
      this.options.dataList = this.fighters;
      // this.options.dataList = this.tableList;
      // this.list = this.tableList
      this.options = Object.assign({}, this.options);
    });
  }

  fun(keyPath: any, obj: any) {
    if (Array.isArray(keyPath)) {
      for (const i of keyPath) {
        obj = obj[i] = obj[i] || {};
      }
      return isObject(obj) ? Object.keys(obj).length > 0 ? obj : null : obj;
    } else {
      return obj[keyPath];
    }
  }

  search() {
    // this.tableList = this.maSearch.transform(this.originalData, { title: this.name }, null);
    this.tableList = this.winPipe.transform(this.originalData, ['id', 'name', 'wins', 'losses', 'actionName', 'date', 'abc'], this.name, ['actionName', 'abc']);

    this.options.dataList = this.tableList;
    this.options = Object.assign({}, this.options);
  }

  init() {
    this.options = {
      dataList: [],
      headList: this.tableHeadList,
      isScrollable: false,
      sorting: true,
      message: 'no records found',
    };
  }

  sortingChange(list: any[]): void {
    // this.tableList.forEach(element => {
    //   element.inputType = 'checkbox';
    //   element.actionName = 'save';
    //   element.trClassName = element.isChecked ? 'change-background' : '',
    //     element.tdClassName = element.isChecked ? 'change-background' : '';
    //   element.isHide = element.isChecked;
    //   // element.trNgIfCondition = element.isChecked;

    // });
    this.options.dataList = this.fighters;
    this.options = Object.assign({}, this.options);
  }

  listChange(): void {
    console.log(this.tableList)
    // this.tableList.forEach(element => {
    //   element.inputType = 'checkbox';
    //   element.actionName = 'save';
    //   element.className = element.isChecked ? 'change-background' : '',
    //     element.tdClassName = element.isChecked ? 'change-background' : ''
    // });
  }

  edit(item) {
    console.log(this.tableList)

    console.log(item);
  }

  maTableInputOnChange(item: any) {
    // console.log(this.tableList);
    console.log(item);
  }

  pageChanged(list) {
    console.log('paginatio', list);
    this.options.dataList = list;
    this.options = Object.assign({}, this.options);
  }

  mouseLeave(item: any) {
    console.log(item, 'mouseLeave')
  }

  mouseEnter(item: any) {
    console.log(item, 'mouseEnter')
  }
}
