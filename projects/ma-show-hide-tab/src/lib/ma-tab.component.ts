import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { TabModel } from './ma-tab.model';

@Component({
  selector: 'ma-tab',
  template: `
  <header class="tabs-head">
  <nav class="tabs-nav">
    <ul>
      <li *ngFor="let tab of tabList; let i=index" (click)="getTab(tab)"
        [ngClass]="tab==selectedTab ? 'current': ''">
        <a>{{tab.tabText}}</a>
      </li>
    </ul>
  </nav>
</header>
  `,
  styles: []
})

export class MaTabComponent implements OnInit {
  @Input() tabList: TabModel[];
  @Output() tab = new EventEmitter<TabModel>();

  selectedTab: TabModel;

  constructor() { }

  ngOnInit() {
    let defaultItem = this.tabList.filter(x => x.isDefault)
    if (defaultItem.length > 0) {
      this.getTab(defaultItem[0])
    };
  }

  getTab(tab: TabModel) {
    this.selectedTab = tab;
    this.tab.emit(tab);
  }
}