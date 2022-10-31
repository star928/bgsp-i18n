import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import {
  NbAccordionModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbListModule,
  NbProgressBarModule,
  NbRadioModule,
  NbSelectModule,
  NbTabsetModule,
  NbTooltipModule,
} from "@nebular/theme";
import { ThemeModule } from "../../@theme/theme.module";
import { DigitalSignageComponent } from "./digital-signage.component";
import { SignagePreviewDialogComponent } from "./signage-preview_dialog/signage-preview-dialog.component";
import { SignageSettingComponent } from "./signage-setting/signage-setting.component";

@NgModule({
  declarations: [
    DigitalSignageComponent,
    SignageSettingComponent,
    SignagePreviewDialogComponent,
  ],
  imports: [
    ThemeModule,
    NbCardModule,
    NbAccordionModule,
    NbListModule,
    NbButtonModule,
    NbIconModule,
    NbEvaIconsModule,
    NbSelectModule,
    NbTabsetModule,
    NbRadioModule,
    ReactiveFormsModule,
    NbTooltipModule,
    NbProgressBarModule,
  ],
})
export class DigitalSignageModule {}
