import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Inject, Injectable, Injector } from "@angular/core";
import {
  NbAuthService,
  NbAuthToken,
  NB_AUTH_TOKEN_INTERCEPTOR_FILTER,
} from "@nebular/auth";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector,
    @Inject(NB_AUTH_TOKEN_INTERCEPTOR_FILTER) protected filter
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.filter(req) && req.url.startsWith("/api")) {
      return this.authService.isAuthenticatedOrRefresh().pipe(
        switchMap((authenticated) => {
          if (authenticated) {
            return this.authService.getToken().pipe(
              switchMap((token: NbAuthToken) => {
                const JWT = `Bearer ${token.getValue()}`;
                req = req.clone({
                  setHeaders: {
                    "X-Authorization": JWT,
                  },
                });
                return next.handle(req);
              })
            );
          } else {
            return next.handle(req);
          }
        })
      );
    } else {
      return next.handle(req);
    }
  }

  protected get authService(): NbAuthService {
    return this.injector.get(NbAuthService);
  }
}
