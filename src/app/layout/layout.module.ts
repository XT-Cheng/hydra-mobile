import { NgModule } from '@angular/core';

// auth
import { LayoutAuthComponent } from './auth/auth.component';
import { CommonModule } from '../../../node_modules/@angular/common';
import { FormsModule, ReactiveFormsModule } from '../../../node_modules/@angular/forms';
import { RouterModule } from '../../../node_modules/@angular/router';

const PASSPORT = [
  LayoutAuthComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule
  ],
  providers: [],
  declarations: [
    ...PASSPORT
  ],
  exports: [
    ...PASSPORT
  ]
})
export class LayoutModule { }
