import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { MainStoreService } from "../services/main-store.service";


export function tokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    
    return next(req).pipe(tap(event => {
        
        if (event.type === HttpEventType.Response) {
        
            console.log(req.url, 'returned a response with status', event.status);
        
        }

    }));
  
}