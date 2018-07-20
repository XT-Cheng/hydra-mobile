import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class TitleService {
    private title$: Subject<string>;

    constructor() {
        this.title$ = new Subject();
    }

    setTitle(title: string) {
        this.title$.next(title);
    }

    get titleChanged(): Observable<string> {
        return this.title$.asObservable();
    }
}
