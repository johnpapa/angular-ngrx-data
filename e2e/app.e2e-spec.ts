'use strict'; // necessary for es6 output in node.js
import { AppPage } from './app.po';
import { browser, by, element, ExpectedConditions } from 'protractor';

describe('angular-ngrx-data sample app', () => {
  let page: AppPage;

  beforeEach(() => (page = new AppPage()));

  describe('Heroes', () => {
    const entityName = 'heroes';
    beforeEach(async () => await page.navigateToHeroes());
    runNavigationTests(entityName);
  });

  describe('Villains', () => {
    const entityName = 'villains';
    beforeEach(async () => await page.navigateToVillains());
    runNavigationTests(entityName);
  });

  function runNavigationTests(entityName: string) {
    it(`should navigate to ${entityName}`, async () => {
      const link = page.getActiveLink();
      expect(await link.isPresent()).toBe(true);
      expect(await page.getListTitle().getText()).toMatch(
        new RegExp(entityName, 'i')
      );
    });

    it(`should have ${entityName} items > 0`, async () => {
      expect(await page.getListItems().count()).toBeGreaterThan(0);
    });

    it(`should remove item when deleted`, async () => {
      const originalListCount = await page.getListItems().count();
      await page.deleteFirstListItem();
      expect(await page.getListItems().count()).toEqual(originalListCount - 1);
      expect(await page.getDetailTitle().isPresent()).toBe(false);
    });

    describe(`when pressing refresh on ${entityName}`, () => {
      it(`should have same number of items`, async () => {
        const originalListCount = await page.getListItems().count();
        await page.clickRefreshButton();
        const refreshedListCount = await page.getListItems().count();
        expect(originalListCount).toEqual(refreshedListCount);
      });

      it(`should close detail`, async () => {
        await page.clickRefreshButton();
        expect(await page.getDetailTitle().isPresent()).toBe(false);
      });

      it(`when selecting an item and the refreshing, should close detail`, async () => {
        await page.selectFirstItemInList();
        await page.clickRefreshButton();
        expect(await page.getDetailTitle().isPresent()).toBe(false);
      });
    });

    describe(`when pressing add to create a new ${entityName}`, () => {
      it(`should open detail`, async () => {
        await page.clickAddButton();
        expect(await page.getDetailTitle().getText()).toMatch('Details');
      });

      it(`should NOT have matching name in selected list and detail item`, async () => {
        const { name: originalListName } = await page.getFirstItemInList();
        await page.clickAddButton();
        expect(await page.getDetailNameInputValue()).not.toMatch(
          originalListName
        );
        expect(await page.getDetailNameInputValue()).toMatch('');
      });

      it(`should not save when canceling`, async () => {
        await page.clickAddButton();
        const { name: originalListName } = await page.getFirstItemInList();
        const newName = await page.changeDetailsName('new name');
        await page.closeDetails();
        expect(await page.getDetailFormElement('name').isPresent()).toBe(false);
        expect(originalListName).not.toMatch(newName);
      });

      it(`should save when saving`, async () => {
        const originalListCount = await page.getListItems().count();
        await page.clickAddButton();
        const newName = await page.changeDetailsName('new name');
        const newSaying = await page.changeDetailsSaying('new saying');
        await page.saveDetails();

        // const EC = ExpectedConditions;
        // browser.wait(EC.stalenessOf(page.getDetailTitle()), 5000);

        expect(await page.getListItems().count()).toEqual(
          originalListCount + 1
        );

        expect(await page.getDetailFormElement('name').isPresent()).toBe(false);
        expect(
          await page.getElementFromListByClass('name', newName).getText()
        ).toBe(newName);

        expect(await page.getDetailFormElement('saying').isPresent()).toBe(
          false
        );
        expect(
          await page.getElementFromListByClass('saying', newSaying).getText()
        ).toBe(newSaying);
      });
    });

    describe(`when selecting an item from ${entityName} list`, () => {
      it(`should open detail`, async () => {
        await page.selectFirstItemInList();
        expect(await page.getDetailTitle().getText()).toMatch('Details');
      });

      it(`should have matching name in selected list and detail item`, async () => {
        const { name: originalListName } = await page.selectFirstItemInList();
        expect(await page.getDetailNameInputValue()).toMatch(originalListName);
      });

      it(`should not save when editing and canceling`, async () => {
        const { name: originalListName } = await page.selectFirstItemInList();
        const newName = await page.changeDetailsName('new name');
        await page.closeDetails();
        expect(await page.getDetailFormElement('name').isPresent()).toBe(false);
        expect(originalListName).not.toMatch(newName);
      });

      it(`should save when editing and saving`, async () => {
        const { name: originalListName } = await page.selectFirstItemInList();
        const newName = await page.changeDetailsName('new name');
        await page.saveDetails();
        const updatedListName = await page
          .getFirstElementFromList('name')
          .getText();
        expect(await page.getDetailFormElement('name').isPresent()).toBe(false);
        expect(updatedListName).toMatch(newName);
        expect(originalListName).not.toMatch(updatedListName);
      });
    });
  }
});
