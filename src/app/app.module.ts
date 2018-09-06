import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { WeUiModule, ToastConfig } from 'ngx-weui';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '@core/core.module';
import { StartupService } from '@core/startup/startup.service';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from './layout/layout.module';
import { RoutesModule } from './routes/routes.module';
import { SharedModule } from './shared/shared.module';

export function StartupServiceFactory(startupService: StartupService): Function {
  return () => startupService.load();
}

export function toastConfig() {
  return Object.assign(new ToastConfig(),
    {
      success: {
        text: 'Successed', icon: 'weui-icon-success-no-circle', time: 0
      },
      loading: {
        text: 'Loading…', icon: 'weui-loading', time: 0
      }
    });
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LayoutModule,
    WeUiModule.forRoot(),
    CoreModule.forRoot(),
    BrowserAnimationsModule,
    IonicStorageModule.forRoot(),
    SharedModule,
    RoutesModule
  ],
  providers: [
    StartupService,
    {
      provide: APP_INITIALIZER,
      useFactory: StartupServiceFactory,
      deps: [StartupService],
      multi: true
    },
    { provide: ToastConfig, useFactory: toastConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
