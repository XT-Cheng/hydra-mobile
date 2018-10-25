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
import { InterruptOperationComponent } from './features/operation/interrupt-operation.component';
import { LogoffOperationComponent } from './features/operation/logoff-operation.component';
import { PackingComponent } from './features/operation/packing.component';
import { LogoffInputBatchComponent } from './features/operation/logoffInputBatch-operation.component';
import { FindBatchComponent } from './features/material/find-batch.component';
import { AdjustBatchQuantityComponent } from './features/material/adjust-batch-quantity.component';
import { LogonBatchComponent } from './features/material/logon-batch.component';
import { LogoffBatchComponent } from './features/material/logoff-batch.component';
import { ReplenishBatchComponent } from './features/material/replenish-batch.component';
import { LogonOperatorComponent } from './features/operator/logon-operator.component';
import { OperatorListComponent } from './features/operator/operatorList.component';
import { LogoffOperatorComponent } from './features/operator/logoff-operator.component';
import { ToolListComponent } from './features/tool/toolList.component';
import { LogonToolComponent } from './features/tool/logon-tool.component';
import { LogoffToolComponent } from './features/tool/logoff-tool.component';
import { ChangeMachineStatusComponent } from './features/machine/change-machine-status.component';
import { BapiTestComponent } from './bapi.test.component';
import { ScrapOperationComponent } from './features/operation/scrap-operation.component';

const OPERATION_COMPONENTS = [
  LogonOperationComponent,
  OperationListComponent,
  GenerateOutputSemiBatchComponent,
  ChangeInputBatchComponent,
  GenerateOutputFGBatchComponent,
  InterruptOperationComponent,
  LogoffOperationComponent,
  LogoffInputBatchComponent,
  ScrapOperationComponent,
  FindBatchComponent,
  PackingComponent
];

const OPERAOR_COMPONENTS = [
  OperatorListComponent,
  LogonOperatorComponent,
  LogoffOperatorComponent
];

const TOOL_COMPONENTS = [
  ToolListComponent,
  LogonToolComponent,
  LogoffToolComponent
];

const MACHINE_COMPONENTS = [
  MachineListComponent,
  ChangeMachineStatusComponent
];

const MATERIAL_COMPONENTS = [
  MaterialListComponent,
  CreateBatchComponent,
  MoveBatchComponent,
  SplitBatchComponent,
  AdjustBatchQuantityComponent,
  LogonBatchComponent,
  LogoffBatchComponent,
  ReplenishBatchComponent
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
    BapiTestComponent,
    ...OPERATION_COMPONENTS,
    ...MACHINE_COMPONENTS,
    ...MATERIAL_COMPONENTS,
    ...AUTH_COMPONENTS,
    ...OPERAOR_COMPONENTS,
    ...TOOL_COMPONENTS,
    ...COMPONENTS_NOROUTE
  ],
  entryComponents: COMPONENTS_NOROUTE
})
export class RoutesModule { }
