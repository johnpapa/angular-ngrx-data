import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityOp } from 'ngrx-data';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { combineLatest, map, shareReplay, startWith, takeUntil } from 'rxjs/operators';

import { Villain } from '../../core';
import { VillainsService } from '../villains.service';

@Component({
  selector: 'app-villain-editor',
  templateUrl: './villain-editor.component.html',
  styleUrls: ['./villain-editor.component.scss']
})
export class VillainEditorComponent implements OnInit, OnDestroy {
  commands = this;
  destroy$ = new Subject();
  error$: Observable<string>;
  loading$: Observable<boolean>;
  villain$: Observable<Villain>;

  constructor(
    private villainsService: VillainsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {

    this.villain$ = this.route.params.pipe(
      map(params => params['id']),
      combineLatest(
        this.villainsService.entityMap$,
        (id, entityMap) => {
          // look for it by key in the cached collection
          const villain = entityMap[id] ;
          if (!villain) {
            // not in cache; dispatch request to get it
            this.villainsService.getByKey(id);
          }
          return villain;
        }
      ),
      takeUntil(this.destroy$), // must be just before shareReplay
      shareReplay(1)
    );

    this.error$ = this.villainsService.errors$.ofOp(EntityOp.QUERY_BY_KEY_ERROR)
    .pipe(
      map(errorAction => errorAction.payload.error.message),
      startWith(''), // prime it for loading$
      takeUntil(this.destroy$)
    );

    this.loading$ = this.error$.pipe(
      combineLatest(
        this.villain$,
        (errorMsg, villain) => !villain && !errorMsg
      )
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  update(villain: any) {
    this.villainsService.update(villain);
  }

  close() {
    this.router.navigate(['/villains']);
  }

}
