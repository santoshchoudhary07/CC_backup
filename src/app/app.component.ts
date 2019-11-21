import { Component, ViewChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  accordionList: any[];
  @ViewChild('section1', { static: true }) section1: TemplateRef<any>;
  @ViewChild('section2', { static: true }) section2: TemplateRef<any>;
  @ViewChild('section4', { static: true }) section4: TemplateRef<any>;
  @ViewChild('section3', { static: true }) section3: TemplateRef<any>;
  // @ViewChild('section1') section1: TemplateRef<any>;
  // @ViewChild('section2') section2: TemplateRef<any>;
  // @ViewChild('section3') section3: TemplateRef<any>;
  // @ViewChild('section4') section4: TemplateRef<any>;

  constructor() {
    this.accordionList = [];
   }

  ngOnInit(): void {
     this.accordionList = [
      { title: 'Key', sectionRef: this.section1 },
      { title: 'Loan details', isOpen: true, sectionRef: this.section2},
      { title: 'Loan', sectionRef: this.section3 },
      { title: 'Notes', sectionRef: this.section4 }
    ];
  }
}
