import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { MainStoreService } from "../services/main-store.service";
import { inject } from "@angular/core";
import { environment } from "../../environments/environment";


export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    
  const store = inject(MainStoreService);
  const apiUrl = environment.apiUrl;
  const _authUrl = `${apiUrl}auth/login`;
  const skipUrls = [_authUrl];

  const isSkip = skipUrls.some(u => req.url.includes(u));
  if (isSkip) {
    return next(req);
  }

  const token = store.token();
  if (!token) {
    // si no hya token enviamos sin autorizacion
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(authReq);
  
}