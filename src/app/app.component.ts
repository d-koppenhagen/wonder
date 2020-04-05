import { Component } from '@angular/core';
import { Wonder } from 'lib/dist/wonder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  wonder: Wonder;

  constructor() {
    this.wonder = new Wonder();
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
