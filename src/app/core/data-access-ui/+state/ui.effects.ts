import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { concatMap, tap, withLatestFrom } from 'rxjs/operators';

import { GAEventCategory, GoogleAnalyticsService } from '@app/core/google-analytics';
import * as UiSelectors from './ui.selectors';
import { UiActions } from './ui.slice';
import { THEME_KEY } from '../helpers';

@Injectable()
export class UiEffects {
  changeTheme$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UiActions.toggleTheme),
        concatMap((action) => of(action).pipe(withLatestFrom(this.store.pipe(select(UiSelectors.getTheme))))),
        tap(([, theme]) => {
          this.document.body.classList.toggle('dark', theme === 'dark');
          localStorage.setItem(THEME_KEY, theme);
        }),
        tap(([, theme]) =>
          this.googleAnalytics.sendEvent({
            name: 'Changed Theme',
            category: GAEventCategory.INTERACTION,
            label: theme,
          })
        )
      ),
    { dispatch: false }
  );

  trackGAOnChangedLanguage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UiActions.changeLanguage),
        tap(({ payload }) =>
          this.googleAnalytics.sendEvent({
            name: 'Changed Language',
            category: GAEventCategory.INTERACTION,
            label: payload,
          })
        )
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private googleAnalytics: GoogleAnalyticsService,
    @Inject(DOCUMENT) private document: Document
  ) {}
}
