import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from '../services/auth-service.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

export const EN_TRANSLATIONS = {
  LOGIN_BUTTON: 'Log in',
  INVALID_ERROR_MESSAGE: 'Invalid credentials',
  USERNAME: 'Username',
  PASSWORD: 'Password',
  TITLE: 'Log in',
};

export const SK_TRANSLATIONS = {
  LOGIN_BUTTON: 'Prihlasiť sa',
  INVALID_ERROR_MESSAGE: 'Nespravne prihlasovacie udaje',
  USERNAME: 'Prihlasovacie meno',
  PASSWORD: 'Heslo',
  TITLE: 'Prihlásenie',
};

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit, OnChanges {
  translationsUrl = './../assets/i18n';
  loginForm!: FormGroup;
  submitted = false;
  hasError: boolean;

  @Input() logOut: boolean;

  @Output() onLoginError = new EventEmitter<any>();
  @Output() onLoginSuccess = new EventEmitter<any>();
  @Output() asGuestLogin = new EventEmitter<any>();
  @Output() changeLanguage = new EventEmitter<any>();

  private lang: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthServiceService,
    private translate: TranslateService,
    private http: HttpClient
  ) {
    this.lang = 'sk';
    translate.setDefaultLang('sk');
    translate.use('sk');
    this.translate.setTranslation('sk', EN_TRANSLATIONS);
  }

  ngOnInit() {
    this.loadTranslations('sk');
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.logOut.currentValue) {
      this.authService.stopRefreshTokenTimer();
    }
  }

  onSubmit() {
    this.submitted = true;
    if (!this.loginForm.invalid) {
      const { username, password } = this.loginForm.getRawValue();
      this.authService.login(username, password).subscribe(
        (res) => {
          this.hasError = false;
          this.onLoginSuccess.emit(res);
          this.changeLanguage.emit(this.lang);
        },
        (err) => {
          this.hasError = true;
        }
      );
    }
  }
  loadTranslations(locale: string) {
    return this.http
      .get(`${this.translationsUrl}/${locale}.json`)
      .subscribe((data: any) => {
        console.log(data);
        this.translate.setTranslation(locale, data);
      });
  }

  setSkLanguage() {
    this.translate.use('sk');
    this.translate.setTranslation('sk', SK_TRANSLATIONS);
    this.lang = 'sk';
  }
  setEnLanguage() {
    this.translate.use('en');
    this.translate.setTranslation('en', EN_TRANSLATIONS);
    this.lang = 'en';
  }
}
