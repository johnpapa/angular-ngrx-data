import { AngularNgrxPage } from './app.po';

describe('angular-ngrx-data App', () => {
  let page: AngularNgrxPage;

  beforeEach(() => {
    page = new AngularNgrxPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to toh!!');
  });
});
