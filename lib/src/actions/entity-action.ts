import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { EntityOp } from './entity-op';

export interface EntityAction<P = any> extends Action {
  readonly type: string;
  readonly payload: EntityActionPayload<P>;
}

/** Payload of an EntityAction */
export interface EntityActionPayload<P = any> extends EntityActionOptions {
  readonly entityName: string;
  readonly op: EntityOp;
  readonly data?: P;
}

/** Options of an EntityAction */
export interface EntityActionOptions {
  /** Correlate related EntityActions, particularly related saves. Must be serializable. */
  readonly correlationId?: any;
  /** True if should perform action optimistically (before server responds) */
  readonly isOptimistic?: boolean;
  readonly mergeStrategy?: MergeStrategy;
  /** The tag to use in the action's type. The entityName if no tag specified. */
  readonly tag?: string;

  // Mutable actions are BAD.
  // Unfortunately, these mutations are the only way to stop @ngrx/effects
  // from processing these actions.

  /**
   * The action was determined (usually by a reducer) to be in error.
   * Downstream effects should not process but rather treat it as an error.
   */
  error?: Error;

  /**
   * Downstream effects should skip processing this action but should return
   * an innocuous Observable<Action> of success.
   */
  skip?: boolean;
}

/** How to merge an entity when the corresponding entity in the collection has unsaved changes. */
export enum MergeStrategy {
  /**
   * Preserves the current changed collection entity (Query success default).
   * Preserve the pending change.
   * Overwrites the changeState.originalValue for the merged entities if set.
   */
  PreserveChanges,
  /**
   * Replace the current collection entity (Cache operation default).
   * Preserves the changeState.originalValue for the merged entities if set.
   * Special rules for REMOVE...
   */
  OverwriteCurrent,
  /**
   * Replace the current collection entity (Save success default).
   * Change is lost.
   * Deletes the ChangeState for the merged entities if set
   * and their ChangeTypes becomes "unchanged".
   */
  OverwriteChanges
}

/** Safely extract the data from the EntityAction payload */
export function extractActionData<T = any>(action: EntityAction<T>) {
  return action.payload && action.payload.data;
}
