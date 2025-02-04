
import {throwError as observableThrowError,  Observable } from 'rxjs';

import {map, catchError} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LayerModel } from '@auscope/portal-core-ui';
import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders, HttpResponse} from '@angular/common/http';


@Injectable()
export class CataloguesearchService {

  static RESULTS_PER_PAGE: number = 35;

  constructor(private http: HttpClient) { }


  public getFilteredCSWKeywords(cswServiceId: string): Observable<any> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('cswServiceIds', cswServiceId);
    return this.http.post(environment.portalBaseUrl + 'getFilteredCSWKeywords.do', httpParams.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      responseType: 'json'
    }).pipe(map(response => {
      if (response['success'] === true) {
        return response['data'];
      } else {
        return observableThrowError(response['msg']);
      }
    }), catchError(
      (error: HttpResponse<any>) => {
        return observableThrowError(error);
      }
      ), );
  }

  public getFilteredCSWRecords(param: any, page: number): Observable<any> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('key', 'cswServiceId');
    httpParams = httpParams.append('key', 'keywordMatchType');

    if (param.anyText) {
      httpParams = httpParams.append('key', 'anyText');
    }
    if (param.title) {
      httpParams = httpParams.append('key', 'title');
    }
    if (param.abstract) {
      httpParams = httpParams.append('key', 'abstract');
    }
    if (param.north) {
      httpParams = httpParams.append('key', 'north');
    }
    if (param.south) {
      httpParams = httpParams.append('key', 'south');
    }
    if (param.east) {
      httpParams = httpParams.append('key', 'east');
    }
    if (param.west) {
      httpParams = httpParams.append('key', 'west');
    }
    if (param.keywords) {
      httpParams = httpParams.append('key', 'keywords');
    }

    httpParams = httpParams.append('value', param.cswService.id);
    httpParams = httpParams.append('value', 'Any');
    if (param.anyText) {
      httpParams = httpParams.append('value', param.anyText);
    }
    if (param.title) {
      httpParams = httpParams.append('value', param.title);
    }
    if (param.abstract) {
      httpParams = httpParams.append('value', param.abstract);
    }
    if (param.north) {
      httpParams = httpParams.append('value', param.north);
    }
    if (param.south) {
      httpParams = httpParams.append('value', param.south);
    }
    if (param.east) {
      httpParams = httpParams.append('value', param.east);
    }
    if (param.west) {
      httpParams = httpParams.append('value', param.west);
    }
    if (param.keywords) {
      httpParams = httpParams.append('value', param.keywords);
    }

    const start = ((page - 1) * CataloguesearchService.RESULTS_PER_PAGE);
    httpParams = httpParams.append('page', page.toString());
    httpParams = httpParams.append('start', start.toString());
    httpParams = httpParams.append('limit', CataloguesearchService.RESULTS_PER_PAGE.toString());

    return this.http.post(environment.portalBaseUrl + 'getFilteredCSWRecords.do', httpParams.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      responseType: 'json'
    }).pipe(map(response => {
      if (response['success'] === true) {
        const cswRecords = response['data'];
        const itemLayers = [];
        itemLayers[param.cswService.title] = [];
        cswRecords.forEach(function(item, i, ar) {
          const itemLayer = new LayerModel();
          itemLayer.cswRecords = [item];
          itemLayer['expanded'] = false;
          itemLayer.id = item.id;
          itemLayer.description = item.description;
          itemLayer.hidden = false;
          itemLayer.layerMode = 'NA';
          itemLayer.name = item.name;
          itemLayers[param.cswService.title].push(itemLayer);
        });
        return {
          itemLayers: itemLayers,
          totalResults: parseInt(response['totalResults'], 10)
        }
      } else {
        return observableThrowError(response['msg']);
      }
    }), catchError((error: HttpResponse<any>) => {
      return observableThrowError(error);
    }), );
  }


  public getCSWServices(): Observable<any> {
    return this.http.post(environment.portalBaseUrl + 'getCSWServices.do', {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      responseType: 'json'
    }).pipe(map(response => {
      if (response['success'] === true) {
        return response['data'];
      } else {
        return observableThrowError(response['msg']);
      }
    }), catchError(
      (error: HttpResponse<any>) => {
        return observableThrowError(error);
      }
      ), );
  }

}
