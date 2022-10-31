import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../shared/service/auth/auth.service";
import { SETTINGS } from "./../../shared/const/system-config";

@Component({
  selector: "ngx-sysconfig",
  templateUrl: "./sysconfig.component.html",
  styleUrls: ["./sysconfig.component.scss"],
})
export class SysconfigComponent implements OnInit {
  GOLBAL_SETTINGS = SETTINGS;

  accessType: string;
  user: FormGroup;
  communication: FormGroup;
  confirmPasswd: FormControl;
  submitted: boolean = false;

  // image
  image_folder_path: string = "../../../assets/images/Baogao_Tab_Image/";
  preview_image: string = this.image_folder_path + "h00006.png";

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.accessType = sessionStorage.getItem("AccessType");
    this.user = this.formBuilder.group({
      id: [sessionStorage.getItem("AccessUser")],
      passwd_hash: [
        "",
        [Validators.required, Validators.minLength(SETTINGS.minLength)],
      ],
    });
    this.communication = this.formBuilder.group({
      id: [sessionStorage.getItem("AccessUser")],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", [Validators.required]],
    });
    this.confirmPasswd = new FormControl("", [Validators.required]);
  }

  get id() {
    return this.user.get("id");
  }
  get passwd_hash() {
    return this.user.get("passwd_hash");
  }

  ngOnInit(): void {
    if (this.accessType === "manager") {
      this.authService.getCurrentUser().subscribe((data) => {
        this.communication.controls.email.setValue(data.email);
        this.communication.controls.phone.setValue(data.phone);
      });
    } else if (this.accessType === "admin") {
    }
  }

  // 修改密碼
  modifyUserPassword(): void {
    this.authService.modifyUserPassword(this.user, this.accessType).subscribe(
      () => {
        alert("密碼修改成功，請重新登入");
        this.authService.logout();
      },
      () => alert("密碼修改失敗")
    );
  }

  // 修改聯絡資料
  modifyUserCommunication(): void {
    this.authService.modifyUserCommunication(this.communication).subscribe(
      () => alert("聯絡資料修改成功"),
      () => alert("聯絡資料修改失敗")
    );
  }
}
