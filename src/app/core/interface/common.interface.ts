//#region Machine Info

export interface MachineInfo {
  machine: string;
  description: string;
  currentOperation: string;
  currentMotherOperation: string;
  nextOperation: string;
  nextMotherOperation: string;
  currentOperationDescription(): string;
  currentMotherOperationDescription(): string;
  nextOperationDescription(): string;
  nextMotherOperationDescription(): string;

  currentOPDisplay(): string;
  nextOPDisplay(): string;
}

export class MachineInfo implements MachineInfo {
  machine = '';
  description = '';
  currentOperation = '';
  currentMotherOperation = '';
  nextOperation = '';
  nextMotherOperation = '';

  currentOperationDescription(): string {
    return `Current OP : ${this.currentOperation ? this.currentOperation : 'N/A'}`;
  }
  currentMotherOperationDescription(): string {
    return `Current FG OP :${this.currentMotherOperation ? this.currentMotherOperation : 'N/A'}`;
  }
  currentOPDisplay(): string {
    return `${this.currentMotherOperationDescription()}, ${this.currentOperationDescription()}`;
  }
  nextOperationDescription(): string {
    return `Next OP :${this.nextOperation ? this.nextOperation : 'N/A'}`;
  }
  nextMotherOperationDescription(): string {
    return `Next FG OP :${this.nextMotherOperation ? this.nextMotherOperation : 'N/A'}`;
  }
  nextOPDisplay(): string {
    return `${this.nextOperationDescription()}, ${this.nextMotherOperationDescription()}`;
  }
}

//#endregion

//#region Reason Code info

export interface ReasonInfo {
  code: string;
  description: string;
  display(): string;
}

export class ReasonInfo implements ReasonInfo {
  code = '';
  description = '';
  display(): string {
    return `Description: ${this.description}`;
  }
}

//#endregion

//#region Operator info

export interface OperatorInfo {
  badge: string;
  firstName: string;
  lastName: string;
  display(): string;
}

export class OperatorInfo implements OperatorInfo {
  badge = '';
  firstName = '';
  lastName = '';
  display(): string {
    return `Name: ${this.firstName} ${this.lastName}`;
  }
}

//#endregion

//#region Material Buffer info

export interface MaterialBufferInfo {
  name: string;
  description: string;
  display(): string;
}

export class MaterialBufferInfo implements MaterialBufferInfo {
  name = '';
  description = '';
  display(): string {
    return `Buffer: ${this.description}`;
  }
}

//#endregion

//#region Batch Info

export interface BatchInfo {
  barCode: string;
  batchName: string;
  startQty: number;
  qty: number;
  material: string;
  materialType: string;
  status: string;
  currentLocation: string;
  display(): string;
}

export class BatchInfo implements BatchInfo {
  barCode = '';
  batchName = '';
  startQty = 0;
  qty = 0;
  material = '';
  materialType = '';
  status = '';
  currentLocation = '';
  display(): string {
    if (this.batchName) {
      return `Name: ${this.batchName}, Mat: ${this.material}, Qty: ${this.qty} Loc: ${this.currentLocation}`;
    } else {
      return `Name: N/A`;
    }
  }
}
//#endregion

//#region Component Info

export interface ComponentInfo {
  operatoin: string;
  position: number;
  usage: number;
  unit: string;
  material: string;
  inputBatch: string;
  inputBatchQty: number;
}

export class ComponentInfo implements ComponentInfo {
  operatoin = '';
  position = -1;
  usage = 0;
  unit = '';
  material = '';
  inputBatch = '';
  inputBatchQty = 0;
}

//#endregion

//#region Input Data
export interface InputData {
  badge: string;
  operation: string;
  machine: string;
  yield: number;
  scrap: number;
  scrapReason: string;
  scrapDescription: string;
}

export class InputData implements InputData {
  badge = '';
  operation = '';
  machine = '';
  yield = 0;
  scrap = 0;
  scrapReason = '';
  scrapDescription = '';
}

//#endregion
