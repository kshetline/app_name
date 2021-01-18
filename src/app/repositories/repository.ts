import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// This function finds any ISO date/time strings, under appropriately named keys, and converts them
// into JavaScript Date objects.
//
// TODO: See if this can be bound at a lower level in Angular's JSON parsing.
export function parseDates<T>(obj: T | null | undefined): T | null | undefined {
  if (obj == null) {
    return obj;
  } else if (Array.isArray(obj)) {
    return (obj as any).map((item: any) => parseDates(item)) as unknown as T;
  } else if (typeof obj === 'object') {
    const keys = Object.keys(obj);

    for (const key of keys) {
      const value = (obj as any)[key];

      if (typeof value === 'string' && /date/i.test(key) && /^\d{4}-\d\d-\d\d[ T]\d\d:\d\d:\d\d(\.\d+)?(Z|[-+]\d\d(:?\d\d)?)?$/.test(value)) {
        (obj as any)[key] = new Date(value);
      }
    }
  }

  return obj;
}

// Base class for all repositories.
export abstract class Repository<TDefaultEntity> {
  private http: HttpClient;

  constructor(
    injector: Injector,
    protected creator?: (item: any) => TDefaultEntity) {
    this.http = injector.get(HttpClient);

    if (!this.creator) {
      this.creator = (item: any) => item;
    }
  }

  // Requests a single entity from the server.
  // If the entity's type is not the same as TDefaultEntity then a creator function is required.
  protected getOne<T = TDefaultEntity>(urlPath: string, creator: ((item: any) => T) | null = null, noGlobalBusyIndicator = false, params?:
  HttpParams): Observable<T> {
    return this.requestOne('GET', null, urlPath, creator, this.addNoGlobalBusyIndicatorHeader(noGlobalBusyIndicator), params);
  }

  // Requests multiple entities of the same type from the server.
  // If the entity's type is not the same as TDefaultEntity then a creator function is required.
  protected getMany<T = TDefaultEntity>(urlPath: string, creator: ((item: any) => T) | null = null): Observable<T[]> {
    return this.requestMany('GET', null, urlPath, creator);
  }

  // Performs a post request. If the created entity is not the same as TDefaultEntity then a creator function is required.
  protected postOne<T = TDefaultEntity>(body: any, urlPath: string, creator: ((item: any) => T) | null = null, headers?: HttpHeaders,
    noGlobalBusyIndicator = false): Observable<T> {
    return this.requestOne('POST', body, urlPath, creator, this.addNoGlobalBusyIndicatorHeader(noGlobalBusyIndicator, headers));
  }

  protected postWithManyResults<T = TDefaultEntity>(body: any, urlPath: string): Observable<T[]> {
    return this.requestMany('POST', body, urlPath);
  }

  // Performs a put request. If the created entity is not the same as TDefaultEntity then a creator function is required.
  protected putOne<T = TDefaultEntity>(body: any, urlPath: string, creator: ((item: any) => T) | null = null): Observable<T> {
    return this.requestOne('PUT', body, urlPath, creator);
  }

  // Invokes either put or post depending on the value of the isPost parameter.
  protected putOrPost<T = TDefaultEntity>(isPost: boolean, body: any, urlPath: string, creator: ((item: any) => T) | null = null): Observable<T> {
    return isPost ? this.postOne(body, urlPath, creator) : this.putOne(body, urlPath, creator);
  }

  // Performs a post request. Use this method when the server does not return an entity (it may, for example, return the ID of the newly created entity).
  protected post(body: any, urlPath: string, headers?: HttpHeaders): Observable<any> {
    return this.request('POST', body, urlPath, headers);
  }

  // Performs a PUT request. Use this method when the server does not return an entity.
  protected put(body: any, urlPath: string, headers?: HttpHeaders): Observable<any> {
    return this.request('PUT', body, urlPath, headers);
  }

  // Optionally adds the "No Global Busy Indicator" header, which is useful when loading data that should
  // otherwise not block the user interface (such as a dashboard), or saving secondary data such as UI settings.
  private addNoGlobalBusyIndicatorHeader(noGlobalBusyIndicator: boolean, headers?: HttpHeaders): HttpHeaders {
    headers = headers || new HttpHeaders();

    return headers;
  }

  private requestOne<T = TDefaultEntity>(
    method: 'GET' | 'PUT' | 'POST' | 'PATCH',
    body: any,
    urlPath: string,
    creator: ((item: any) => T) | null = null,
    headers?: HttpHeaders,
    params?: HttpParams): Observable<T> {
    if (creator) {
      return this.http.request<T>(method, this.createUrl(urlPath), {
        body,
        headers,
        observe: 'body',
        params,
        responseType: 'json'
      }).pipe(map(item => creator(parseDates(item))));
    } else {
      // Note the heavy casting here. TypeScript complains that TClass is not compatible with T,
      // but we know that if this branch executes then T = TCLass, so everything works out.
      return this.http.request<TDefaultEntity>(method, this.createUrl(urlPath), {
        body,
        headers,
        observe: 'body',
        params,
        responseType: 'json'
      }).pipe(map(item => this.creator!(parseDates(item)))) as any;
    }
  }

  private requestMany<T = TDefaultEntity>(method: 'GET' | 'POST', body: any, urlPath: string, creator: ((item: any) => T) | null = null): Observable<T[]> {
    if (creator) {
      return this.mapResults(this.http.request<T>(method, this.createUrl(urlPath), {
        body,
        observe: 'body',
        responseType: 'json'
      }), creator);
    } else {
      return this.mapResults(this.http.request<TDefaultEntity>(method, this.createUrl(urlPath), {
        body,
        observe: 'body',
        responseType: 'json'
      }));
    }
  }

  private request(method: 'PUT' | 'POST', body: any, urlPath: string, headers?: HttpHeaders): Observable<any> {
    return this.http.request(method, this.createUrl(urlPath), {
      body,
      observe: 'body',
      responseType: 'json',
      headers
    });
  }

  private createUrl(urlPath: string): string {
    let url = `/dashboard-api/v1/api/${urlPath}`;

    if (!url.endsWith('/')) {
      url += '/';
    }

    return url;
  }

  private mapResults<T>(result: Observable<any>, creator: ((item: any) => T) | null = null): Observable<T[]> {
    const c = creator || this.creator!;
    return result.pipe(map(array => (array && array.map) ? array.map((item: any) => c(parseDates(item))) : []));
  }
}
