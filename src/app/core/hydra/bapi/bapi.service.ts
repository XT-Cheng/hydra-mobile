import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBapiResult } from '@core/hydra/bapi/constants';
import { LogonUser } from '@core/hydra/bapi/logon.user';

@Injectable()
export class BapiService {
    constructor(protected http: HttpClient) {
    }

    logonUser(machine: string, badge: string): Observable<IBapiResult> {
        const data = new LogonUser();

        data.machineNbr = machine;
        data.badgeNbr = badge;

        return this.http.post('', { dialog: data.dialogString() })
            .pipe(
                map((res: any) => {
                    return {
                        isSuccess: res.isSuccess,
                        error: res.error,
                        description: res.description
                    };
                })
            );
    }
}
