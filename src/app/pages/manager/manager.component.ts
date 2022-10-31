import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Domain } from "./../../shared/model/domain.model";
import { AdminService } from "./../../shared/service/admin/admin.service";
import { Component, OnInit } from "@angular/core";
import { Account } from "../../shared/model/account.model";
import { map } from "rxjs/operators";
import { SETTINGS } from "../../shared/const/system-config";

@Component({
  selector: "ngx-manager",
  templateUrl: "./manager.component.html",
  styleUrls: ["./manager.component.scss"],
})
export class ManagerComponent implements OnInit {
  globalSettings = SETTINGS;
  accountList: Array<Account>;
  accountForm: FormGroup;
  account: Account;
  domain: Domain;
  type = $localize`:@@create:新增`;
  submitted = false;
  confirmPasswd: FormControl;

  constructor(
    private adminService: AdminService,
    private formBuilder: FormBuilder
  ) {}

  get id() {
    return this.accountForm.get("id");
  }
  get passwd_hash() {
    return this.accountForm.get("passwd_hash");
  }

  ngOnInit(): void {
    this.getAccountList();
    this.getDomain();
    this.createForm();
  }

  createForm(): void {
    this.accountForm = this.formBuilder.group({
      id: ["", Validators.required],
      passwd_hash: [
        "",
        [
          Validators.required,
          Validators.minLength(this.globalSettings.minLength),
        ],
      ],
      enable: [false],
    });
    this.confirmPasswd = new FormControl("");
  }

  getAccountList(): void {
    this.adminService
      .getAccountList()
      .subscribe((res) => (this.accountList = res));
  }
  getDomain(): void {
    this.adminService
      .getDomainList()
      .pipe(
        map((domainList) =>
          domainList.find((domain) => domain.id === "default")
        )
      )
      .subscribe((res) => (this.domain = res));
  }

  onAccountSelected(account: Account): void {
    this.accountForm = this.formBuilder.group({
      id: [account.id, Validators.required],
      passwd_hash: [""],
      enable: [account.enable],
    });
    this.type = $localize`:@@modify:修改`;
  }

  cleanInput(): void {
    this.account = null;
    this.type = $localize`:@@create:新增`;
    this.createForm();
  }

  passwdChecked(): boolean {
    let passwd = this.accountForm.value.passwd_hash;
    if (passwd || this.confirmPasswd) {
      if (passwd === this.confirmPasswd) {
        return true;
      } else {
        return false;
      }
    }
  }

  saveAccount(): void {
    if (
      confirm(
        $localize`:@@confirmSaveAccount:確定要${this.type} ${this.accountForm.value.id} 嗎？`
      )
    ) {
      this.submitted = true;
      this.adminService.saveAccount(this.accountForm, this.type).subscribe(
        () => {
          alert(
            $localize`:@@saveAccountSuccess:帳號 ${this.accountForm.value.id} ${this.type}成功！`
          );
          this.getAccountList();
          this.cleanInput();
          this.submitted = false;
        },
        () => {
          alert(
            $localize`:@@saveAccountFailure:帳號 ${this.accountForm.value.id} ${this.type}失敗！`
          );
          this.submitted = false;
        }
      );
    }
  }

  deleteAccount(): void {
    if (
      confirm(
        $localize`:@@confirmDeleteAccount:確定要刪除 ${this.accountForm.value.id} 嗎？`
      )
    ) {
      this.submitted = true;
      this.adminService.deleteAccount(this.accountForm.value.id).subscribe(
        () => {
          alert(
            $localize`:@@deleteAccountSuccess:${this.accountForm.value.id} 刪除成功！`
          );
          this.getAccountList();
          this.getDomain();
          this.cleanInput();
          this.submitted = false;
        },
        () => {
          alert(
            $localize`:@@deleteAccountFailure:${this.accountForm.value.id} 刪除失敗！`
          );
          this.submitted = false;
        }
      );
    }
  }

  saveDomainSetting(): void {
    if (
      confirm(
        $localize`:@@confirmModifyDomainSetting:確認修改 ${this.domain.id} 的設定嗎？`
      )
    ) {
      this.submitted = true;
      this.adminService.saveDomainSetting(this.domain).subscribe(
        () => {
          alert(
            $localize`:@@modifyDomainSettingSuccess:${this.domain.id} 設定修改成功！`
          );
          this.getDomain();
          this.submitted = false;
        },
        () => {
          alert(
            $localize`:@@modifyDomainSettingFailure:${this.domain.id} 設定修改失敗！`
          );
          this.submitted = false;
        }
      );
    }
  }

  addManager(): void {
    if (!this.domain.manager.find((manager) => manager === this.account.id)) {
      this.domain.manager.push(this.account.id);
    }
  }

  removeManager(): void {
    let managerList = this.domain.manager;
    if (managerList.find((manager) => manager === this.account.id)) {
      managerList.splice(
        managerList.findIndex((manager) => manager === this.account.id),
        1
      );
    }
  }
}
