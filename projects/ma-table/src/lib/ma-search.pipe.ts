import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ma-search'
})
export class MaSearchPipe implements PipeTransform {
  transform(items: any, filter: any, anyFilter?: string): any {
    if (!Array.isArray(items)) {
      return items;
    }
    if (filter && Array.isArray(items)) {
      let filterKeys = Object.keys(filter);
      items = items.filter(item => {
        return filterKeys.reduce((x, keyName) =>
          (x && new RegExp(filter[keyName], 'gi').test(item[keyName])), true);
      });
    }
    if (anyFilter) {
      items = items.filter(item => {
        let filterKeys = Object.keys(item);
        return filterKeys.some((keyName) => {
          return item[keyName].toString().toLowerCase().indexOf(anyFilter.toString().toLowerCase()) !== -1;
        });
      });
    }
    return items;
  }
}
