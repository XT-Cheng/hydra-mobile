import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class FetchService {
    constructor(protected http: HttpClient) {
    }

    fetch(sql: string): Observable<any> {
        return this.http.get('');
    }
}
