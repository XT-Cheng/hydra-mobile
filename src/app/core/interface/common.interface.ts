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
  nextOperationDescription(): string {
    return `Next OP :${this.nextOperation ? this.nextOperation : 'N/A'}`;
  }
  nextMotherOperationDescription(): string {
    return `Next FG OP :${this.nextMotherOperation ? this.nextMotherOperation : 'N/A'}`;
  }

  currentOPDisplay(): string {
    return `${this.currentMotherOperationDescription()}, ${this.currentOperationDescription()}`;
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
  name: string;
  startQty: number;
  qty: number;
  material: string;
  materialType: string;
  status: string;
  currentLocation: string;
  display(): string;
}

export class BatchInfo implements BatchInfo {
  name = '';
  startQty = 0;
  qty = 0;
  material = '';
  materialType = '';
  status = '';
  currentLocation = '';
  display(): string {
    if (this.name) {
      return `Name: ${this.name}, Mat: ${this.material}, Qty: ${this.qty} Loc: ${this.currentLocation}`;
    } else {
      return `Name: N/A`;
    }
  }
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
