import { CommonModule } from "@angular/common";
import {
  LOCALE_ID,
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from "@angular/core";
import { NbAuthModule } from "@nebular/auth";
import { NbRoleProvider, NbSecurityModule } from "@nebular/security";
import { of as observableOf } from "rxjs";
import { AuthModule } from "./../auth/auth.module";
import { throwIfAlreadyLoaded } from "./module-import-guard";
import { AnalyticsService, LayoutService, StateService } from "./utils";

export class NbSimpleRoleProvider extends NbRoleProvider {
  getRole() {
    return observableOf("guest");
  }
}

export const NB_CORE_PROVIDERS = [
  ...NbAuthModule.forRoot().providers,
  NbSecurityModule.forRoot({
    accessControl: {
      guest: {
        view: "*",
      },
      user: {
        parent: "guest",
        create: "*",
        edit: "*",
        remove: "*",
      },
    },
  }).providers,
  {
    provide: NbRoleProvider,
    useClass: NbSimpleRoleProvider,
  },
  AnalyticsService,
  LayoutService,
  StateService,
];

@NgModule({
  imports: [CommonModule, AuthModule],
  exports: [NbAuthModule, AuthModule],
  declarations: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, "CoreModule");
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [...NB_CORE_PROVIDERS],
    };
  }
}
