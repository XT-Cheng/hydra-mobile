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
import { CreateBatchComponent } from './features/material/create-batch.component';
import { MoveBatchComponent } from './features/material/move-batch.component';
import { SplitBatchComponent } from './features/material/split-batch.component';
import { GenerateOutputSemiBatchComponent } from './features/operation/generate-output-semi.component';
import { GenerateOutputFGBatchComponent } from './features/operation/generate-output-fg.component';
import { ChangeInputBatchComponent } from './features/operation/changeInputBatch-operation.component';

const OPERATION_COMPONENTS = [
  LogonOperationComponent,
  OperationListComponent,
  GenerateOutputSemiBatchComponent,
  ChangeInputBatchComponent,
  GenerateOutputFGBatchComponent
];

const MACHINE_COMPONENTS = [
  MachineListComponent
];

const MATERIAL_COMPONENTS = [
  MaterialListComponent,
  CreateBatchComponent,
  MoveBatchComponent,
  SplitBatchComponent
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
