import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, OperatorFunction } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IBapiResult } from '@core/hydra/bapi/constants';
import { CreateBatch } from '@core/hydra/bapi/create.batch';
import { WEBAPI_HOST } from '@core/constants';
import { MoveBatch } from '@core/hydra/bapi/move.batch';
import { CopyBatch } from '@core/hydra/bapi/copy.batch';
import { UpdateBatch } from '@core/hydra/bapi/update.batch';
import { LogonInputBatch } from '@core/hydra/bapi/logon.inputBatch';
import { LogonOperation } from '@core/hydra/bapi/logon.operation';
import { LogoffInputBatch } from '@core/hydra/bapi/logoff.inputBatch';
import { GenerateBatchName } from '@core/hydra/bapi/generate.batchName';
import { ChangeOutputBatch } from '@core/hydra/bapi/change.outputBatch';
import { FetchService } from '@core/hydra/fetch.service';
import { InterruptOperation } from '@core/hydra/bapi/interrupt.operation';
import { LogoffOperation } from '@core/hydra/bapi/logoff.operation';
import { GenerateBatchConnection } from '@core/hydra/bapi/generate.batchConnection';
import { PartialConfirmOperation } from '@core/hydra/bapi/partialConfirm.operation';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BatchInfo } from '@core/interface/common.interface';


@Injectable()
export class BapiService {
  url = 'bapi';

  constructor(protected http: HttpClient, private _fetchService: FetchService, private _newFetchService: NewFetchService) {
  }

  createBatch(batchName: string, materialNumber: string, batchQty: number,
    materialBuffer: string, badge: string): Observable<IBapiResult> {
    return new CreateBatch(batchName, materialNumber, batchQty, materialBuffer, badge).execute(this.http);
  }

  mergeBatch(box: string, toBeMerged: string[], badgeName: string) {
    // const operations: OperatorFunction<any, any>[] = [];
    // const obs$: Observable<any> = of('start');

    // let mergedBatchId: string;
    // let toBeMergedBatchId: string;
    // let totalQty = 0;

    // // Update each Child Batch
    // toBeMerged.forEach(batch => {
    //   operations.push(switchMap(() => {
    //     return this._fetchService.getBatchInformation(batch);
    //   }));
    //   operations.push(switchMap(ret => {
    //     totalQty += ret[0].REMAINQUANTITY;
    //     // Update Batch
    //     const update = new UpdateBatch(ret[0].ID, badgeName, null, 0, null, 'A');
    //     return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: update.dialogString() });
    //   }));
    // });

    // // Create Merged Batch
    // operations.push(switchMap(() => {
    //   return this._fetchService.getBatchInformation(toBeMerged[0]);
    // }));
    // operations.push(switchMap(res => {
    //   const gen = new GenerateBatchName('P');
    //   toBeMergedBatchId = res[0].ID;
    //   return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: gen.dialogString() });
    // }));
    // operations.push(switchMap((res: any) => {
    //   const array: Array<string> = res.content.split('|');
    //   mergedBatchId = array.find((item: string) => item.search(`NR=`) > -1)
    //     .replace('NR=', '').trimRight();
    //   const copy = new CopyBatch(toBeMergedBatchId, mergedBatchId, box, totalQty, badgeName, 'F');
    //   return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: copy.dialogString() });
    // }));

    // // Insert Batch Connectoin
    // toBeMerged.forEach(batch => {
    //   operations.push(switchMap(() => {
    //     return this._fetchService.getBatchInformation(batch);
    //   }));
    //   operations.push(switchMap(ret => {
    //     // Insert Batch Connectoin
    //     const connection = new GenerateBatchConnection(batch, mergedBatchId,
    //       ret[0].MATERIALNUMBER, ret[0].MATERIALNUMBER,
    //       ret[0].MATERIALTYPE, ret[0].MATERIALTYPE);
    //     return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: connection.dialogString() });
    //   }));
    // });

    // return obs$.pipe<any>(...operations);
  }

  splitBatch(batchInfo: BatchInfo, numberOfChildren: number, childQty: number, badge: string): Observable<IBapiResult> {
    return Array.from(Array(numberOfChildren + 1)).reduce((next$, currentValue, currentIndex) => {
      if (currentIndex === numberOfChildren) {
        return next$.pipe(
          switchMap(() => {
            return new UpdateBatch(batchInfo.batchName, badge, batchInfo.qty).execute(this.http);
          }));
      } else {
        return next$.pipe(
          switchMap(_ => {
            return new GenerateBatchName('W').execute(this.http);
          }),
          switchMap((res: IBapiResult) => {
            const array: Array<string> = res.content.split('|');
            const newBatchName = array.find((item: string) => item.search(`NR=`) > -1)
              .replace('NR=', '').trimRight();
            return new CopyBatch(batchInfo.batchName, newBatchName, childQty, badge).execute(this.http).pipe(
              map(_ => newBatchName)
            );
          }),
          switchMap((newBatchName: string) => {
            batchInfo.qty -= childQty;
            return new GenerateBatchConnection(batchInfo.batchName, newBatchName,
              batchInfo.material, batchInfo.material,
              batchInfo.materialType, batchInfo.materialType).execute(this.http);
          }));
      }
    }, of('start'));
  }

  updateBatch(batchName: string, badge: string, newQty: number): Observable<IBapiResult> {
    return new UpdateBatch(batchName, badge, newQty).execute(this.http);
  }

  moveBatch(id: string, destination: string, badge: string): Observable<IBapiResult> {
    return new MoveBatch(id, destination, badge).execute(this.http);
  }

  logonBatch(operation: string, machineName: string, badgeName: string,
    batchId: string, material: string, pos: number) {
    const data = new LogonInputBatch(operation, machineName, badgeName, batchId, material, pos);

    return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() })
      .pipe(
        map((res: any) => {
          return this.getResult(res);
        })
      );
  }

  logoffBatch(operation: string, machineName: string, badgeName: string,
    batchId: string, pos: number) {
    const data = new LogoffInputBatch(operation, machineName, badgeName, batchId, pos);

    return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() })
      .pipe(
        map((res: any) => {
          return this.getResult(res);
        })
      );
  }

  interruptOperation(operation: string, machineName: string, yieldQty: number,
    scrapQty: number, scrapReason: string, badgeName: string) {
    const data = new InterruptOperation(operation, machineName, yieldQty, scrapQty, scrapReason, badgeName);

    return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() })
      .pipe(
        map((res: any) => {
          return this.getResult(res);
        })
      );
  }

  partialConfirmOperation(operation: string, machineName: string, yieldQty: number,
    scrapQty: number, scrapReason: string, badgeName: string) {
    const data = new PartialConfirmOperation(operation, machineName, yieldQty, scrapQty, scrapReason, badgeName);

    return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() })
      .pipe(
        map((res: any) => {
          return this.getResult(res);
        })
      );
  }

  logoffOperation(operation: string, machineName: string, badgeName: string) {
    const data = new LogoffOperation(operation, machineName, badgeName);

    return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() })
      .pipe(
        map((res: any) => {
          return this.getResult(res);
        })
      );
  }

  logonOperation(operation: string, machineName: string, badgeName: string) {
    const gen = new GenerateBatchName('P');

    let newBatchId;
    // Get new Batch as Output Batch
    return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: gen.dialogString() }).pipe(
      switchMap((res: any) => {
        const array: Array<string> = res.content.split('|');
        newBatchId = array.find((item: string) => item.search(`NR=`) > -1)
          .replace('NR=', '').trimRight();
        const data = new LogonOperation(operation, machineName, badgeName, newBatchId);
        return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() });
      }),
      switchMap(() => {
        return this._fetchService.getOperation(operation);
      }),
      switchMap((ret) => {
        const materialDescription = ret.MATERIALDESCRIPTION;
        const data = new UpdateBatch(newBatchId, badgeName, null, null, materialDescription);
        return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() });
      }),
      map((res: any) => {
        return this.getResult(res);
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
      // switchMap(() => {
      // const data = new UpdateBatch(currentBatchId, badgeName, batchName, null);
      // return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() });
      // }),
      map((res: any) => {
        return this.getResult(res);
      })
    );
  }

  generateOutputFGBatch(operation: string, machineName: string, currentBatchId: string, batchName: string,
    badgeName: string) {
    const gen = new GenerateBatchName('P');

    // Get new Batch as Output Batch
    return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: gen.dialogString() }).pipe(
      switchMap((res: any) => {
        const array: Array<string> = res.content.split('|');
        const newBatch = array.find((item: string) => item.search(`NR=`) > -1)
          .replace('NR=', '').trimRight();
        const data = new ChangeOutputBatch(operation, machineName, badgeName, newBatch, 1);
        return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() });
      }),
      // switchMap(() => {
      //   const data = new UpdateBatch(currentBatchId, badgeName, batchName, null);
      //   return this.http.post(`${WEBAPI_HOST}/${this.url}`, { dialog: data.dialogString() });
      // }),
      map((res: any) => {
        return this.getResult(res);
      })
    );
  }

  private getResult(res: any) {
    return {
      isSuccess: res.isSuccess,
      error: res.error,
      description: res.description,
      content: res.content
    };
  }
}
