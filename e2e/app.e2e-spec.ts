import { ngrxDataPage } from './app.po';

describe('ngrx-data App', () => {
  let page: ngrxDataPage;

  beforeEach(() => {
    page = new ngrxDataPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to toh!!');
  });
});
