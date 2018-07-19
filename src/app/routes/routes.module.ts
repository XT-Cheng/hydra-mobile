import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WeUiModule } from 'ngx-weui';
import { LayoutModule } from '../layout/layout.module';
import { UserLoginComponent } from './auth/login/login.component';
import { RouteRoutingModule } from './routes-routing.module';
import { LogonOperationComponent } from './features/operation/components/logon-operation.component';
import { SharedModule } from '../shared/shared.module';

const COMPONENTS = [
  // passport pages
  UserLoginComponent,
  LogonOperationComponent
  // single page
];
const COMPONENTS_NOROUTE = [];

@NgModule({
  imports: [
    RouteRoutingModule,
    FormsModule,
    LayoutModule,
    WeUiModule,
    SharedModule],
  exports: [RouterModule],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUTE
  ],
  entryComponents: COMPONENTS_NOROUTE
})
export class RoutesModule { }
