import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { LOCALIZE_ROUTER_CONFIG, TranslocoLocalizeRouterConfig } from './transloco-localize-router.config';

let service: TranslocoLocalizeRouterService;

export function translateRoute<T = any>(route: string | any[], lang?: string): T {
  return service.translateRoute(route, lang);
}

@Injectable({ providedIn: 'root' })
export class TranslocoLocalizeRouterService {
  constructor(
    @Inject(LOCALIZE_ROUTER_CONFIG) private config: TranslocoLocalizeRouterConfig,
    private transloco: TranslocoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    service = this;
  }

  translateRoute<T = any>(route: string | any[], lang: string = this.transloco.getActiveLang()): T {
    const startPath = this.showPrefix(lang) ? `/${lang}` : '';
    const translatedRoute = Array.isArray(route)
      ? startPath
        ? [startPath, ...route?.map((path: string) => String(path).replace('/', '')).filter(Boolean)]
        : [...route]
      : startPath + (route || '/');

    return translatedRoute as any;
  }

  changeLanguage(lang: string, extras: NavigationExtras = {}): void {
    const currentLang = this.transloco.getActiveLang();
    if (lang !== currentLang) {
      const route = this.router.url.split('?')[0]?.replace(`/${currentLang}/`, '/');
      const queryParams = this.route.snapshot.queryParams;
      this.router.navigate([this.translateRoute(route, lang)], {
        ...extras,
        queryParams: {
          ...queryParams,
          ...extras.queryParams,
        },
      });
    }
  }

  showPrefix(lang: string): boolean {
    return this.config.alwaysPrefix || lang !== this.noPrefixLang;
  }

  isSupportedLang(lang: string): boolean {
    return this.showPrefix(lang) && this.transloco.isLang(lang);
  }

  get noPrefixLang(): string {
    return this.config.noPrefixLang;
  }
}
