import { NgModule } from '@angular/core';

// auth
import { LayoutAuthComponent } from './auth/auth.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './default/header/header.component';
import { LayoutDefaultComponent } from './default/default.component';
import { FooterComponent } from './default/footer/footer.component';
import { WeUiModule } from '../../../node_modules/ngx-weui';

const PASSPORT = [
  LayoutAuthComponent
];

const DEFAULT = [
  HeaderComponent,
  FooterComponent,
  LayoutDefaultComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    WeUiModule,
    ReactiveFormsModule
  ],
  providers: [],
  declarations: [
    ...PASSPORT,
    ...DEFAULT
  ],
  exports: [
    ...PASSPORT,
    ...DEFAULT
  ]
})
export class LayoutModule { }
