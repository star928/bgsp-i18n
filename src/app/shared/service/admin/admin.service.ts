import { FormGroup } from "@angular/forms";
import { Domain } from "./../../model/domain.model";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { Account } from "../../model/account.model";
import { MD5 } from "crypto-js";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getAccountList(): Observable<Array<Account>> {
    return this.http.get<Array<Account>>("/cgi-center/manager");
  }

  saveAccount(account: FormGroup, type: string): Observable<any> {
    if (type === "新增") {
      account.value.passwd_hash = MD5(
        `${account.value.id}:${sessionStorage.getItem("AccessRealm")}:${
          account.value.passwd_hash
        }`
      ).toString();
      return this.http.post<any>("/cgi-center/admin-manager", account.value);
    } else if (type === "修改") {
      if (account.value.passwd_hash) {
        account.value.passwd_hash = MD5(
          `${account.value.id}:${sessionStorage.getItem("AccessRealm")}:${
            account.value.passwd_hash
          }`
        ).toString();
      }
      return this.http.put<any>("/cgi-center/admin-manager", account.value);
    }
  }

  deleteAccount(accountId: string): Observable<any> {
    let data = { id: accountId };
    return this.http.request("delete", "/cgi-center/admin-manager", {
      body: data,
    });
  }

  getDomainList(): Observable<Array<Domain>> {
    return this.http.get<Array<Domain>>("/cgi-center/domain");
  }
  saveDomainSetting(domain: Domain): Observable<any> {
    return this.http.put<any>("/cgi-center/admin-domain", domain);
  }
}
