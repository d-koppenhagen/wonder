import { Component } from '@angular/core';
import { Wonder } from '../../lib/src/wonder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ Wonder ]
})
export class AppComponent {
  constructor(public wonder: Wonder) {
    console.log(wonder);
  }

  login(loginData: string) {
    this.wonder.login(loginData)
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
  }
}
