import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    NavigationEnd,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '@core/auth/providers/authService';
import { AUTH_URL } from '@core/constants';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Injectable()
export class RoutingGuard implements CanActivate, CanActivateChild {
    constructor(private _authService: AuthService, private _router: Router, @Inject(DOCUMENT) private _document) {
        this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd)
        ).subscribe((event) => {
            this.hideSpinner();
        });
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const url: string = state.url;

        return this.checkLogin(url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(route, state);
    }

    checkLogin(url: string): Observable<boolean> {
        // return of(true);
        return this._authService.onTokenChange().pipe(
            take(1),
            map((authToken) => {
                if (authToken.isValid()) {
                    return true;
                } else {
                    this._router.navigateByUrl(AUTH_URL);
                    return false;
                }
            })
        );
    }

    private hideSpinner(): void {
        const body = this._document.querySelector('body');
        const preloader = this._document.querySelector('.preloader');
        // preloader value null when running --hmr
        if (!preloader) { return; }

        preloader.className = 'preloader-hidden';
    }
}
