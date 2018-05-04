// AOT v5 bug:
// export utils FIRST or `ng build --aot` of any app using ngrx-data produces strange errors
export * from './utils';
export * from './actions';
export * from './dataservices';
export * from './dispatchers';
export * from './effects';
export * from './entity-metadata';
export * from './entity-service';
export * from './reducers';
export * from './selectors';

export { NgrxDataModule, NgrxDataModuleConfig } from './ngrx-data.module';
