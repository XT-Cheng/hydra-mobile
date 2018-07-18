import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WeUiModule } from '../../../node_modules/ngx-weui';
import { LayoutModule } from '../layout/layout.module';
import { UserLoginComponent } from './auth/login/login.component';
import { RouteRoutingModule } from './routes-routing.module';

const COMPONENTS = [
  // passport pages
  UserLoginComponent,
  // single page
];
const COMPONENTS_NOROUTE = [];

@NgModule({
  imports: [RouteRoutingModule, FormsModule, LayoutModule, WeUiModule],
  exports: [RouterModule],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUTE
  ],
  entryComponents: COMPONENTS_NOROUTE
})
export class RoutesModule { }
