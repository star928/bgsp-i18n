import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbProgressBarModule,
} from "@nebular/theme";
import { NgxEchartsModule } from "ngx-echarts";
import { DataComponent } from "./data.component";
import { LineChartLiteComponent } from "./line-chart-lite/line-chart-lite.component";

@NgModule({
  declarations: [DataComponent, LineChartLiteComponent],
  imports: [
    CommonModule,
    NbCardModule,
    NbIconModule,
    NbButtonModule,
    NgxEchartsModule,
    NbProgressBarModule,
  ],
})
export class DataModule {}
