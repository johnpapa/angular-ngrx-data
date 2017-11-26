import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';

import { ToastService } from './toast.service';

export class AuthInterceptor implements HttpInterceptor {
  constructor(private toastService: ToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const started = Date.now();
    return next.handle(req).do(event => {
      if (event instanceof HttpResponse) {
        const elapsed = Date.now() - started;
        console.log(`Request for ${req.urlWithParams} took ${elapsed} ms.`);
      }
    }).catch(response => {
      if (response instanceof HttpErrorResponse) {
        console.log('Processing http error', response);
        if (response.status === 401) {
          // -------------------------
          // unauthorized
          // We have options:
          // 1. We can redirect, if we had a login page :)
          // or
          // 2. force a redirect and reload
          // window.location.href = 'http://localhost:3000/api/login';
          // or
          // 3. tell the user with a toast
          // -------------------------
          this.toastService.activate('press the login button');
          // alert('press the login button!');
        }
      }

      return Observable.throw(response);
    });
  }
}

