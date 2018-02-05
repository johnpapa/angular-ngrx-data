/** TODO: much more testing */
import { Selector } from '@ngrx/store';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';

import { commandDispatchTest } from './entity-dispatcher.spec';
import { createEntityDispatcher } from './entity-dispatcher';
import { EntityAction } from './entity.actions';
import { EntityCollection } from './entity-definition';
import { EntityDefinitionService } from './entity-definition.service';
import { EntityService, EntityServiceFactory } from './entity.service';

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

function entityServiceTestSetup() {
  const testStore = new TestStore();

  const entityDefinitionService =
    new EntityDefinitionService([{Hero: heroMetadata}]);

  const entityServiceFactory = new EntityServiceFactory(
    'entityCache', // cacheName
    createEntityDispatcher,
    null, // EntityActions
    entityDefinitionService,
    <any> testStore
  )

  const dispatcher = entityServiceFactory.create<Hero>('Hero');
  return { dispatcher, testStore };
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
