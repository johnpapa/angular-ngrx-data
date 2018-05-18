export class Hero {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly saying: string,
    public readonly dateLoaded?: Date
  ) {}
}
