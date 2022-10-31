import { AuthService } from './../../shared/service/auth/auth.service';
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import * as $ from "jquery";
import { SETTINGS } from "../../shared/const/system-config";

@Component({
  selector: "ngx-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  globalSettings = SETTINGS;

  login$: Subscription;
  accessTypes: Array<string> = [
    $localize`:@@admin:系統管理者`,
    $localize`:@@manager:管理者`,
  ];
  accessType: string = $localize`:@@manager:管理者`;
  submitted: boolean;
  user: FormGroup;

  constructor(protected router: Router, private formBuilder: FormBuilder, private authService: AuthService,) {
    this.user = this.formBuilder.group({
      username: ["", Validators.required],
      password: [
        "",
        [
          Validators.required,
          Validators.minLength(this.globalSettings.minLength),
        ],
      ],
    });
  }

  get username() {
    return this.user.get("username");
  }
  get password() {
    return this.user.get("password");
  }

  ngOnInit(): void {
    sessionStorage.clear();
  }




  login(): void {
    $.ajax({
      method: "GET",
      url: "/cgi-center/realm",
      cache: false,
      beforeSend: () => {
        this.submitted = true;
      },
      success: (res: string) => {
        // Login Request Start
        if (this.accessType === $localize`:@@manager:管理者`) {
          $.ajax({
            method: "GET",
            url: "/cgi-center/manager-manager/default",
            cache: false,
            username: this.username.value,
            password: this.password.value,
            success: () => {
              sessionStorage.setItem("AccessRealm", res);
              sessionStorage.setItem("AccessType", "manager");
              sessionStorage.setItem("AccessUser", this.username.value);
              alert($localize`:@@loginSuccess:登入成功！`);
              this.router.navigateByUrl("/");
            },
            error: () => {
              alert(
                $localize`:@@loginFailure:登入失敗，請確認您的帳號及密碼。`
              );
              this.submitted = false;
            },
          });
        } else if (this.accessType === $localize`:@@admin:系統管理者`) {
          $.ajax({
            method: "GET",
            url: "/cgi-center/admin-admin",
            cache: false,
            username: this.username.value,
            password: this.password.value,
            success: () => {
              sessionStorage.setItem("AccessRealm", res);
              sessionStorage.setItem("AccessType", "admin");
              sessionStorage.setItem("AccessUser", this.username.value);
              alert($localize`:@@loginSuccess:登入成功！`);
              this.router.navigateByUrl("/pages/sysconfig");
            },
            error: () => {
              alert(
                $localize`:@@loginFailure:登入失敗，請確認您的帳號及密碼。`
              );
              this.submitted = false;
            },
          });
        } else {
          alert($localize`:@@accessNotSelected:請選擇登入身分`);
        }
        // Login Request End
      },
      error: () => {
        alert($localize`:@@loginError:登入異常！`);
        this.submitted = false;
      },
    });
  }
}
