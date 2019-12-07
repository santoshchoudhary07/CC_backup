import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-xyz',
  template: `
    <p>
      xyz works!
    </p>
  `,
  styles: []
})
export class XyzComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
