import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
  AUTH_ERRORS_KEY,
  AUTH_FAIL_REDIRECT,
  AUTH_MESSAGE_KEY,
  AUTH_METHOD,
  AUTH_SUCCESS_REDIRECT,
  AUTH_URL,
  WEBAPI_HOST,
} from '@core/constants';
import { getDeepFromObject } from '@core/helpers';
import { AuthResult } from '@core/auth/providers/authResult';
import { AuthToken } from '@core/auth/providers/authToken';
import { TokenService } from '@core/auth/providers/tokenService';
import { TokenStorage } from '@core/auth/providers/tokenStorage';

@Injectable()
export class AuthService {
  constructor(protected http: HttpClient,
    protected tokenService: TokenService, ) {
  }

  /**
   * Retrieves current authenticated token stored
   * @returns {Observable<any>}
   */
  getToken(): Observable<AuthToken> {
    return this.tokenService.get();
  }

  /**
   * Returns true if auth token is presented in the token storage
   * @returns {Observable<any>}
   */
  isAuthenticated(): Observable<boolean> {
    return this.getToken()
      .pipe(map((token: AuthToken) => token.isValid()));
  }

  /**
   * Returns tokens stream
   * @returns {Observable<NbAuthSimpleToken>}
   */
  onTokenChange(): Observable<AuthToken> {
    return this.tokenService.tokenChange();
  }

  /**
   * Returns authentication status stream
   * @returns {Observable<boolean>}
   */
  onAuthenticationChange(): Observable<boolean> {
    return this.onTokenChange()
      .pipe(map((token: AuthToken) => token.isValid()));
  }

  authenticate(data?: any): Observable<AuthResult> {
    const method = AUTH_METHOD;
    const url = `${WEBAPI_HOST}${AUTH_URL}`;

    return this.http.request(method, url, { body: data, observe: 'response' })
      .pipe(
        this.validateToken(),
        map((res: HttpResponse<Object>) => {
          return new AuthResult(
            true,
            res,
            AUTH_SUCCESS_REDIRECT,
            [],
            getDeepFromObject(res.body,
              AUTH_MESSAGE_KEY,
              'You have been successfully logged in.'),
            getDeepFromObject(res.body,
              TokenStorage.TOKEN_KEY));
        }),
        switchMap((ret: AuthResult) => {
          return this.processResultToken(ret);
        }),
        catchError((res: any) => {
          let errors = [];
          if (res instanceof HttpErrorResponse) {
            errors = getDeepFromObject(res.error,
              AUTH_ERRORS_KEY,
              'Login/Email combination is not correct, please try again.');
          } else {
            errors.push('Something went wrong.');
          }

          return observableOf(
            new AuthResult(
              false,
              res,
              AUTH_FAIL_REDIRECT,
              errors,
            ));
        }),
    );
  }

  protected validateToken(): any {
    return map((res: HttpResponse<Object>) => {
      const token = getDeepFromObject(res.body, TokenStorage.TOKEN_KEY);
      if (!token) {
        throw new Error('Could not extract token from the response.');
      }
      return res;
    });
  }

  private processResultToken(result: AuthResult) {
    if (result.isSuccess() && result.getRawToken()) {
      return this.tokenService.setRaw(result.getRawToken())
        .pipe(
          switchMap(() => this.tokenService.get()),
          map((token: AuthToken) => {
            result.setToken(token);
            return result;
          }),
      );
    }

    return observableOf(result);
  }
}
