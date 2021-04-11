import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthServiceService {
  private tokenSubject: BehaviorSubject<any>;
  private data: any = {};
  private refreshTokenTimeout = 0;
  public token: Observable<any>;

  url: string =
    'https://ais2auth-vyvoj.science.upjs.sk/oauth2/token?scope=openid';

  constructor(private http: HttpClient) {
    this.tokenSubject = new BehaviorSubject<any>(null);
    this.token = this.tokenSubject.asObservable();
  }

  login(username: string, password: string) {
    let options = {
      headers: new HttpHeaders().set(
        'Content-Type',
        'application/x-www-form-urlencoded'
      ),
    };
    let body = `grant_type=password&client_id=${environment.client_id}&client_secret=${environment.client_secret}&username=${username}&password=${password}`;
    return this.http.post(this.url, body, options).pipe(
      map((token) => {
        this.tokenSubject.next(token);
        this.data = token;
        this.startRefreshTokenTimer();
        return token;
      })
    );
  }

  refreshToken() {
    let credentials = btoa(
      ` $${environment.client_id}:${environment.client_secret}`
    );
    let authorizationData = 'Basic ' + credentials;
    let options = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', authorizationData),
    };
    let body = `grant_type=refresh_token&refresh_token=${this.data?.refresh_token}`;
    return this.http.post(this.url, body, options).pipe(
      map((user) => {
        console.log(user);
      })
    );
  }

  // refreshToken() {
  //   console.log('refresh token');
  // }

  private startRefreshTokenTimer() {
    // set a timeout to refresh the token a minute before it expires
    // const timeout = this.tokenSubject.value.expires_in*1000 -6000;
    const timeout = 5000;
    // this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
  }

  public stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
