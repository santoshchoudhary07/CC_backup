import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { isArray } from 'util';

@Component({
  selector: 'ma-tree',
  templateUrl: './ma-tree.component.html',
  styleUrls: ['./ma-tree.component.css']
})
export class MaTreeComponent implements OnInit {
  @Input() treeList: any[];
  @Input() renderProperty: string;
  @Output() maTreeOnChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  keys(tree: any): Array<string> {
    return Object.keys(tree);
  }

  toggleTree(item: any): void {
    item.isOpen = !item.isOpen;
  }

  checkArrayOfObjectKeys(treeObject: any): boolean {
    for (const key in treeObject) {
      if (isArray(treeObject[key])) {
        return true;
      }
    }
  }

  checkIfArray(item: any): boolean {
    if (isArray(item)) {
      return true;
    }
  }

  maInnerTreeOnChange(item: any): void {
    this.maTreeOnChange.emit(item);
  }

  addClass(currentElement: any): void {
    let allSpan = document.getElementsByTagName('span');
    let spanList = [].slice.call(allSpan);
    for (let element of spanList) {
      if (element.className === 'tree-property') {
        if (element !== currentElement) {
          element.className = '';
        }
      } else {
        currentElement.className = 'tree-property';
      }
    }
  }
}
