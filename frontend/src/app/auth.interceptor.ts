import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Defines an Angular HTTP interceptor (AuthInterceptor) that automatically adds an authorization token to the headers of outgoing HTTP requests.
 */
@Injectable()
/**
 * AuthInterceptor Class
 * This interceptor is designed to intercept all HTTP requests and add an authorization token to the request headers.
 * It is commonly used for REST APIs requiring token-based authentication.
 */
export class AuthInterceptor implements HttpInterceptor {

  /**
   * Intercepts HTTP requests and adds an authorization token (if available) to the request headers.
   * @param req The current HTTP request object, containing the URL, method, headers, etc.
   * @param next The next handler in the HTTP pipeline that processes the request.
   * @returns An observable of the HTTP event stream with the token added to the request, or the original request if no token is found.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    /**
     * Retrieve the stored user token from localStorage.
     * @constant {string | null} token The authorization token used to identify the user.
     */
    const token = localStorage.getItem('token');

    /**
     * Log the current token value for debugging purposes.
     */
    // console.log(token);

    // If a token exists, clone the request and add the token to the headers
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('x-access-token', token)
      });

      /**
       * Return the cloned request with the token.
       */
      return next.handle(cloned);
    }

    /**
     * If no token is found, pass the original request without modification.
     */
    return next.handle(req);
  }
}
