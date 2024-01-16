import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ValidateComponent} from "./validate/validate.component";
import {TestingMainComponent} from "./testing-main/testing-main.component";

const routes: Routes = [ {

  path: '', component: TestingMainComponent,
  children : [
        { path: '', component: ValidateComponent}
      ]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
