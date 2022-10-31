import { Router } from "@angular/router";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class TranslateService {
  constructor(private router: Router) { }

  changeLanguage(lang: string) {
    localStorage.setItem("locale", lang);
    location.pathname = `${lang}${this.router.url}`;
  }
}
