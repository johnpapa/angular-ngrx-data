import { browser, by, element, ElementFinder } from 'protractor';
import { Element } from '@angular/compiler';

by.addLocator(
  'formControlName',
  (value: string, opt_parentElement: HTMLElement, opt_rootSelector: HTMLElement) => {
    const using = opt_parentElement || document;

    return using.querySelectorAll(`[formControlName="${value}"]`);
  }
);

export class AppPage {
  navigateToHeroes() {
    return browser.get('/heroes?e2e');
  }

  navigateToVillains() {
    return browser.get('/villains?e2e');
  }

  async deleteFirstListItem() {
    const firstDeleteButton = this.getFirstDeleteButton();
    await firstDeleteButton.click();
  }

  getToolbarLinks() {
    return element.all(by.css('mat-toolbar a[routerlinkactive]'));
  }

  getActiveLink() {
    return element(by.css('mat-toolbar a.router-link-active'));
  }

  getListTitle() {
    return element(by.css('.list-container mat-card-title'));
  }

  getDetail() {
    return element(by.css('.detail-container'));
  }

  getDetailNameInputValue() {
    return this.getDetailFormElement('name').getAttribute('value');
  }

  getDetailFormElement(elName: string) {
    return this.getDetail().element(by.formControlName(elName));
  }

  getDetailTitle() {
    return this.getDetail().element(by.css('mat-card-title'));
  }

  getFirstDeleteButton() {
    return element.all(by.css('button.delete-button')).first();
  }

  getListItems() {
    return element.all(by.css('mat-card-content li'));
  }

  getFirstElementFromList(elName: string) {
    return this.getListItems()
      .first()
      .element(by.css(`div.${elName}`));
  }

  getElementFromListByClass(className: string, value: string) {
    return element(by.cssContainingText(`.${className}`, value));
  }

  async selectFirstItemInList() {
    const { firstItem, nameElement, name } = await this.getFirstItemInList();
    await firstItem.click();

    return {
      firstItem,
      nameElement,
      name
    };
  }

  async getFirstItemInList() {
    const firstItem = this.getListItems().first();
    const nameElement = this.getFirstElementFromList('name');
    const name = await nameElement.getText();

    return {
      firstItem,
      nameElement,
      name
    };
  }

  async closeDetails() {
    const cancelButton = element(by.cssContainingText('button', 'Cancel'));
    await cancelButton.click();
  }

  async clickAddButton() {
    const addButton = element(
      by.cssContainingText('.control-panel .button-panel button', 'Add')
    );
    await addButton.click();
  }

  async clickRefreshButton() {
    const refreshButton = element(
      by.cssContainingText('.control-panel .button-panel button', 'Refresh')
    );
    await refreshButton.click();
  }

  async saveDetails() {
    const saveButton: ElementFinder = this.getDetail().element(
      by.cssContainingText('button', 'Save')
    );
    await saveButton.click();
  }

  async changeDetailsName(newValue: string) {
    const name: ElementFinder = this.getDetailFormElement('name');
    await name.sendKeys(newValue);
    return newValue;
  }

  async changeDetailsSaying(newValue: string) {
    const saying = this.getDetailFormElement('saying');
    await saying.sendKeys(newValue);
    return newValue;
  }
}
