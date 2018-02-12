/** TODO: much more testing */
import { Selector } from '@ngrx/store';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';

import { commandDispatchTest } from './entity-dispatcher.spec';
import { EntityDispatcherFactory } from './entity-dispatcher';
import { EntityAction, EntityActionFactory } from './entity.actions';
import { EntityCollection } from './entity-definition';
import { EntityCollectionCreator } from './entity-collection-creator';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityService, EntityServiceFactory } from './entity.service';
import { EntitySelectors$Factory } from './entity.selectors$';

describe('EntityService', () => {
  describe('Commands', () => {
    commandDispatchTest(entityServiceTestSetup);
  })
});

//// Test helpers ////
class Hero {
  id: number;
  name: string;
  saying?: string;
}

const heroMetadata = {
  entityName: 'Hero'
}

class TestStore  {
  collection$ = new BehaviorSubject({
    Hero: {
      ids: [],
      entities: {},
      filter: undefined,
      loading: false
    } as EntityCollection<Hero>
  });

  dispatch = jasmine.createSpy('dispatch');

  get dispatchedAction() {
    return <EntityAction> this.dispatch.calls.argsFor(0)[0];
  }

  select() {
    return {
      select: <V>(selector: Selector<EntityCollection<Hero>, V>) =>
        this.collection$.pipe(
          map(c => selector),
          distinctUntilChanged()
        )
    }
  }
}

function entityServiceTestSetup() {
  const testStore = new TestStore();

  const entityActionFactory = new EntityActionFactory();

  const entityDefinitionService =
    new EntityDefinitionService([{Hero: heroMetadata}]);

  const entityDispatcherFactory =
    new EntityDispatcherFactory(entityActionFactory, <any> testStore);

  const entityCollectionCreator =
    new EntityCollectionCreator(entityDefinitionService);

  const entitySelectors$Factory =
    new EntitySelectors$Factory('TestEntityCache', entityCollectionCreator, <any> testStore);

  const entityServiceFactory = new EntityServiceFactory(
    entityDispatcherFactory,
    entityDefinitionService,
    entitySelectors$Factory
  );

  const dispatcher = entityServiceFactory.create<Hero>('Hero');
  return { dispatcher, testStore };
}


