import { NbCardModule, NbButtonModule, NbTabsetModule, NbTimepickerModule, NbSelectModule, NbIconModule, NbCheckboxModule, NbInputModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { SmartLightComponent } from './smart-light/smart-light.component';
import { SaveEnergyComponent } from './save-energy/save-energy.component';
import { PoleBasicComponent } from './pole-basic/pole-basic.component';
import { PoleMgmtComponent } from './pole-mgmt.component';
import { EnvSensorComponent } from './env-sensor/env-sensor.component';
import { SavePoleComponent } from './pole-basic/save-pole/save-pole.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LightSettingsComponent } from './smart-light/light-settings/light-settings.component';
import { HolderComponent } from './holder/holder.component';

@NgModule({
  declarations: [
    PoleMgmtComponent,
    PoleBasicComponent,
    SmartLightComponent,
    EnvSensorComponent,
    SaveEnergyComponent,
    SavePoleComponent,
    LightSettingsComponent,
    HolderComponent,
  ],
  imports: [
    Ng2SmartTableModule,
    NbCardModule,
    NbButtonModule,
    NbTabsetModule,
    NbTimepickerModule,
    ThemeModule,
    NbSelectModule,
    NbEvaIconsModule,
    NbIconModule,
    NbCheckboxModule,
    NbInputModule,
    ReactiveFormsModule,
  ]
})
export class PoleMgmtModule { }
