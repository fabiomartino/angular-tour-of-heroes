import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Hero } from '../models/heroes.model';
import { MessageService } from './message.service';
import { TranslateService } from '@ngx-translate/core';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class HeroService {

  private heroesUrl = 'api/heroes';  // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private translate: TranslateService
  ) { }

 /**
  * @function getFromTranslation
  * @description GET the translated string with the key
  * @param key Key from the json file
  */
 getFromTranslation(key: string) {
  let result;
  this.translate.get(key).subscribe(
    (val: string) => {
      result = val;
    }
  );
  return result;
}

  /**
   * @function getHeroes
   * @description GET heroes from the server
   * @returns {Observable<Hero[]>}
   */
  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(heroes => this.log(this.getFromTranslation('TOH.HERO_SERVICE.FETCHED_HEROES'))),
        catchError(this.handleError('getHeroes', []))
      );
  }

  /** GET hero by id. Return `undefined` when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = this.heroesUrl + '/?id=' + id;
    const fetched = this.getFromTranslation('TOH.HERO_SERVICE.FETCHED');
    const didNotFind = this.getFromTranslation('TOH.HERO_SERVICE.DID_NOT_FIND');
    const hero = this.getFromTranslation('TOH.HERO_SERVICE.HERO');

    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? fetched : didNotFind;
          this.log(outcome + hero + ' id=' + id);
        }),
        catchError(this.handleError<Hero>('getHero id=' + id))
      );
  }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    const fetchedHero = this.getFromTranslation('TOH.HERO_SERVICE.FETCHED_HERO');

    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(fetchedHero + ' id=' + id)),
      catchError(this.handleError<Hero>('getHero id=' + id))
    );
  }

  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    const foundHeroesMatching = this.getFromTranslation('TOH.HERO_SERVICE.FOUND_HEROES_MATCHING');

    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.http.get<Hero[]>(this.heroesUrl + '/?name=' + term).pipe(
      tap(_ => this.log(foundHeroesMatching + ' ' + term)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new hero to the server */
  addHero(hero: Hero, numHeroes: number): Observable<Hero> {
    const addedHeroW = this.getFromTranslation('TOH.HERO_SERVICE.ADDED_HERO_W');
    if (numHeroes === 0) {
      hero.id = 1;
    }

    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap((newHero: Hero) => this.log(addedHeroW + ' id=' + newHero.id)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;
    const deletedHero = this.getFromTranslation('TOH.HERO_SERVICE.DELETED_HERO');

    return this.http.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(deletedHero + ' id=' + id)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /** PUT: update the hero on the server */
  updateHero(hero: Hero): Observable<any> {
    const updatedHero = this.getFromTranslation('TOH.HERO_SERVICE.UPDATED_HERO');

    return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
      tap(_ => this.log(updatedHero + ' id=' + hero.id)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    const failded = this.getFromTranslation('TOH.HERO_SERVICE.FAILDED');
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(operation + ' ' + failded + ' ' + error.message);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(message);
  }
}
