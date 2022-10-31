import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BehaviorSubject, interval, Observable, Subscription } from "rxjs";
import { map, mergeMap, tap } from "rxjs/operators";
import { PoleLogRequest } from "../../model/pole-log-request.model";
import { PoleData, PoleLog, PoleManageData } from "../../model/pole.model";

@Injectable({
  providedIn: "root",
})
export class PoleService {
  polesData$ = new BehaviorSubject<Array<PoleData>>([]);
  polesInterval$: Subscription;
  isSubscribed = false;

  constructor(private http: HttpClient) { }

  startSubPoles(): void {
    this.getPolesData().subscribe();
    this.polesInterval$ = interval(1 * 60 * 1000)
      .pipe(mergeMap(() => this.getPolesData()))
      .subscribe();
  }

  stopSubPoles(): void {
    if (this.isSubscribed) {
      this.polesData$.complete();
      this.isSubscribed = false;
    }
    if (this.polesInterval$) {
      this.polesInterval$.unsubscribe();
    }
  }

  createPole(poleData: FormGroup): Observable<string> {
    return this.http.post<string>(
      "/cgi-center/manager-pole/default",
      poleData.value
    );
  }

  deletePole(poleUUID: string): Observable<any> {
    let data = { uuid: poleUUID };
    return this.http.request("delete", "/cgi-center/manager-pole/default", {
      body: data,
    });
  }

  updatePole(poleData: FormGroup): Observable<any> {
    return this.http.put<any>(
      "/cgi-center/manager-pole/default",
      poleData.value
    );
  }

  managePole(poleManageData: PoleManageData): Observable<any> {
    return this.http.put<any>(
      "/cgi-center/manager-pole/default",
      poleManageData
    );
  }

  getPolesData(): Observable<Array<PoleData>> {
    return this.http
      .get<Array<PoleData>>("/cgi-center/pole/default")
      .pipe(tap((res) => this.polesData$.next(res)));
  }

  getManagePolesData(): Observable<Array<PoleManageData>> {
    return this.http.get<Array<PoleManageData>>(
      "/cgi-center/manager-pole/default"
    );
  }

  getPoleData(poleId: string): Observable<PoleData> {
    return this.http
      .get<Array<PoleData>>("/cgi-center/pole/default")
      .pipe(map((data) => data.find((pole) => pole.number === poleId)));
  }

  getPoleLogsData(poleLogRequest: PoleLogRequest): Observable<Array<PoleLog>> {
    return this.http.post<Array<PoleLog>>(
      "/cgi-center/pole-log/default",
      poleLogRequest
    );
  }

  getPoleLogs(
    uuid: string,
    type: string,
    record?: string,
    time_start?: string,
    time_end?: string
  ): Observable<Array<PoleLog>> {
    return this.http.post<Array<PoleLog>>("/cgi-center/pole-log/default", {
      uuid: uuid,
      type: type,
      time_start: time_start,
      time_end: time_end,
      record: record,
    });
  }
}
