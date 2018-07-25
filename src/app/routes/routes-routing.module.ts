import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoutingGuard } from './routing-guard';
import { LayoutAuthComponent } from '../layout/auth/auth.component';
import { UserLoginComponent } from './auth/login/login.component';
import { LayoutDefaultComponent } from '../layout/default/default.component';
import { LogonOperationComponent } from './features/operation/logon-operation.component';
import { OperationListComponent } from './features/operation/operationList.component';
import { MachineListComponent } from './features/machine/machineList.component';
import { MaterialListComponent } from './features/material/materialList.component';
import { CreateBatchComponent } from './features/material/create-batch.component';
import { MoveBatchComponent } from './features/material/move-batch.component';
import { SplitBatchComponent } from './features/material/split-batch.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutDefaultComponent,
    children: [
      { path: 'operation', component: OperationListComponent},
      { path: 'material', component: MaterialListComponent},
      { path: 'machine', component: MachineListComponent},
      { path: 'operation/logon', component: LogonOperationComponent},
      { path: 'material/create', component: CreateBatchComponent},
      { path: 'material/move', component: MoveBatchComponent},
      { path: 'material/split', component: SplitBatchComponent},
      // { path: 'viewPoint', loadChildren: 'app/routes/features/viewPoint/viewPoint.module#ViewPointModule' },
      // 业务子模块
      // { path: 'widgets', loadChildren: './widgets/widgets.module#WidgetsModule' }
    ]
  },
  // 全屏布局
  // {
  //     path: 'fullscreen',
  //     component: LayoutFullScreenComponent,
  //     children: [
  //     ]
  // },
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
