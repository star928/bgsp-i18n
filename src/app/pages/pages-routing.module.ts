import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DetailComponent } from "./dashboard/detail/detail.component";
import { DataComponent } from "./data/data.component";
import { DigitalSignageComponent } from "./digital-signage/digital-signage.component";
import { HistoryComponent } from "./history/history.component";
import { ManagerComponent } from "./manager/manager.component";
import { NotFoundComponent } from "./miscellaneous/not-found/not-found.component";
import { PagesComponent } from "./pages.component";
import { PoleMgmtComponent } from "./pole-mgmt/pole-mgmt.component";
import { ReportsComponent } from "./reports/reports.component";
import { SysconfigComponent } from "./sysconfig/sysconfig.component";

const routes: Routes = [
  {
    path: "",
    component: PagesComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
      },
      {
        path: "data",
        component: DataComponent,
      },
      {
        path: "dashboard/detail/:id",
        component: DetailComponent,
      },
      {
        path: "reports",
        component: ReportsComponent,
      },
      {
        path: "sysconfig",
        component: SysconfigComponent,
      },
      {
        path: "acmanage",
        component: ManagerComponent,
      },
      {
        path: "pole-mgmt",
        component: PoleMgmtComponent,
      },
      {
        path: "digital-signage",
        component: DigitalSignageComponent,
      },
      {
        path: "history",
        component: HistoryComponent,
      },
      {
        path: "miscellaneous",
        loadChildren: () =>
          import("./miscellaneous/miscellaneous.module").then(
            (m) => m.MiscellaneousModule
          ),
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "**",
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
