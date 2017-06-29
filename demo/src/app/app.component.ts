import { Component } from '@angular/core';
import { Wonder } from 'wonder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ Wonder ]
})
export class AppComponent {
  title = 'app';

  constructor(wonder: Wonder) {
    console.log(wonder);
  }
}
