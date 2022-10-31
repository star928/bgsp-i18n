import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { NbAuthComponent, NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent extends NbAuthComponent {

  constructor(
    protected auth: NbAuthService,
    protected location: Location,
  ) {
    super(auth, location);
  }

}
