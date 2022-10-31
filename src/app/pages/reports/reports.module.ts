import { ThemeModule } from '../../@theme/theme.module';
import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbDatepickerModule, NbSelectModule, NbTableModule, NbTabsetModule, NbInputModule } from '@nebular/theme';
import { NgxEchartsModule } from 'ngx-echarts';
import { ReportsComponent } from './reports.component';
import { EnvSensorDataComponent } from './env-sensor-data/env-sensor-data.component';
import { SaveEnergyDataComponent } from './save-energy-data/save-energy-data.component';
import { SmartLightDataComponent } from './smart-light-data/smart-light-data.component';
import { HolderDataComponent } from './holder-data/holder-data.component';



@NgModule({
  declarations: [
    ReportsComponent,
    SmartLightDataComponent,
    EnvSensorDataComponent,
    SaveEnergyDataComponent,
    HolderDataComponent
  ],
  imports: [
    ThemeModule,
    NbTableModule,
    NbSelectModule,
    NbCardModule,
    NgxEchartsModule,
    NbButtonModule,
    NbDatepickerModule,
    NbTabsetModule,
    NbInputModule
  ],
})
export class ReportsModule { }
