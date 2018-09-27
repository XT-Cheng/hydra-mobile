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
    return `Current Mother OP :${this.currentMotherOperation}`;
  }
  nextOperationDescription(): string {
    return `Next OP :${this.currentMotherOperation}`;
  }
  nextMotherOperationDescription(): string {
    return `Next Mother OP :${this.nextMotherOperation}`;
  }
}

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
