import { Injector, NgModule } from "@angular/core";
import { createCustomElement } from "@angular/elements";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { RouterModule } from "@angular/router";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbInputModule,
  NbListModule,
  NbProgressBarModule,
  NbRadioModule,
  NbSelectModule,
  NbTabsetModule,
  NbTreeGridModule,
  NbUserModule,
} from "@nebular/theme";
import { Ng2SmartTableModule } from "ng2-smart-table";
import { NgxEchartsModule } from "ngx-echarts";
import { ThemeModule } from "../../@theme/theme.module";
import { DashboardComponent } from "./dashboard.component";
import { DetailComponent } from "./detail/detail.component";
import { PolePopupComponent } from "./pole-popup/pole-popup.component";

@NgModule({
  imports: [
    RouterModule,
    FormsModule,
    ThemeModule,
    NbCardModule,
    NbUserModule,
    NbButtonModule,
    NbTabsetModule,
    NbActionsModule,
    NbRadioModule,
    NbSelectModule,
    NbListModule,
    NbIconModule,
    NbButtonModule,
    NgxEchartsModule,
    MatSidenavModule,
    NbTreeGridModule,
    NbInputModule,
    Ng2SmartTableModule,
    LeafletModule,
    MatIconModule,
    NbProgressBarModule,
  ],
  exports: [DetailComponent],
  declarations: [DashboardComponent, DetailComponent, PolePopupComponent],
  entryComponents: [PolePopupComponent],
})
export class DashboardModule {
  constructor(private injector: Injector) {
    const PopupElement = createCustomElement(PolePopupComponent, { injector });
    customElements.define("popup-element", PopupElement);
  }
}
