import { Pipe, PipeTransform } from '@angular/core';
import { isArray } from 'util';

@Pipe({
  name: 'maSearchTerm'
})
export class MaWinsSearchPipe implements PipeTransform {
  transform(value: any[], keys: any, term?: string, nestedKeys?: any[]): any[] {
    if (!term) { return value; }
    return (value || []).filter((item: any) => {
      return keys.some((key: any) => {
        if (item[key]) {
          if (isArray(item[key])) {
            if (nestedKeys && nestedKeys.length > 0) {
              return nestedKeys.some(nestedKey => {
                return ((item.hasOwnProperty(key) && item[key] ? item[key].find(nestedData => {
                  return new RegExp(term.toString(), 'gi').test(nestedData[nestedKey]);
                }) : ''));
              });
            }
          } else {
            return ((item.hasOwnProperty(key) && item[key] ? new RegExp(term.toString(), 'gi').test(item[key]) : '') ||
              (item[key]['name'] ? new RegExp(term, 'gi').test(item[key]['name']) : ''));
          }
        }
      });
    });
  }
}


export interface model {
  myList: myModel[];
}

export class myModel {
  name: string;
  id: number;
}

export class componentsClass {
  myData: model;

  constructor() {
    this.myData = { myList: [{ name: 'abc', id: 1 }] }
  }
}