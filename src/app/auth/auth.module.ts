import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { NbAuthModule } from '@nebular/auth';
import { NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbInputModule, NbLayoutModule, NbSelectModule } from '@nebular/theme';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';


@NgModule({
  declarations: [
    LoginComponent,
    AuthComponent,
    LogoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NbAlertModule,
    NbInputModule,
    NbButtonModule,
    MatSelectModule,
    NbSelectModule,
    NbCheckboxModule,
    NbAuthModule,
    NbLayoutModule,
    NbCardModule,
    ReactiveFormsModule,

  ]
})
export class AuthModule { }
