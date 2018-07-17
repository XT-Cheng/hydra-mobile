import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthToken } from '@core/auth/providers/authToken';
import { TokenStorage } from '@core/auth/providers/tokenStorage';

/**
 * Service that allows you to manage authentication token - get, set, clear and also listen to token changes over time.
 */
@Injectable()
export class TokenService {

  protected token$: BehaviorSubject<AuthToken> = new BehaviorSubject(null);

  constructor(protected tokenStorage: TokenStorage) {
    this.publishStoredToken();
  }

  /**
   * Publishes token when it changes.
   * @returns {Observable<NbAuthToken>}
   */
  tokenChange(): Observable<AuthToken> {
    return this.token$
      .pipe(
        filter(value => !!value)
      );
  }

  /**
   * Sets a token into the storage. This method is used by the NbAuthService automatically.
   *
   * @param {NbAuthToken} token
   * @returns {Observable<any>}
   */
  set(token: AuthToken): Observable<null> {
    this.tokenStorage.set(token);
    this.publishStoredToken();
    return observableOf(null);
  }

  /**
   * Sets a raw token into the storage. This method is used by the NbAuthService automatically.
   *
   * @param {string} token
   * @returns {Observable<any>}
   */
  setRaw(token: string): Observable<null> {
    this.tokenStorage.setRaw(token);
    this.publishStoredToken();
    return observableOf(null);
  }

  /**
   * Returns observable of current token
   * @returns {Observable<AuthToken>}
   */
  get(): Observable<AuthToken> {
    const token = this.tokenStorage.get();
    return observableOf(token);
  }

  /**
   * Removes the token and published token value
   *
   * @returns {Observable<any>}
   */
  clear(): Observable<null> {
    this.tokenStorage.clear();
    this.publishStoredToken();
    return observableOf(null);
  }

  protected publishStoredToken() {
    this.token$.next(this.tokenStorage.get());
  }
}
