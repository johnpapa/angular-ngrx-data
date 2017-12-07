export class Villain {
  static generateMockVillain(): Villain {
    return {
      id: 0,
      name: '',
      saying: ''
    };
  }
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly saying: string
  ) {}
}
