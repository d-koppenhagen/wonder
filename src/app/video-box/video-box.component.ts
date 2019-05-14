import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-video-box',
  templateUrl: './video-box.component.html',
  styleUrls: ['./video-box.component.scss']
})
export class VideoBoxComponent implements OnInit {
  @Input() title;
  @Input() src;

  constructor() { }

  ngOnInit() {
  }

}
