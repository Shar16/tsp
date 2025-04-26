import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly baseUrl = 'https://audio-emailer-dev.onrender.com';
  //private readonly baseUrl = 'http://localhost:3000'; //Use for local testing

  constructor(private http: HttpClient) {}

  // Default headers
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // Add any default headers here
    });
  }

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const options = {
      headers: this.getHeaders(),
      params: params
    };

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const options = {
      headers: this.getHeaders()
    };

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const options = {
      headers: this.getHeaders()
    };

    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  delete<T>(endpoint: string): Observable<T> {
    const options = {
      headers: this.getHeaders()
    };

    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    const options = {
      headers: this.getHeaders()
    };

    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data, options)
      .pipe(
        catchError(this.handleError)
      );
  }

    private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
