import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { MD5 } from "crypto-js";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  isManager(): boolean {
    let user = sessionStorage.getItem("AccessUser");
    if (user && user.startsWith('sysuser')) {
      return false;
    } else {
      return true;
    }
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigateByUrl("/auth/login");
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>("/cgi-center/manager-manager/default");
  }

  modifyUserPassword(user: FormGroup, accessType: string): Observable<any> {
    user.value.passwd_hash = MD5(
      `${user.value.id}:${sessionStorage.getItem("AccessRealm")}:${user.value.passwd_hash
      }`
    ).toString();
    if (accessType === "manager") {
      return this.http.put<any>("/cgi-center/manager-manager", user.value);
    } else if (accessType === "admin") {
      return this.http.put<any>("/cgi-center/admin-admin", user.value);
    }
  }

  modifyUserCommunication(communication: FormGroup): Observable<any> {
    return this.http.put<any>(
      "/cgi-center/manager-manager",
      communication.value
    );
  }
}
