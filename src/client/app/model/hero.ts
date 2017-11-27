export class Hero {
  static generateMockHero(): Hero {
    return {
      id: 0,
      name: '',
      saying: ''
    };
  }
  constructor(public id: number, public name: string, public saying: string) {}
}
