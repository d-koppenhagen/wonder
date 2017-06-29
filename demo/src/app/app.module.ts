import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
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
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
