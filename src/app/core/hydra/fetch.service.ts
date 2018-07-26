import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, concatMap, combineLatest } from 'rxjs/operators';
import { WEBAPI_HOST } from '@core/constants';

@Injectable()
export class FetchService {
    url = 'fetch';

    constructor(protected http: HttpClient) {
    }

    getLicenseTag(licenseTag: string): Observable<any> {
        const sql = `SELECT CT_SLT_CARTON_LICENSE_TAG AS LICENSETAG, ` +
            `CT_SLT_MATERIAL_NUMBER AS PARTNO, ` +
            `CT_SLT_QTY_IN_UNIT_OF_ENTRY AS QUANTITY FROM U_TE_MCTV_SAP_LICENSE_TAG ` +
            `WHERE CT_SLT_CARTON_LICENSE_TAG = '${licenseTag}'`;
        return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`)
            .pipe(
                map((res: any) => {
                    return res;
                })
            );
    }

    getBatchInformation(batchName: string): Observable<any> {
        const sql = `SELECT ALTERN_LOSNR1 AS BATCHNAME, LOSNR AS ID, ARTIKEL AS MATERIALNUMBER, MENGE AS QUANTITY, ` +
            `RESTMENGE AS REMAINQUANTITY, EINHEIT AS UNIT, MAT_PUF AS LOCATION, ` +
            `STATUS AS STATUS, KLASSE AS CLASS FROM LOS_BESTAND WHERE ALTERN_LOSNR1 = '${batchName}'`;
        return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`)
            .pipe(
                map((res: any) => {
                    return res;
                })
            );
    }

    getActiveOutputBatch(operation: string, machine: string): Observable<any> {
        const sql = `SELECT SUBKEY3 AS ACTIVEBATCHID FROM HYBUCH ` +
                    `WHERE KEY_TYPE = 'C' AND SUBKEY1='${machine}' AND SUBKEY2 = '${operation}' AND TYP = 'A' ` +
                    `AND STATUS1 = 'L'`;
        return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`)
            .pipe(
                map((res: any) => {
                    return res;
                })
            );
    }

    getMachineWithOperation(machine: string): Observable<any> {
        const result: any = {};

        const machineSql = `SELECT MACHINE.MASCH_NR AS MACHINE, HYBUCH.SUBKEY2 AS OPERATION FROM MASCHINEN MACHINE, HYBUCH ` +
            `WHERE MACHINE.MASCH_NR = '${machine}' ` +
            `AND HYBUCH.SUBKEY1(%2B) = MACHINE.MASCH_NR AND HYBUCH.KEY_TYPE(%2B) = 'A'`;

        const opSql = `SELECT OP.AUFTRAG_NR AS NEXTOPERATION, (OP.ERRANF_DAT %2B OP.ERRANF_ZEIT / 3600 / 24) AS STARTDATE ` +
                    ` FROM AUFTRAGS_BESTAND OP, AUFTRAG_STATUS STATUS ` +
                    ` WHERE OP.MASCH_NR = '${machine}' AND OP.AUFTRAG_NR = STATUS.AUFTRAG_NR ` +
                    ` AND STATUS.A_STATUS <> 'L'  ORDER BY  ERRANF_DAT, ERRANF_ZEIT`;

        console.log(opSql);
        return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${machineSql}`)
            .pipe(
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

    getComponentOfOperation(operation: string): Observable<any> {
        const result = [];

        const compSql = `SELECT AUFTRAG_NR AS OPERATION, ARTIKEL AS MATERIAL, SOLL_MENGE AS USAGE, SOLL_EINH AS UNIT, POS from MLST_HY ` +
            ` where AUFTRAG_NR ='${operation}' ORDER BY POS`;

        const loadCompSql = `SELECT SUBKEY1 AS MACHINE, SUBKEY2 AS OPERATION, SUBKEY3 AS BATCH, SUBKEY5 AS POS, MENGE AS QTY, ` +
            `RESTMENGE AS REMAINQTY FROM HYBUCH, LOS_BESTAND ` +
            `WHERE KEY_TYPE = 'C' AND TYP = 'E' AND SUBKEY2 = '${operation}' AND SUBKEY3 = LOSNR`;

        return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${compSql}`)
            .pipe(
                combineLatest(this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${loadCompSql}`), (comp, loaded) => {
                    if (comp !== null) {
                        (<Array<any>>comp).forEach(c => {
                            result.push({
                                OPERATION: c.OPERATION,
                                POSITION: c.POS,
                                USAGE: c.USAGE,
                                UNIT: c.UNIT,
                                MATERIAL: c.MATERIAL,
                                INPUTBATCH: '',
                                BATCHQTY: '',
                                ORIGINQTY: ''
                            });
                        });
                    }

                    if (loaded !== null) {
                        (<Array<any>>loaded).forEach(c => {
                            const find = result.find(item => item.OPERATION === c.OPERATION && item.POSITION === c.POS);
                            if (find) {
                                find.INPUTBATCH = c.BATCH;
                                find.BATCHQTY = c.REMAINQTY;
                                find.ORIGINQTY = c.QTY;
                            }
                        });
                    }

                    return result;
                })
            );
    }
}
