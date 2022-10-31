import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbInputModule, NbListModule, NbSelectModule } from '@nebular/theme';
import { SysconfigComponent } from './sysconfig.component';


@NgModule({
  declarations: [
    SysconfigComponent
  ],
  imports: [
    CommonModule,
    NbButtonModule,
    NbCardModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbListModule,
  ]
})
export class SysconfigModule { }
