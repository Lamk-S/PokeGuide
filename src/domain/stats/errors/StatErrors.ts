export class StatDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidIVError extends StatDomainError {}
export class InvalidEVError extends StatDomainError {}
export class InvalidLevelError extends StatDomainError {}
