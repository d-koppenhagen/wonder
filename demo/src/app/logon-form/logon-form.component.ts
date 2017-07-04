import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-logon-form',
  templateUrl: './logon-form.component.html',
  styleUrls: ['./logon-form.component.css']
})
export class LogonFormComponent implements OnInit {
  @Output() data: EventEmitter<any> = new EventEmitter();
  loginData = 'user@localhost:9110';

  constructor() { }

  ngOnInit() {
  }

  submitForm() {
    this.data.emit(this.loginData);
  }

}
