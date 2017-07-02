import { Component } from '@angular/core';
import { Wonder } from 'wonder';

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
        .then(function(data) {
          console.log(data);
        })
        .catch(function(error) {
          console.log(error);
        });
  }
}
