import { NgReduxModule } from '@angular-redux/store';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { ErrorInterceptorService } from '@core/interceptor/error.interceptor.service';
import { IonicStorageModule } from '@ionic/storage';

import { throwIfAlreadyLoaded } from '@core/module-import-guard';
import { AuthService } from '@core/auth/providers/authService';
import { TokenService } from '@core/auth/providers/tokenService';
import { TokenStorage } from '@core/auth/providers/tokenStorage';
import { ErrorService } from '@core/store/providers/error.service';
import { RootEpics } from '@core/store/store.epic';
import { EntityEpics } from '@core/store/entity/entity.epic';
import { UserService } from '@core/store/providers/user.service';
import { StateService } from '@core/store/providers/state.service';
import { SearchService } from '@core/store/providers/search.service';

const STORE_PROVIDERS = [
  ErrorService,
  RootEpics,
  EntityEpics,
  UserService,
  StateService,
  SearchService
];

const AUTH_PROVIDERS = [
  AuthService,
  TokenService,
  TokenStorage
];

const INTERCEPTOR_PROVIDERS = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptorService,
    multi: true
}
];

@NgModule({
  imports: [NgReduxModule, IonicStorageModule]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
        ngModule: CoreModule,
        providers: [...AUTH_PROVIDERS, ...INTERCEPTOR_PROVIDERS, ...STORE_PROVIDERS]
    };
}
}
