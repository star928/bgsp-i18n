import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbDatepickerModule, NbDateTimePickerComponent, NbSelectModule, NbTabsetModule, NbTimepickerModule, NbInputModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { EventLogComponent } from './event-log/event-log.component';
import { HistoryComponent } from './history.component';
import { PlayerLogComponent } from './player-log/player-log.component';
import { AlarmLogComponent } from './alarm-log/alarm-log.component';


@NgModule({
  declarations: [
    HistoryComponent,
    EventLogComponent,
    PlayerLogComponent,
    AlarmLogComponent
  ],
  imports: [
    CommonModule,
    NbCardModule,
    NbTabsetModule,
    Ng2SmartTableModule,
    NbSelectModule,
    NbButtonModule,
    NbDatepickerModule,
    NbTimepickerModule,
    NbInputModule
  ]
})
export class HistoryModule { }
