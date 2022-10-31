import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmDialogComponent } from './alarm-dialog.component';
import { NbCardModule, NbButtonModule, NbIconModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';



@NgModule({
  declarations: [
    AlarmDialogComponent
  ],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    Ng2SmartTableModule,
    NbIconModule
  ]
})
export class AlarmDialogModule { }
