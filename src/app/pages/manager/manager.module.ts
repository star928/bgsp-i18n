import {
  NbInputModule,
  NbSelectModule,
  NbCheckboxModule,
  NbCardModule,
  NbListModule,
  NbButtonModule,
} from "@nebular/theme";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ManagerComponent } from "./manager.component";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [ManagerComponent],
  imports: [
    CommonModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbButtonModule,
    NbCardModule,
    NbListModule,
    ReactiveFormsModule,
  ],
})
export class ManagerModule {}
