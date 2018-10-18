import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, concatMap, combineLatest } from 'rxjs/operators';
import { WEBAPI_HOST } from '@core/constants';
import {
  MachineInfo, ReasonInfo, OperatorInfo, BatchInfo, MaterialBufferInfo, ComponentInfo,
  IMaterialMaster, MaterialMaster, OperationInfo, ToolInfo, ResourceInfo, MachineStatus
} from '@core/interface/common.interface';

@Injectable()
export class NewFetchService {
  url = 'fetch';

  constructor(protected http: HttpClient) { }

  getOperatorsLoggedOn(machine: string): Observable<OperatorInfo[]> {
    const sql = `SELECT PERSON_NAME AS FIRSTNAME, PERSON_VORNAME AS LASTNAME, KARTEN_NUMMER AS BADGE ` +
      `FROM HYBUCH,PERSONALSTAMM ` +
      `WHERE SUBKEY1 = '${machine}' AND KEY_TYPE = 'P' AND SUBKEY4 =  LPAD(PERSONALNUMMER, 8, '0')`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      map(res => {
        const result: OperatorInfo[] = [];
        (<Array<any>>res).forEach(c => {
          result.push(Object.assign(new OperatorInfo(),
            {
              firstName: c.FIRSTNAME,
              lastName: c.LASTNAME,
              badge: c.BADGE
            }));
        });
        return result;
      }));
  }

  getResourceInformation(tool: string, toolType: string = 'VOR'): Observable<ResourceInfo> {
    const result = new ResourceInfo();

    const sql =
      `SELECT RES.RES_ID AS TOOLID, RES.RES_NR AS TOOLNAME, RES_STATUS.STATUS AS STATUS, ` +
      `RES_STATUS_ASSIGN.STATUSTEXT AS STATUSDESCRIPTION, ` +
      `RES_REQUIRED.RES_NR_M AS REQUIREDRESOURCE FROM RES_BESTAND RES, ` +
      `RES_STATUS RES_STATUS, RES_STATUS_ZUORD RES_STATUS_ASSIGN,RES_BEDARFSZUORD RES_REQUIRED ` +
      `WHERE RES.RES_TYP = '${toolType}' AND RES.RES_NR(%2B) = '${tool}' AND RES.RES_ID = RES_STATUS.RES_ID ` +
      `AND RES_STATUS_ASSIGN.STATUS = RES_STATUS.STATUS ` +
      `AND RES_STATUS_ASSIGN.RES_TYP = RES.RES_TYP AND RES_REQUIRED.RES_NR_T = RES.RES_NR`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      map((res: any) => {
        if (res.length !== 0) {
          result.toolId = res[0].TOOLID;
          result.tool = res[0].TOOLNAME;
          result.status = res[0].STATUS;
          result.statusDescription = res[0].STATUSDESCRIPTION;
          result.belongsTo = res[0].REQUIREDRESOURCE ? res[0].REQUIREDRESOURCE : '';
          return result;
        } else {
          throw Error(`Tool ${tool} not exist！`);
        }
      })
    );
  }

  getToolOfOperation(operation: string, machine: string): Observable<ToolInfo[]> {
    const result: ToolInfo[] = [];

    const toolSql =
      `SELECT AUFTRAG_NR AS OPERATION, ARTIKEL AS REQUIREDTOOL, SOLL_MENGE AS USAGE FROM MLST_HY ` +
      ` WHERE KENNZ = 'V' AND AUFTRAG_NR ='${operation}'`;

    const loadToolSql =
      `SELECT SUBKEY1 AS MACHINE, SUBKEY2 AS OPERATION, SUBKEY6 AS RESOURCEID,RES_NR AS TOOLNAME, RES_NR_M AS REQUIREDRESOURCE ` +
      `FROM HYBUCH, RES_BEDARFSZUORD, RES_BESTAND ` +
      `WHERE KEY_TYPE = 'O' AND SUBKEY1 = '${machine}' AND RES_ID = SUBKEY6 AND RES_NR_T(%2B) = RES_NR`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${toolSql}`).pipe(
      combineLatest(
        this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${loadToolSql}`),
        (tool, loaded) => {
          if (tool !== null) {
            (<Array<any>>tool).forEach(c => {
              result.push(Object.assign(new ToolInfo(), {
                operation: c.OPERATION,
                usage: c.USAGE,
                requiredTool: c.REQUIREDTOOL,
                inputTool: ''
              }));
            });
          }

          if (loaded !== null) {
            (<Array<any>>loaded).forEach(c => {
              const find = result.find(item => item.requiredTool === c.REQUIREDRESOURCE);
              if (find) {
                find.inputTool = c.TOOLNAME;
              }
            });
          }

          return result;
        })
    );
  }

  getLoggedOnBatchOfMachine(machine: string): Observable<ComponentInfo[]> {
    const result: ComponentInfo[] = [];

    const loadCompSql =
      `SELECT SUBKEY1 AS MACHINE, SUBKEY2 AS OPERATION, SUBKEY3 AS BATCHID, ` +
      `LOS_BESTAND.LOSNR AS BATCH, SUBKEY5 AS POS, MENGE AS QTY, ` +
      `RESTMENGE AS REMAINQTY, LOS_BESTAND.ARTIKEL AS MATERIAL FROM HYBUCH, LOS_BESTAND ` +
      `WHERE KEY_TYPE = 'C' AND TYP = 'E' AND SUBKEY1 = '${machine}' AND SUBKEY3 = LOSNR`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${loadCompSql}`).pipe(
      map((loaded: any) => {
        loaded.forEach(c => {
          result.push(Object.assign(new ComponentInfo(), {
            inputBatch: c.BATCH,
            inputBatchQty: c.REMAINQTY,
            operatoin: c.OPERATION,
            position: c.POS,
            material: c.MATERIAL,
          }));
        });

        return result;
      }));
  }

  getLoggedOnToolOfMachine(machine: string): Observable<ToolInfo[]> {
    const result: ToolInfo[] = [];

    const loadToolSql =
      `SELECT SUBKEY1 AS MACHINE, SUBKEY2 AS OPERATION, SUBKEY6 AS RESOURCEID,RES_NR AS TOOLNAME, RES_NR_M AS REQUIREDRESOURCE ` +
      `FROM HYBUCH, RES_BEDARFSZUORD, RES_BESTAND ` +
      `WHERE KEY_TYPE = 'O' AND SUBKEY1 = '${machine}' AND RES_ID = SUBKEY6 AND RES_NR_T(%2B) = RES_NR`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${loadToolSql}`).pipe(
      map((loaded: any) => {
        loaded.forEach(c => {
          result.push(Object.assign(new ToolInfo(), {
            operation: c.OPERATION,
            requiredTool: c.REQUIREDRESOURCE,
            inputTool: c.TOOLNAME
          }));
        });

        return result;
      }));
  }


  getComponentOfOperation(operation: string, machine: string): Observable<ComponentInfo[]> {
    const result: ComponentInfo[] = [];

    const sql =
      `SELECT AUFTRAG_NR AS OPERATION, ARTIKEL AS MATERIAL, SOLL_MENGE AS USAGE, SOLL_EINH AS UNIT, POS FROM MLST_HY ` +
      ` WHERE KENNZ = 'M' AND AUFTRAG_NR ='${operation}' ORDER BY POS`;

    const loadCompSql =
      `SELECT SUBKEY1 AS MACHINE, SUBKEY2 AS OPERATION, SUBKEY3 AS BATCHID, ` +
      `LOS_BESTAND.LOSNR AS BATCH, SUBKEY5 AS POS, MENGE AS QTY, ` +
      `RESTMENGE AS REMAINQTY, LOS_BESTAND.ARTIKEL AS MATERIAL FROM HYBUCH, LOS_BESTAND ` +
      `WHERE KEY_TYPE = 'C' AND TYP = 'E' AND SUBKEY1 = '${machine}' AND SUBKEY3 = LOSNR`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      combineLatest(
        this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${loadCompSql}`),
        (comp, loaded) => {
          if (comp !== null) {
            (<Array<any>>comp).forEach(c => {
              result.push(Object.assign(new ComponentInfo(), {
                operatoin: c.OPERATION,
                position: c.POS,
                usage: c.USAGE,
                unit: c.UNIT,
                material: c.MATERIAL,
                inputBatch: '',
                inputBatchQty: 0
              }));
            });
          }

          if (loaded !== null) {
            (<Array<any>>loaded).forEach(c => {
              const find = result.find(item => item.material === c.MATERIAL && item.position === c.POS);
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

  getActiveOutputBatch(operation: string, machine: string): Observable<string> {
    const sql =
      `SELECT SUBKEY3 AS ACTIVEBATCHID FROM HYBUCH ` +
      `WHERE KEY_TYPE = 'C' AND SUBKEY1='${machine}' AND SUBKEY2 = '${operation}' AND TYP = 'A' ` +
      `AND STATUS1 = 'L'`;
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      map((res: any) => {
        if (res.length !== 0) {
          return res[0].ACTIVEBATCHID;
        } else {
          throw Error(`Machine ${machine} has no active output batch！`);
        }
      })
    );
  }

  getMaterialMaster(materialName: string): Observable<IMaterialMaster> {
    const materialMasterSql = `SELECT PART_NUMBER, PART_DESCRIPTION, CARTON_QUANTITY, PACKAGE_UNIT_QTY ` +
      `FROM U_TE_MMLP_PRODUCT_MASTER WHERE PART_NUMBER = '${materialName}'`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${materialMasterSql}`).pipe(
      map((res: any) => {
        if (res.length !== 0) {
          return {
            name: res[0].PART_NUMBER,
            description: res[0].PART_DESCRIPTION,
            cartonQty: res[0].CARTON_QUANTITY,
            palleteQty: res[0].PACKAGE_UNIT_QTY,
          };
        } else {
          throw Error(`Material ${materialName} not exist！`);
        }
      }));
  }

  getOperation(operation: string) {
    const operationSql =
      `SELECT ARTIKEL AS MATERIAL, ARTIKEL_BEZ AS DESCRIPTION, AUNR AS WORKORDER, AGNR AS OPERATION, SOLL_MENGE_BAS AS TARGETQTY ` +
      ` FROM AUFTRAGS_BESTAND WHERE A_TYP = 'AG' AND AUFTRAG_NR = '${operation}'`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${operationSql}`).pipe(
      map((res: any) => {
        if (res.length !== 0) {
          return Object.assign(new OperationInfo(), {
            workOrder: res[0].WORKORDER,
            operation: res[0].OPERATION,
            material: res[0].MATERIAL,
            targetQty: res[0].TARGETQTY,
          });
        } else {
          throw Error(`Operation ${operation} not exist！`);
        }
      })
    );
  }

  getMachineInformation(machineName: string): Observable<MachineInfo> {
    const machineInfo: MachineInfo = new MachineInfo();

    const machineSql =
      `SELECT MACHINE.MASCH_NR AS MACHINE, STATUS.M_STATUS AS STATUS, TEXT.STOER_TEXT AS TEXT ` +
      `FROM MASCHINEN MACHINE, MASCHINEN_STATUS STATUS, STOERTEXTE TEXT ` +
      `WHERE MACHINE.MASCH_NR = '${machineName}' ` +
      `AND STATUS.MASCH_NR = MACHINE.MASCH_NR AND TEXT.STOERTXT_NR = STATUS.M_STATUS`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${machineSql}`).pipe(
      map((res: any) => {
        if (res.length !== 0) {
          machineInfo.machine = machineName;
          machineInfo.status = res[0].STATUS;
          machineInfo.statusDescription = res[0].TEXT;
          return machineInfo;
        } else {
          throw Error(`Machine ${machineName} not exist！`);
        }
      }));
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

  getMachineStatus(status: number): Observable<MachineStatus> {
    const statusInfo: MachineStatus = new MachineStatus();

    const statusSql =
      `SELECT STOERTXT_NR AS STATUS, STOER_TEXT AS DESCRIPTION FROM STOERTEXTE ` +
      `WHERE STOERTXT_NR = ${status} `;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${statusSql}`).pipe(
      map((res: any) => {
        if (res.length !== 0) {
          statusInfo.status = status;
          statusInfo.description = res[0].DESCRIPTION;
          return statusInfo;
        } else {
          throw Error(`Machine Status ${status} not exist！`);
        }
      }));
  }

  searchBatchPart(search: string): Observable<string[]> {
    const materialSql =
      `SELECT DISTINCT(ARTIKEL) AS MATERIAL FROM LOS_BESTAND WHERE ARTIKEL LIKE '${'%25' + search + '%25'}' ORDER BY ARTIKEL`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${materialSql}`).pipe(
      concatMap((res: any) => {
        return of(res.map(row => row.MATERIAL));
      }));
  }

  searchBatchBuffer(search: string): Observable<string[]> {
    const bufferSql =
      `SELECT MAT_PUF AS BUFFERNAME FROM MAT_PUFFER WHERE MAT_PUF LIKE '${'%25' + search + '%25'}' ORDER BY MAT_PUF`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${bufferSql}`).pipe(
      concatMap((res: any) => {
        return of(res.map(row => row.BUFFERNAME));
      }));
  }

  getChildrenOfBuffer(bufferName: string): Observable<string[]> {
    const bufferSql =
      `SELECT MAT_PUF AS BUFFERNAME FROM MAT_PUFFER WHERE MAT_PUF <> ${bufferName}` +
      `START WITH MAT_PUF = ${bufferName} ` +
      `CONNECT BY PRIOR MAT_PUF = H_MAT_PUF ORDER SIBLINGS BY MAT_PUF`;

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${bufferSql}`).pipe(
      concatMap((res: any) => {
        return of(res.map(row => row.BUFFERNAME));
      }));
  }

  searchBatch(material: string, bufferName: string): Observable<BatchInfo[]> {
    const batchInfos: BatchInfo[] = [];

    let materialCondition, bufferCondition;

    if (material) {
      materialCondition = `LOS_BESTAND.ARTIKEL = '${material}'`;
    }

    if (bufferName) {
      bufferCondition = `LOS_BESTAND.MAT_PUF IN (SELECT MAT_PUF AS BUFFERNAME FROM MAT_PUFFER ` +
        `START WITH MAT_PUF = '${bufferName}' ` +
        `CONNECT BY PRIOR MAT_PUF = H_MAT_PUF)`;
    }

    let sql =
      `SELECT LOS_BESTAND.LOSNR AS BATCHNAME, LOS_BESTAND.LOSNR AS ID, ` +
      `LOS_BESTAND.HZ_TYP AS MATERIALTYPE, ` +
      `LOS_BESTAND.ARTIKEL AS MATERIALNUMBER, LOS_BESTAND.ARTIKEL_BEZ AS MATERIALDESC, LOS_BESTAND.MENGE AS QUANTITY, ` +
      `LOS_BESTAND.RESTMENGE AS REMAINQUANTITY, LOS_BESTAND.EINHEIT AS UNIT, ` +
      `LOS_BESTAND.MAT_PUF AS LOCATION, MAT_PUFFER.BEZ AS LOCDESC, ` +
      `STATUS AS STATUS, KLASSE AS CLASS FROM MAT_PUFFER, LOS_BESTAND ` +
      `WHERE MAT_PUFFER.MAT_PUF = LOS_BESTAND.MAT_PUF `;

    if (materialCondition) {
      sql += `AND `;
      sql += materialCondition;
    }

    if (bufferCondition) {
      sql += `AND `;
      sql += bufferCondition;
    }

    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      concatMap((res: any) => {
        res.forEach(rec => {
          batchInfos.push(Object.assign(new BatchInfo(), {
            batchName: rec.BATCHNAME,
            status: rec.STATUS,
            materialType: rec.MATERIALTYPE,
            material: rec.MATERIALNUMBER,
            qty: rec.REMAINQUANTITY,
            startQty: rec.QUANTITY,
            currentLocation: rec.LOCATION,
            barCode: ''
          }));
        });

        return of(batchInfos);
      })
    );
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
          return throwError(`Badge your input not exist！`);
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

  getBatchInformation(batchName: string, barCode?: string): Observable<BatchInfo> {
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
          batchInfo.barCode = barCode ? barCode : '';
          return of(batchInfo);
        } else {
          return throwError(`Batch ${batchName} not exist！`);
        }
      })
    );
  }

  getNextBatchName(): Observable<string> {
    const sql = 'SELECT S_MPL_NEXT_LT.NEXTVAL FROM DUAL';
    return this.http.get(`${WEBAPI_HOST}/${this.url}?sql=${sql}`).pipe(
      map(res => {
        return `3SCXTOUT` + this.leftPad(res[0].NEXTVAL, 6);
      })
    );
  }

  private leftPad(str: any, len: number, ch: any = '0') {
    str = String(str);

    let i = -1;

    if (!ch && ch !== 0) {
      ch = ' ';
    }

    len = len - str.length;

    while (++i < len) {
      str = ch + str;
    }

    return str;
  }
}
