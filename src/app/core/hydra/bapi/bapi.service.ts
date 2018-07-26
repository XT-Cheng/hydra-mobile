import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, concatMap, switchMap } from 'rxjs/operators';
import { IBapiResult } from '@core/hydra/bapi/constants';
import { LogonUser } from '@core/hydra/bapi/logon.user';
import { CreateBatch } from '@core/hydra/bapi/create.batch';
import { WEBAPI_HOST } from '@core/constants';
import { MoveBatch } from '@core/hydra/bapi/move.batch';
import { CopyBatch } from '@core/hydra/bapi/copy.batch';
import { UpdateBatch } from '@core/hydra/bapi/update.batch';
import { LogonInputBatch } from '@core/hydra/bapi/logon.inputBatch';
import { LogonOperationComponent } from '../../../routes/features/operation/logon-operation.component';
import { LogonOperation } from '@core/hydra/bapi/logon.operation';
import { LogoffInputBatch } from '@core/hydra/bapi/logoff.inputBatch';
import { GenerateBatchName } from '@core/hydra/bapi/generate.batchName';
import { ChangeOutputBatch } from '@core/hydra/bapi/change.outputBatch';

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
        const update = new UpdateBatch(id, badge, null, remainQty);
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

    logonBatch(operation: string, machineName: string, badgeName: string,
        batchId: string, material: string) {
        const data = new LogonInputBatch(operation, machineName, badgeName, batchId, material);

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

    logoffBatch(operation: string, machineName: string, badgeName: string,
        batchId: string, pos: number) {
        const data = new LogoffInputBatch(operation, machineName, badgeName, batchId, pos);

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

    logonOperation(operation: string, machineName: string, badgeName: string) {
        const gen = new GenerateBatchName('P');

        // Get new Batch as Output Batch
        return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: gen.dialogString() }).pipe(
            switchMap((res: any) => {
                const array: Array<string> = res.content.split('|');
                const newBatch = array.find((item: string) => item.search(`NR=`) > -1)
                    .replace('NR=', '').trimRight();
                const data = new LogonOperation(operation, machineName, badgeName, newBatch);
                return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() });
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

    generateOutputSemiBatch(operation: string, machineName: string, currentBatchId: string, batchName: string,
                                badgeName: string, qty: number) {
        const gen = new GenerateBatchName('P');

        // Get new Batch as Output Batch
        return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: gen.dialogString() }).pipe(
            switchMap((res: any) => {
                const array: Array<string> = res.content.split('|');
                const newBatch = array.find((item: string) => item.search(`NR=`) > -1)
                    .replace('NR=', '').trimRight();
                const data = new ChangeOutputBatch(operation, machineName, badgeName, newBatch, qty);
                return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() });
            }),
            switchMap((res: any) => {
                const data = new UpdateBatch(currentBatchId, badgeName, batchName, null);
                return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() });
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
}
