import { NgModule } from '@angular/core';
import { UserLoginComponent } from './auth/login/login.component';
import { RouteRoutingModule } from './routes-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '../layout/layout.module';

const COMPONENTS = [
  // passport pages
  UserLoginComponent,
  // single page
];
const COMPONENTS_NOROUTE = [];

@NgModule({
  imports: [ RouteRoutingModule, FormsModule, LayoutModule ],
  exports: [RouterModule],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUTE
  ],
  entryComponents: COMPONENTS_NOROUTE
})
export class RoutesModule {}
