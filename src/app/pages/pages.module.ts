import { NgModule } from "@angular/core";
import { NbMenuModule, NbTimepickerModule } from "@nebular/theme";
import { ThemeModule } from "../@theme/theme.module";
import { AlarmDialogModule } from "./alarm-dialog/alarm-dialog.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DataModule } from "./data/data.module";
import { DigitalSignageModule } from "./digital-signage/digital-signage.module";
import { HistoryModule } from "./history/history.module";
import { ManagerModule } from "./manager/manager.module";
import { MiscellaneousModule } from "./miscellaneous/miscellaneous.module";
import { PagesRoutingModule } from "./pages-routing.module";
import { PagesComponent } from "./pages.component";
import { PoleMgmtModule } from "./pole-mgmt/pole-mgmt.module";
import { ReportsModule } from "./reports/reports.module";
import { SysconfigModule } from "./sysconfig/sysconfig.module";

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    DashboardModule,
    MiscellaneousModule,
    NbTimepickerModule.forRoot(),
    PoleMgmtModule,
    DigitalSignageModule,
    HistoryModule,
    SysconfigModule,
    ManagerModule,
    ReportsModule,
    DataModule,
    AlarmDialogModule,
  ],
  declarations: [PagesComponent],
})
export class PagesModule {}
