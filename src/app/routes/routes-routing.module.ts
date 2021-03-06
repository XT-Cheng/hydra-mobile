import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutAuthComponent } from '../layout/auth/auth.component';
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { UserLoginComponent } from './auth/login/login.component';
import { MachineListComponent } from './features/machine/machineList.component';
import { MaterialListComponent } from './features/material/materialList.component';
import { CreateBatchComponent } from './features/material/create-batch.component';
import { MoveBatchComponent } from './features/material/move-batch.component';
import { SplitBatchComponent } from './features/material/split-batch.component';
import { OperationListComponent } from './features/operation/operationList.component';
import { LogonOperationComponent } from './features/operation/logon-operation.component';
import { RoutingGuard } from './routing-guard';
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
import { OperatorListComponent } from './features/operator/operatorList.component';
import { LogonOperatorComponent } from './features/operator/logon-operator.component';
import { LogoffOperatorComponent } from './features/operator/logoff-operator.component';
import { ToolListComponent } from './features/tool/toolList.component';
import { LogonToolComponent } from './features/tool/logon-tool.component';
import { LogoffToolComponent } from './features/tool/logoff-tool.component';
import { ChangeMachineStatusComponent } from './features/machine/change-machine-status.component';
import { BapiTestComponent } from './bapi.test.component';
import { ScrapOperationComponent } from './features/operation/scrap-operation.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutDefaultComponent,
    children: [
      { path: 'bapi/test', component: BapiTestComponent },
      { path: 'operation', component: OperationListComponent },
      { path: 'material', component: MaterialListComponent },
      { path: 'operator', component: OperatorListComponent },
      { path: 'machine', component: MachineListComponent },
      { path: 'tool', component: ToolListComponent },
      { path: 'tool/logon', component: LogonToolComponent },
      { path: 'tool/logoff', component: LogoffToolComponent },
      { path: 'operation/logon', component: LogonOperationComponent },
      { path: 'operator/logon', component: LogonOperatorComponent },
      { path: 'operator/logoff', component: LogoffOperatorComponent },
      { path: 'operation/semiBatchGen', component: GenerateOutputSemiBatchComponent },
      { path: 'operation/fgBatchGen', component: GenerateOutputFGBatchComponent },
      { path: 'operation/changeInputBatch', component: ChangeInputBatchComponent },
      { path: 'operation/interrupt', component: InterruptOperationComponent },
      { path: 'operation/scrap', component: ScrapOperationComponent },
      { path: 'operation/logoff', component: LogoffOperationComponent },
      { path: 'operation/logoffBatch', component: LogoffInputBatchComponent },
      { path: 'operation/packing', component: PackingComponent },
      { path: 'material/create', component: CreateBatchComponent },
      { path: 'material/move', component: MoveBatchComponent },
      { path: 'material/split', component: SplitBatchComponent },
      { path: 'material/adjustBatchQantity', component: AdjustBatchQuantityComponent },
      { path: 'material/find', component: FindBatchComponent },
      { path: 'material/logon', component: LogonBatchComponent },
      { path: 'material/logoff', component: LogoffBatchComponent },
      { path: 'material/replenish', component: ReplenishBatchComponent },
      { path: 'machine/changeStatus', component: ChangeMachineStatusComponent }
    ]
  },
  // auth
  {
    path: 'auth',
    component: LayoutAuthComponent,
    children: [
      { path: 'login', component: UserLoginComponent, data: { title: '登录', titleI18n: 'pro-login' } },
      { path: '**', redirectTo: 'login' }
      // { path: 'register', component: UserRegisterComponent, data: { title: '注册', titleI18n: 'pro-register' } },
      // { path: 'register-result', component: UserRegisterResultComponent, data: { title: '注册结果', titleI18n: 'pro-register-result' } }
    ]
  },
  // 单页不包裹Layout
  // { path: 'callback/:type', component: CallbackComponent },
  // { path: 'lock', component: UserLockComponent, data: { title: '锁屏', titleI18n: 'lock' } },
  // { path: '403', component: Exception403Component },
  // { path: '404', component: Exception404Component },
  // { path: '500', component: Exception500Component },
  // { path: '**', redirectTo: 'auth' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [RoutingGuard]
})
export class RouteRoutingModule { }
