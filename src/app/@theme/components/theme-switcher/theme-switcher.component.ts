import { Component } from "@angular/core";
import { NbThemeService } from "@nebular/theme";

@Component({
  selector: "theme-switcher",
  templateUrl: "./theme-switcher.component.html",
})
export class ThemeSwitcherComponent {
  isDarkTheme: boolean;

  constructor(private themeService: NbThemeService) {
    this.isDarkTheme =
      ThemeSwitcherComponent.getThemeName() === "dark" ? true : false;
  }

  changeTheme(toggleFlag: boolean): void {
    let themeName: string;
    themeName = toggleFlag ? "dark" : "default";
    localStorage.setItem("themeName", themeName);
    this.themeService.changeTheme(themeName);
  }

  static getThemeName(): string {
    return localStorage.getItem("themeName") || "dark";
  }
}
