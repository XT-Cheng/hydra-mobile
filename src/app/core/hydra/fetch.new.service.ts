import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, concatMap, combineLatest } from 'rxjs/operators';
import { WEBAPI_HOST } from '@core/constants';
import { MachineInfo, ReasonInfo, OperatorInfo, BatchInfo, MaterialBufferInfo, ComponentInfo } from '@core/interface/common.interface';

@Injectable()
export class NewFetchService {
  url = 'fetch';

  constructor(protected http: HttpClient) { }

  getComponentOfOperation(operation: string, machine: string): Observable<ComponentInfo[]> {
    const result: ComponentInfo[] = [];

    const compSql =
      `SELECT AUFTRAG_NR AS OPERATION, ARTIKEL AS MATERIAL, SOLL_MENGE AS USAGE, SOLL_EINH AS UNIT, POS FROM MLST_HY ` +
      ` WHERE AUFTRAG_NR ='${operation}' ORDER BY POS`;

    const loadCompSql =
      `SELECT SUBKEY1 AS MACHINE, SUBKEY2 AS OPERATION, SUBKEY3 AS BATCHID, ` +
      `LOS_BESTAND.LOSNR AS BATCH, SUBKEY5 AS POS, MENGE AS QTY, ` +
      `RESTMENGE AS REMAINQTY, LOS_BESTAND.ARTIKEL AS MATERIAL FROM HYBUCH, LOS_BESTAND ` +
      `WHERE KEY_TYPE = 'C' AND TYP = 'E' AND SUBKEY1 = '${machine}' AND SUBKEY3 = LOSNR`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${compSql}`).pipe(
      combineLatest(
        this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${loadCompSql}`),
        (comp, loaded) => {
          if (comp !== null) {
            (<Array<any>>comp).forEach(c => {
              result.push({
                operatoin: c.OPERATION,
                position: c.POS,
                usage: c.USAGE,
                unit: c.UNIT,
                material: c.MATERIAL,
                inputBatch: '',
                inputBatchQty: 0
              });
            });
          }

          if (loaded !== null) {
            (<Array<any>>loaded).forEach(c => {
              const find = result.find(item => item.material === c.MATERIAL);
              if (find) {
                find.inputBatch = c.BATCH;
                find.inputBatchQty = c.REMAINQTY;
              }
            });
          }

          return result.sort((a, b) => {
            return (a.inputBatch > b.inputBatch) ? 1 : -1;
          });
        }
      )
    );
  }

  getMachineWithOperation(machineName: string): Observable<MachineInfo> {
    const machineInfo: MachineInfo = new MachineInfo();

    const machineSql =
      `SELECT MACHINE.MASCH_NR AS MACHINE, HYBUCH.SUBKEY2 AS OPERATION FROM MASCHINEN MACHINE, HYBUCH ` +
      `WHERE MACHINE.MASCH_NR = '${machineName}' ` +
      `AND HYBUCH.SUBKEY1(%2B) = MACHINE.MASCH_NR AND HYBUCH.KEY_TYPE(%2B) = 'A'`;

    const opSql =
      `SELECT OP.AUFTRAG_NR AS NEXTOPERATION, (OP.ERRANF_DAT %2B OP.ERRANF_ZEIT / 3600 / 24) AS STARTDATE ` +
      ` FROM AUFTRAGS_BESTAND OP, AUFTRAG_STATUS STATUS ` +
      ` WHERE OP.MASCH_NR = '${machineName}' AND OP.AUFTRAG_NR = STATUS.AUFTRAG_NR ` +
      ` AND STATUS.A_STATUS <> 'L'  ORDER BY  ERRANF_DAT, ERRANF_ZEIT`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${machineSql}`).pipe(
      concatMap((res: any) => {
        if (res.length !== 0) {
          machineInfo.machine = res[0].MACHINE;
          machineInfo.currentOperation = res[0].OPERATION ? res[0].OPERATION : '';
          machineInfo.currentMotherOperation = `2002LPZ000010020`;
        } else {
          return throwError(`Machine ${machineName} not exist！`);
        }
        return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${opSql}`);
      }),
      map((res: any) => {
        if (res !== null || res.length !== 0) {
          machineInfo.nextOperation = res[0].NEXTOPERATION ? res[0].NEXTOPERATION : '';
        }

        machineInfo.nextMotherOperation = `2002LPZ000020020`;
        return machineInfo;
      })
    );
  }

  getReasonCode(reason: string): Observable<ReasonInfo> {
    const reasonInfo: ReasonInfo = new ReasonInfo();

    const reasonSql =
      `SELECT GRUNDTEXT_NR AS REASON, GRUNDTEXT AS DESCRIPTION FROM ADE_GRUND_TEXTE ` +
      `WHERE GRUNDTEXT_NR = ${reason} `;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${reasonSql}`).pipe(
      concatMap((res: any) => {
        if (res.length !== 0) {
          reasonInfo.code = reason;
          reasonInfo.description = res[0].DESCRIPTION;
          return of(reasonInfo);
        } else {
          return throwError(`Reason ${reason} not exist！`);
        }
      }));
  }

  getBatchMaterial(search: string): Observable<string[]> {
    const materialSql =
      `SELECT DISTINCT(ARTIKEL) AS MATERIAL FROM LOS_BESTAND WHERE ARTIKEL LIKE '${search + '%25'}' ORDER BY ARTIKEL`;
    // `SELECT DISTINCT(ARTIKEL) AS MATERIAL FROM LOS_BESTAND WHERE ARTIKEL LIKE '${search}' ORDER BY ARTIKEL`;

    const ret = [];

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${materialSql}`).pipe(
      concatMap((res: any) => {
        return of(res.map(row => row.MATERIAL));
      }));
  }

  getOperatorByBadge(badge: string): Observable<OperatorInfo> {
    const operatorInfo: OperatorInfo = new OperatorInfo();

    const operatorSql =
      `SELECT PERSON_NAME AS FIRSTNAME, PERSON_VORNAME AS LASTNAME ` +
      ` FROM PERSONALSTAMM WHERE KARTEN_NUMMER = '${badge}'`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${operatorSql}`).pipe(
      concatMap((res: any) => {
        if (res.length !== 0) {
          operatorInfo.badge = badge;
          operatorInfo.firstName = res[0].FIRSTNAME;
          operatorInfo.lastName = res[0].LASTNAME;
          return of(operatorInfo);
        } else {
          return throwError(`Badge ${badge} not exist！`);
        }
      })
    );
  }

  getBatchInfoFrom2DBarCode(barCodeOf2D: string): Observable<BatchInfo> {
    const batchInfo: BatchInfo = new BatchInfo();

    const ret = barCodeOf2D.split(';');

    if (ret.length !== 3) {
      return throwError('Batch Label format in-correct');
    }

    batchInfo.batchName = ret[0];
    batchInfo.barCode = barCodeOf2D;
    batchInfo.material = ret[1];
    batchInfo.qty = batchInfo.startQty = parseInt(ret[2], 10);
    return of(batchInfo);
  }

  getMaterialBuffer(buffer: string): Observable<MaterialBufferInfo> {
    const bufferInfo: MaterialBufferInfo = new MaterialBufferInfo();

    const bufferSql =
      `SELECT MAT_PUF AS BUFFER, BEZ AS DESCRIPTION ` +
      ` FROM MAT_PUFFER WHERE MAT_PUF = '${buffer}'`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${bufferSql}`).pipe(
      concatMap((res: any) => {
        if (res.length !== 0) {
          bufferInfo.name = res[0].BUFFER;
          bufferInfo.description = res[0].DESCRIPTION;
          return of(bufferInfo);
        } else {
          return throwError(`Buffer ${buffer} not exist！`);
        }
      })
    );
  }

  getBatchInformation(batchName: string): Observable<BatchInfo> {
    const batchInfo: BatchInfo = new BatchInfo();

    const sql =
      `SELECT LOS_BESTAND.LOSNR AS BATCHNAME, LOS_BESTAND.LOSNR AS ID, ` +
      `LOS_BESTAND.HZ_TYP AS MATERIALTYPE, ` +
      `LOS_BESTAND.ARTIKEL AS MATERIALNUMBER, LOS_BESTAND.ARTIKEL_BEZ AS MATERIALDESC, LOS_BESTAND.MENGE AS QUANTITY, ` +
      `LOS_BESTAND.RESTMENGE AS REMAINQUANTITY, LOS_BESTAND.EINHEIT AS UNIT, ` +
      `LOS_BESTAND.MAT_PUF AS LOCATION, MAT_PUFFER.BEZ AS LOCDESC, ` +
      `STATUS AS STATUS, KLASSE AS CLASS FROM MAT_PUFFER, LOS_BESTAND ` +
      `WHERE LOS_BESTAND.LOSNR = '${batchName}' AND MAT_PUFFER.MAT_PUF = LOS_BESTAND.MAT_PUF`;
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      concatMap((res: any) => {
        if (res.length !== 0) {
          batchInfo.batchName = res[0].BATCHNAME;
          batchInfo.material = res[0].MATERIALNUMBER;
          batchInfo.qty = res[0].REMAINQUANTITY;
          batchInfo.startQty = res[0].QUANTITY;
          batchInfo.currentLocation = res[0].LOCATION;

          return of(batchInfo);
        } else {
          return throwError(`Batch ${batchName} not exist！`);
        }
      })
    );
  }
}
