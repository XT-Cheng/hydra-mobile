//#region Machine info

export interface MachineInfo {
  machine: string;
  status: number;
  statusDescription: string;
  description: string;
  currentOperation: string;
  currentMotherOperation: string;
  nextOperation: string;
  nextMotherOperation: string;
  currentOutputBatch: string;
  currentOperationDescription(): string;
  currentMotherOperationDescription(): string;
  nextOperationDescription(): string;
  nextMotherOperationDescription(): string;

  currentOPDisplay(): string;
  nextOPDisplay(): string;
  statusDisplay(): string;
}

export class MachineInfo implements MachineInfo {
  machine = '';
  status = -1;
  statusDescription = '';
  description = '';
  currentOutputBatch = '';
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
  statusDisplay(): string {
    return `Current Status: ${this.statusDescription}`;
  }
}

//#endregion

//#region Material Master info

export interface IMaterialMaster {
  name: string;
  description: string;
  cartonQty: number;
  palleteQty: number;
}

export class MaterialMaster implements IMaterialMaster {
  name = '';
  description = '';
  cartonQty = 0;
  palleteQty = 0;
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

//#region Machine Status info

export interface IMachineStatus {
  status: number;
  description: string;
  display(): string;
}

export class MachineStatus implements IMachineStatus {
  status = -1;
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
  SAPBatch: string;
  dateCode: string;
  [name: string]: any;
  display(): string;
}

export class BatchInfo implements BatchInfo {
  barCode = '';
  batchName = '';
  startQty = 0;
  qty = 0;
  SAPBatch = '';
  dateCode = '';
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

//#region Tool Info
export interface IToolInfo {
  operation: string;
  usage: number;
  requiredTool: string;
  inputTool: string;
  display(): string;
}

export class ToolInfo implements IToolInfo {
  operation = '';
  usage = -1;
  requiredTool = '';
  inputTool = '';
  display(): string {
    if (this.inputTool) {
      return `Tool:${this.inputTool}`;
    }
    return ``;
  }
}

//#endregion

//#region Resource info

export interface IResourceInfo {
  toolId: string;
  tool: string;
  status: string;
  statusDescription: string;
  belongsTo: string;
  display(): string;
}

export class ResourceInfo implements IResourceInfo {
  toolId: '';
  tool = '';
  status = '';
  statusDescription = '';
  belongsTo = '';
  display(): string {
    if (this.tool) {
      return `Tool:${this.tool}, Status: ${this.statusDescription}`;
    }
    return ``;
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
  display(): string;
}

export class ComponentInfo implements ComponentInfo {
  operatoin = '';
  position = -1;
  usage = 0;
  unit = '';
  material = '';
  inputBatch = '';
  inputBatchQty = 0;
  display(): string {
    if (this.inputBatch) {
      return `Batch:${this.inputBatch},Qty:${this.inputBatchQty}`;
    }
    return ``;
  }
}

//#endregion

//#region Operation Info

export interface IOperation {
  workOrder: string;
  operation: string;
  material: string;
  targetQty: number;
  operationName(): string;
}

export class OperationInfo {
  workOrder = '';
  operation = '';
  material = '';
  targetQty = 0;
  operationName(): string {
    return `${this.workOrder}${this.operation}`;
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
