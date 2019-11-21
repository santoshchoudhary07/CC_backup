import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ma-tree',
  templateUrl: './ma-tree.component.html',
  styleUrls: ['./ma-tree.component.css']
})
export class MaTreeComponent implements OnInit {
  list: any[];
  constructor() { }

  ngOnInit() {
    // this.list = [
    //   { title: 'Key', subList: [{title: 'aaa'}, {title: 'bbb'}, {title: 'ccc'}], eee: [{title: 'dd'}, {title: 'ee'}, {title: 'ff'}]},
    //   { title: 'Loan details', isOpen: false, isDisabled: false, qqq: [{title: 'gg'}, {title: 'hh'}, {title: 'kk', sxx: [{title: 'll'}, {title: 'mm'}, {title: 'nn', sxx: [{title: 'oo'}, {title: 'pp'}, {title: 'qq'}]}]}]  },
    //   { title: 'Loan' },
    //   { title: 'Notes', isDisabled: false }
    // ];

    this.list = [
      {
        name: 'Fruit',
        isOpen: true,
        fruits: [
          { name: 'Apple' },
          { name: 'Banana' },
          { name: 'Fruit loops' },
        ]
      }, {
        name: 'Vegetables',
        children: [
          {
            name: 'Green',
            isOpen: true,
            greenVegetables: [
              { name: 'Broccoli',   fruits: [
                { name: 'Apple',   fruits: [
                  { name: 'Apple',   fruits: [
                    { name: 'Apple',   fruits: [
                      { name: 'Apple',   fruits: [
                        { name: 'Apple',   fruits: [
                          { name: 'Apple' },
                          { name: 'Banana' },
                          { name: 'Fruit loops' },
                        ] },
                        { name: 'Banana' },
                        { name: 'Fruit loops' },
                      ] },
                      { name: 'Banana' },
                      { name: 'Fruit loops' },
                    ] },
                    { name: 'Banana' },
                    { name: 'Fruit loops' },
                  ] },
                  { name: 'Banana' },
                  { name: 'Fruit loops' },
                ] },
                { name: 'Banana' },
                { name: 'Fruit loops' },
              ] },
              { name: 'Brussel sprouts' },
            ]
          }, {
            name: 'Orange',
            orange: [
              { name: 'Pumpkins' },
              { name: 'Carrots' },
            ]
          },
        ]
      },
    ];

    // this.list = [
    //   {
    //     id: 1, title: 'Vegetables', parent: 0, children: [
    //       {
    //         id: 3, title: 'Green', parent: 1, children: [
    //           {
    //             id: 4, title: 'hello', parent: 3, children: [
    //               { id: 5, title: 'hello', parent: 4 },
    //               { id: 6, title: 'hello', parent: 4 }
    //             ]
    //           },
    //           { id: 7, title: 'hello', parent: 3 }
    //         ]
    //       }
    //     ]
    //   },
    //   {
    //     id: 2, title: 'hello', parent: 0, children: [
    //       { id: 8, title: 'hello', parent: 2 }
    //     ]
    //   }
    // ];
  }

  maTreeOnChange(treeObject: any): void {
    console.log(treeObject);
  }
}
