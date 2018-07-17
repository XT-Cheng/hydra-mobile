import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { IError } from '@core/store/error/error.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {

    constructor(private injector: Injector) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((errResponse: any) => {
                let err: IError;
                if (errResponse.error instanceof ErrorEvent) {
                    err = {
                        actionId: '',
                        description: errResponse.error.message,
                        stack: '',
                        network: true
                    };
                } else if (errResponse.error instanceof ProgressEvent) {
                    err = {
                        actionId: '',
                        description: '',
                        stack: '',
                        network: true
                    };
                } else {
                    err = {
                        actionId: '',
                        description: errResponse.error,
                        stack: '',
                        network: false
                    };
                }
                errResponse.actionError = err;
                return throwError(errResponse);
            })
        );
    }
}
