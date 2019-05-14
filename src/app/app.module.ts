import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatGridListModule,
  MatToolbarModule,
  MatCardModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatListModule
} from '@angular/material';
import 'hammerjs';

import { AppComponent } from './app.component';
import { VideoBoxComponent } from './video-box/video-box.component';
import { LogonFormComponent } from './logon-form/logon-form.component';
import { ChatComponent } from './chat/chat.component';
import { CallFormComponent } from './call-form/call-form.component';

@NgModule({
  declarations: [
    AppComponent,
    VideoBoxComponent,
    LogonFormComponent,
    ChatComponent,
    CallFormComponent
  ],
  imports: [
    BrowserModule,
    MatGridListModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    BrowserAnimationsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
