import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, concatMap, combineLatest, delay } from 'rxjs/operators';
import { WEBAPI_HOST } from '@core/constants';

@Injectable()
export class FetchService {
  url = 'fetch';

  constructor(protected http: HttpClient) { }

  getLicenseTag(licenseTag: string): Observable<any> {
    const sql =
      `SELECT CT_SLT_CARTON_LICENSE_TAG AS LICENSETAG, ` +
      `CT_SLT_MATERIAL_NUMBER AS PARTNO, ` +
      `CT_SLT_QTY_IN_UNIT_OF_ENTRY AS QUANTITY FROM U_TE_MCTV_SAP_LICENSE_TAG ` +
      `WHERE CT_SLT_CARTON_LICENSE_TAG = '${licenseTag}'`;
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      delay(3000),
      map((res: any) => {
        return res;
      })
    );
  }

  getBatchInformation(batchName: string): Observable<any> {
    const sql =
      `SELECT LOS_BESTAND.ALTERN_LOSNR1 AS BATCHNAME, LOS_BESTAND.LOSNR AS ID, ` +
      `LOS_BESTAND.HZ_TYP AS MATERIALTYPE, ` +
      `LOS_BESTAND.ARTIKEL AS MATERIALNUMBER, LOS_BESTAND.ARTIKEL_BEZ AS MATERIALDESC, LOS_BESTAND.MENGE AS QUANTITY, ` +
      `LOS_BESTAND.RESTMENGE AS REMAINQUANTITY, LOS_BESTAND.EINHEIT AS UNIT, ` +
      `LOS_BESTAND.MAT_PUF AS LOCATION, MAT_PUFFER.BEZ AS LOCDESC, ` +
      `STATUS AS STATUS, KLASSE AS CLASS FROM MAT_PUFFER, LOS_BESTAND ` +
      `WHERE LOS_BESTAND.ALTERN_LOSNR1 = '${batchName}' AND MAT_PUFFER.MAT_PUF = LOS_BESTAND.MAT_PUF`;
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getLicenseTagFrom2DBarCode(barCodeOf2D: string): Observable<any> {
    const ret = barCodeOf2D.split(';');

    if (ret.length !== 3) { return throwError('LicenseTag format in-correct'); }

    return of(
      {
        BATCHNAME: ret[0],
        PARTNO: ret[1],
        QUANTITY: ret[2],
      }
    );
  }

  getActiveOutputBatch(operation: string, machine: string): Observable<any> {
    const sql =
      `SELECT SUBKEY3 AS ACTIVEBATCHID FROM HYBUCH ` +
      `WHERE KEY_TYPE = 'C' AND SUBKEY1='${machine}' AND SUBKEY2 = '${operation}' AND TYP = 'A' ` +
      `AND STATUS1 = 'L'`;
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getMachineWithOperation(machine: string): Observable<any> {
    const result: any = {};

    const machineSql =
      `SELECT MACHINE.MASCH_NR AS MACHINE, HYBUCH.SUBKEY2 AS OPERATION FROM MASCHINEN MACHINE, HYBUCH ` +
      `WHERE MACHINE.MASCH_NR = '${machine}' ` +
      `AND HYBUCH.SUBKEY1(%2B) = MACHINE.MASCH_NR AND HYBUCH.KEY_TYPE(%2B) = 'A'`;

    const opSql =
      `SELECT OP.AUFTRAG_NR AS NEXTOPERATION, (OP.ERRANF_DAT %2B OP.ERRANF_ZEIT / 3600 / 24) AS STARTDATE ` +
      ` FROM AUFTRAGS_BESTAND OP, AUFTRAG_STATUS STATUS ` +
      ` WHERE OP.MASCH_NR = '${machine}' AND OP.AUFTRAG_NR = STATUS.AUFTRAG_NR ` +
      ` AND STATUS.A_STATUS <> 'L'  ORDER BY  ERRANF_DAT, ERRANF_ZEIT`;

    console.log(opSql);
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${machineSql}`).pipe(
      concatMap((res: any) => {
        if (res === null || res.length === 0) {
          return of(null);
        }
        result.MACHINE = res[0].MACHINE;
        result.CURRENTOPERATION = res[0].OPERATION;

        return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${opSql}`);
      }),
      map((res: any) => {
        if (res === null || res.length === 0) {
          result.NEXTOPERATION = '';
        } else {
          result.NEXTOPERATION = res[0].NEXTOPERATION;
        }

        return result;
      })
    );
  }

  getComponentOfOperation(operation: string, machine: string): Observable<any> {
    const result = [];

    const compSql =
      `SELECT AUFTRAG_NR AS OPERATION, ARTIKEL AS MATERIAL, SOLL_MENGE AS USAGE, SOLL_EINH AS UNIT, POS FROM MLST_HY ` +
      ` WHERE AUFTRAG_NR ='${operation}' ORDER BY POS`;

    const loadCompSql =
      `SELECT SUBKEY1 AS MACHINE, SUBKEY2 AS OPERATION, SUBKEY3 AS BATCHID, ` +
      `LOS_BESTAND.ALTERN_LOSNR1 AS BATCH, SUBKEY5 AS POS, MENGE AS QTY, ` +
      `RESTMENGE AS REMAINQTY, LOS_BESTAND.ARTIKEL AS MATERIAL FROM HYBUCH, LOS_BESTAND ` +
      `WHERE KEY_TYPE = 'C' AND TYP = 'E' AND SUBKEY1 = '${machine}' AND SUBKEY3 = LOSNR`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${compSql}`).pipe(
      combineLatest(
        this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${loadCompSql}`),
        (comp, loaded) => {
          if (comp !== null) {
            (<Array<any>>comp).forEach(c => {
              result.push({
                OPERATION: c.OPERATION,
                POSITION: c.POS,
                USAGE: c.USAGE,
                UNIT: c.UNIT,
                MATERIAL: c.MATERIAL,
                INPUTBATCH: '',
                INPUTBATCHID: '',
                BATCHQTY: '',
                ORIGINQTY: ''
              });
            });
          }

          if (loaded !== null) {
            (<Array<any>>loaded).forEach(c => {
              const find = result.find(item => item.MATERIAL === c.MATERIAL);
              if (find) {
                find.INPUTBATCH = c.BATCH;
                find.INPUTBATCHID = c.BATCHID;
                find.BATCHQTY = c.REMAINQTY;
                find.ORIGINQTY = c.QTY;
              }
            });
          }

          return result;
        }
      )
    );
  }

  getOperation(operation: string) {
    const result: any = {};

    const operationSql =
      `SELECT AUFTRAG_NR AS OPERATION, AG_BEZ AS MATERIALDESCRIPTION ` +
      ` FROM AUFTRAGS_BESTAND WHERE AUFTRAG_NR = '${operation}'`;

    console.log(operationSql);
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${operationSql}`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getMaterialBuffer(buffer: string) {
    const result: any = {};

    const bufferSql =
      `SELECT MAT_PUF AS BUFFER, BEZ AS DESCRIPTION ` +
      ` FROM MAT_PUFFER WHERE MAT_PUF = '${buffer}'`;

    console.log(bufferSql);
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${bufferSql}`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getOperator(badge: string) {
    const result: any = {};

    const sql =
      `SELECT PERSON_NAME || PERSON_VORNAME AS NAME ` +
      ` FROM PERSONALSTAMM WHERE KARTEN_NUMMER = '${badge}'`;

    console.log(sql);
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
}
