import { TranslateService } from "./../../../shared/service/translate/translate.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  NbMediaBreakpointsService,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
} from "@nebular/theme";
import { interval, Observable, Subject, Subscription } from "rxjs";
import { filter, map, takeUntil } from "rxjs/operators";
import { LayoutService } from "../../../@core/utils";
import { RippleService } from "../../../@core/utils/ripple.service";
import { AuthService } from "../../../shared/service/auth/auth.service";
import { PoleService } from "./../../../shared/service/pole/pole.service";

@Component({
  selector: "ngx-header",
  styleUrls: ["./header.component.scss"],
  templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  public readonly materialTheme$: Observable<boolean>;
  userPictureOnly: boolean = false;
  menuClick$: Subscription;
  clockInterval$: Subscription;
  currentLang = localStorage.getItem("locale") ? localStorage.getItem("locale") : "zh-Hant";
  user: any;
  date: Date;

  accessTypes = {
    admin: $localize`:@@admin:系統管理者`,
    manager: $localize`:@@manager:管理者`,
    user: $localize`:@@user:使用者`,
  };
  accessType: string;
  themes = [
    {
      value: "default",
      name: "Light",
    },
    {
      value: "dark",
      name: "Dark",
    },
    {
      value: "cosmic",
      name: "Cosmic",
    },
    {
      value: "corporate",
      name: "Corporate",
    },
    {
      value: "material-light",
      name: "Material Light",
    },
    {
      value: "material-dark",
      name: "Material Dark",
    },
  ];

  currentTheme = "default";

  userMenu = [{ title: $localize`:@@logout:登出` }];

  public constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private rippleService: RippleService,
    private authService: AuthService,
    private poleService: PoleService,
    private translateService: TranslateService
  ) {
    this.materialTheme$ = this.themeService.onThemeChange().pipe(
      map((theme) => {
        const themeName: string = theme?.name || "";
        return themeName.startsWith("material");
      })
    );
    this.menuClick$ = menuService
      .onItemClick()
      .pipe(filter((event) => event.item.title === $localize`:@@logout:登出`))
      .subscribe(() => {
        if (confirm($localize`:@@confirmLogout:請確認是否要登出？`)) {
          this.authService.logout();
        }
      });
  }

  ngOnInit() {
    this.poleService.startSubPoles();
    this.checkAccess();
    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService
      .onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (isLessThanXl: boolean) => (this.userPictureOnly = isLessThanXl)
      );

    this.themeService
      .onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$)
      )
      .subscribe((themeName) => {
        this.currentTheme = themeName;
        this.rippleService.toggle(themeName?.startsWith("material"));
      });
    setTimeout(
      () =>
      (this.clockInterval$ = interval(1000).subscribe(
        () => (this.date = new Date())
      )),
      1000 - new Date().getMilliseconds()
    );
  }

  ngOnDestroy() {
    this.poleService.stopSubPoles();
    this.destroy$.next();
    this.destroy$.complete();
    if (this.clockInterval$) {
      this.clockInterval$.unsubscribe();
    }
    if (this.menuClick$) {
      this.menuClick$.unsubscribe();
    }
  }

  checkAccess(): void {
    let access = sessionStorage.getItem("AccessType");
    if (access && access === "manager" && !this.authService.isManager()) {
      this.accessType = "user";
    } else {
      this.accessType = access;
    }
  }

  changeLang(): void {
    this.translateService.changeLanguage(this.currentLang);
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, "menu-sidebar");
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  toggleFullScreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}
