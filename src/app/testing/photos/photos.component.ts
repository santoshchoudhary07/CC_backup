import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit {
  name: any = null;
  constructor() { }

  ngOnInit() {
  }

  onPhotosChanged(photo) {
    console.log(photo)
    console.log(name)
  }
}
