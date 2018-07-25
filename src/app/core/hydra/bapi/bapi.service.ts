import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import { IBapiResult } from '@core/hydra/bapi/constants';
import { LogonUser } from '@core/hydra/bapi/logon.user';
import { CreateBatch } from '@core/hydra/bapi/create.batch';
import { WEBAPI_HOST } from '@core/constants';
import { MoveBatch } from '@core/hydra/bapi/move.batch';
import { CopyBatch } from '@core/hydra/bapi/copy.batch';
import { UpdateBatch } from '@core/hydra/bapi/update.batch';

@Injectable()
export class BapiService {
    url = 'bapi';

    constructor(protected http: HttpClient) {
    }

    createBatch(batchName: string, materialNumber: string, batchQty: number,
                    materialBuffer: string, badge: string): Observable<IBapiResult>  {
        const data = new CreateBatch(batchName, materialNumber, batchQty, materialBuffer, badge);
        console.log(`Dialog String: ${data.dialogString()}`);
        return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() })
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

    splitBatch(id: string, splitBatch: string, remainQty: number,
        splitQty: number, badge: string): Observable<IBapiResult> {
        const copy = new CopyBatch(id, splitBatch, splitQty, badge);
        const update = new UpdateBatch(id, remainQty, badge);
        console.log(`Dialog String: ${copy.dialogString()}`);
        console.log(`Dialog String: ${update.dialogString()}`);
        return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: copy.dialogString() })
        .pipe(
            concatMap(() => {
                return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: update.dialogString() });
            }),
            map((res: any) => {
                return {
                    isSuccess: res.isSuccess,
                    error: res.error,
                    description: res.description
                };
            })
        );
    }

    moveBatch(id: string, destination: string, badge: string): Observable<IBapiResult> {
        const data = new MoveBatch(id, destination, badge);
        console.log(`Dialog String: ${data.dialogString()}`);
        return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() })
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
