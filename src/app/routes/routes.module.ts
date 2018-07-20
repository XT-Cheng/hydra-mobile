import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { WeUiModule } from 'ngx-weui';
import { LayoutModule } from '../layout/layout.module';
import { UserLoginComponent } from './auth/login/login.component';
import { RouteRoutingModule } from './routes-routing.module';
import { LogonOperationComponent } from './features/operation/logon-operation.component';
import { SharedModule } from '../shared/shared.module';
import { OperationListComponent } from './features/operation/operationList.component';
import { MaterialListComponent } from './features/material/materialList.component';
import { MachineListComponent } from './features/machine/machineList.component';

const OPERATION_COMPONENTS = [
  LogonOperationComponent,
  OperationListComponent
];

const MACHINE_COMPONENTS = [
  MachineListComponent
];

const MATERIAL_COMPONENTS = [
  MaterialListComponent
];

const AUTH_COMPONENTS = [
  UserLoginComponent
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
    ...OPERATION_COMPONENTS,
    ...MACHINE_COMPONENTS,
    ...MATERIAL_COMPONENTS,
    ...AUTH_COMPONENTS,
    ...COMPONENTS_NOROUTE
  ],
  entryComponents: COMPONENTS_NOROUTE
})
export class RoutesModule { }
