import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutingModule } from './modules/routing/routing.module';
import { AppComponent } from './app.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';

@NgModule({
  declarations: [AppComponent, CodeEditorComponent],
  imports: [BrowserModule, BrowserAnimationsModule, RoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
