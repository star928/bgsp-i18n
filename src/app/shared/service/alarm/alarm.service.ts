import { SETTINGS } from "./../../const/system-config";
import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { PoleData, PoleLog } from "../../model/pole.model";
import { PoleService } from "../pole/pole.service";
import {
  ALARM_MAXIMUM,
  ALARM_MINIMUM,
  ALARM_RECORD,
  ALARM_STANDARD,
  ENVIRONMENT_ALARM,
  HOLDER_ALARM,
  LIGHT_ALARM,
  PLAYER_ALARM,
  SOLAR_ALARM,
  TYPE,
} from "./../../const/alarm-range";

@Injectable({
  providedIn: "root",
})
export class AlarmService {
  alarmInterval$: Subscription;
  alarmList$ = new BehaviorSubject<Array<Object>>([]);
  poleData$: Subscription;
  constructor(
    private http: HttpClient,
    private poleService: PoleService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.poleData$ = this.poleService.polesData$.subscribe((res) =>
      this.alarmList$.next(this.getPolesAlarm(res))
    );
  }

  getPolesAlarm(polesData: Array<PoleData>): Array<Object> {
    let alarmList = [];
    polesData.forEach((poleData) => {
      alarmList = [...alarmList, ...this.deviceFilter(poleData)];
    });
    return alarmList.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // 檢查智慧照明紀錄時間是否是供電期間
  isLegalLightTime(recordTime: string): boolean {
    let today = formatDate(new Date(), "YYYY-MM-dd", this.locale) + " ";
    let record = new Date(today + recordTime.split(" ")[1]);
    let start = new Date(today + SETTINGS.lightStartTime);
    let end = new Date(today + SETTINGS.lightEndTime);
    if (start > end) {
      return record > start || record < end;
    } else {
      return record > start && record < end;
    }
  }

  // 檢查智慧照明紀錄時間是否為前一天晚上或當天之資料
  isLatestRecord(recordTime: string): boolean {
    let today = new Date();
    let record = new Date(recordTime);
    return (
      today.getDate() - 1 === record.getDate() ||
      today.getDate() === record.getDate()
    );
  }

  // Latest Alarm Start
  deviceFilter(poleData: PoleData): Array<Object> {
    let alarmList = [];
    Object.keys(TYPE).forEach((type) => {
      alarmList = [...alarmList, ...this.alarmFilter(poleData, type)];
    });
    return alarmList;
  }

  alarmFilter(poleData: PoleData, deviceType: string): Array<Object> {
    let stardandList: Object;
    let alarms = [];
    if (deviceType === "light") {
      stardandList = LIGHT_ALARM;
    } else if (deviceType === "environment") {
      stardandList = ENVIRONMENT_ALARM;
    } else if (deviceType === "player") {
      stardandList = PLAYER_ALARM;
    } else if (deviceType === "solar") {
      stardandList = SOLAR_ALARM;
    } else if (deviceType === "holder") {
      stardandList = HOLDER_ALARM;
    }
    Object.keys(stardandList).forEach((alarm) => {
      let telemerty = poleData[alarm];
      let standard = stardandList[alarm]["value"];
      let unit = stardandList[alarm]["unit"];
      let filterType = stardandList[alarm]["type"];
      let recordDate = poleData[deviceType + "_record_time"];

      // 排除智慧照明非供電期間之值
      if (
        (deviceType === "light" && this.isLegalLightTime(recordDate)) ||
        deviceType !== "light"
      ) {
        if (filterType === "range10") {
          // 落於標準值外 ( +- 10% )
          if (Number(telemerty) > standard * 1.1) {
            alarms.push({
              id: poleData.number,
              date: recordDate,
              type: TYPE[deviceType],
              status:
                // ALARM_RECORD[alarm] + `過高 ( > ${standard * 1.1} ${unit} )`,
                ALARM_RECORD[alarm] + $localize`:@@higher:過高`,
            });
          } else if (Number(telemerty) < standard * 0.9) {
            alarms.push({
              id: poleData.number,
              date: poleData[deviceType + "_record_time"],
              type: TYPE[deviceType],
              status:
                // ALARM_RECORD[alarm] + `過低 ( < ${standard * 0.9} ${unit} )`,
                ALARM_RECORD[alarm] + $localize`:@@lower:過低`,
            });
          }
        } else if (filterType === "range5") {
          // 落於標準值外 ( +- 5% )
          if (Number(telemerty) > Math.round((standard * 1.05) / 10) * 10) {
            alarms.push({
              id: poleData.number,
              date: recordDate,
              type: TYPE[deviceType],
              status:
                // ALARM_RECORD[alarm] + `過高 ( > ${Math.round((standard * 1.05) / 10) * 10} ${unit} )`,
                ALARM_RECORD[alarm] + $localize`:@@higher:過高`,
            });
          } else if (
            Number(telemerty) <
            Math.round((standard * 0.95) / 10) * 10
          ) {
            alarms.push({
              id: poleData.number,
              date: poleData[deviceType + "_record_time"],
              type: TYPE[deviceType],
              status:
                // ALARM_RECORD[alarm] + `過低 ( < ${Math.round((standard * 0.95) / 10) * 10} ${unit} )`,
                ALARM_RECORD[alarm] + $localize`:@@lower:過低`,
            });
          }
          // 高於最大值
        } else if (filterType === "max") {
          if (Number(telemerty) > standard) {
            alarms.push({
              id: poleData.number,
              date: poleData[deviceType + "_record_time"],
              type: TYPE[deviceType],
              status:
                // ALARM_RECORD[alarm] + `過高 ( > ${standard} ${unit} )`,
                ALARM_RECORD[alarm] + $localize`:@@higher:過高`,
            });
          }
          // 低於最小值
        } else if (filterType === "min") {
          if (Number(telemerty) < standard) {
            alarms.push({
              id: poleData.number,
              date: poleData[deviceType + "_record_time"],
              type: TYPE[deviceType],
              status:
                // ALARM_RECORD[alarm] + `過低 ( < ${standard} ${unit} )`,
                ALARM_RECORD[alarm] + $localize`:@@lower:過低`,
            });
          }
          // 各設備連線狀態
        } else if (filterType === "match") {
          if (alarm.endsWith("show")) {
            if (telemerty === standard) {
              alarms.push({
                id: poleData.number,
                date: poleData[deviceType + "_show_time"],
                type: TYPE[deviceType],
                status: telemerty,
              });
            }
          } else if (alarm.endsWith("connect")) {
            if (telemerty === standard) {
              alarms.push({
                id: poleData.number,
                date: poleData[deviceType + "_connect_time"],
                type: TYPE[deviceType],
                status: telemerty,
              });
            }
            // 箱門狀態
          } else if (alarm === "hd") {
            if (telemerty === "open") {
              alarms.push({
                id: poleData.number,
                date: poleData["hd_time"],
                type: TYPE[deviceType],
                status: ALARM_RECORD[alarm] + telemerty,
              });
            }
          }
        }

        // 若智慧照明最後紀錄時間非昨天
      } else if (deviceType === "light" && !this.isLatestRecord(recordDate)) {
        if (filterType === "match") {
          if (alarm.endsWith("show")) {
            if (telemerty === standard) {
              alarms.push({
                id: poleData.number,
                date: poleData[deviceType + "_show_time"],
                type: TYPE[deviceType],
                status: telemerty,
              });
            }
          }
        }
      }
    });
    return alarms;
  }

  // Latest Alarm End

  // History Alarm Start

  getAlarmData(
    pole: PoleData,
    time_start: string,
    time_end: string
  ): Observable<Array<Object>> {
    return this.http
      .post<Array<PoleLog>>("/cgi-center/pole-log/default", {
        // scope: "hour",
        // record: "show",
        // type: "light",
        uuid: pole.uuid,
        time_start: time_start,
        time_end: time_end,
      })
      .pipe(map((res) => this.transformAlarm(pole.uuid, res)));
  }

  transformAlarm(poleId: string, poleLogs: Array<PoleLog>): Array<Object> {
    let alarm = [];
    poleLogs.forEach((poleLog) =>
      poleLog.log.forEach((log) => {
        if (ALARM_RECORD[log.record]) {
          alarm.push(
            ...this.alarmLogFilter(poleId, log.type, log.record, log.array)
          );
        }
      })
    );
    return alarm.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  alarmLogFilter(
    poleId: string,
    type: string,
    record: string,
    logsData: Array<Array<string>>
  ): Array<string> {
    let alarmLogs = [];
    if (logsData) {
      if (ALARM_STANDARD[record]) {
        // 落於標準值外 ( +- 10% )
        if (ALARM_STANDARD[record]["type"] === "range10") {
          let standard = ALARM_STANDARD[record];
          logsData.forEach((logData) => {
            if (!(type === "light" && !this.isLegalLightTime(logData[0]))) {
              if (Number(logData[1]) > standard["value"] * 1.1) {
                alarmLogs.push({
                  // id: poleId,
                  date: logData[0],
                  type: TYPE[type],
                  status:
                    ALARM_RECORD[record] +
                    // `過高 ( > ${standard["value"] * 1.1} ${standard["unit"]} )`,
                    $localize`:@@higher:過高`,
                });
              } else if (Number(logData[1]) < standard["value"] * 0.9) {
                alarmLogs.push({
                  // id: poleId,
                  date: logData[0],
                  type: TYPE[type],
                  status:
                    ALARM_RECORD[record] +
                    // `過低 ( < ${standard["value"] * 0.9} ${standard["unit"]} )`,
                    $localize`:@@lower:過低`,
                });
              }
            }
          });
          // 落於標準值外 ( +- 5% )
        } else if (ALARM_STANDARD[record]["type"] === "range5") {
          let standard = ALARM_STANDARD[record];
          logsData.forEach((logData) => {
            if (!(type === "light" && !this.isLegalLightTime(logData[0]))) {
              if (
                Number(logData[1]) >
                Math.round((standard["value"] * 1.05) / 10) * 10
              ) {
                alarmLogs.push({
                  // id: poleId,
                  date: logData[0],
                  type: TYPE[type],
                  status:
                    ALARM_RECORD[record] +
                    // `過高 ( > ${
                    //   Math.round((standard["value"] * 1.05) / 10) * 10
                    // } ${standard["unit"]} )`,
                    $localize`:@@higher:過高`,
                });
              } else if (
                Number(logData[1]) <
                Math.round((standard["value"] * 0.95) / 10) * 10
              ) {
                alarmLogs.push({
                  // id: poleId,
                  date: logData[0],
                  type: TYPE[type],
                  status:
                    ALARM_RECORD[record] +
                    // `過低 ( < ${
                    //   Math.round((standard["value"] * 0.95) / 10) * 10
                    // } ${standard["unit"]} )`,
                    $localize`:@@lower:過低`,
                });
              }
            }
          });
          // 高於最大值
        } else if (ALARM_MAXIMUM[record]["type"] === "max") {
          let maximum = ALARM_MAXIMUM[record];
          logsData.forEach((logData) => {
            if (!(type === "light" && !this.isLegalLightTime(logData[0]))) {
              if (Number(logData[1]) > maximum["value"]) {
                alarmLogs.push({
                  // id: poleId,
                  date: logData[0],
                  type: TYPE[type],
                  status:
                    ALARM_RECORD[record] +
                    // `過高 ( > ${maximum["value"]} ${maximum["unit"]} )`,
                    $localize`:@@higher:過高`,
                });
              }
            }
          });
          // 低於最小值
        } else if (ALARM_MAXIMUM[record]["type"] === "min") {
          let minimum = ALARM_MINIMUM[record];
          logsData.forEach((logData) => {
            if (!(type === "light" && !this.isLegalLightTime(logData[0]))) {
              if (Number(logData[1]) < minimum["value"]) {
                alarmLogs.push({
                  // id: poleId,
                  date: logData[0],
                  type: TYPE[type],
                  status:
                    ALARM_RECORD[record] +
                    // `過低 ( < ${minimum["value"]} ${minimum["unit"]} )`,
                    $localize`:@@lower:過低`,
                });
              }
            }
          });
        }
        // 各設備連線狀態
      } else if (record === "show") {
        logsData.forEach((logData) => {
          if (!(type === "light" && !this.isLegalLightTime(logData[0]))) {
            if (logData[1] === "offline") {
              alarmLogs.push({
                // id: poleId,
                date: logData[0],
                type: TYPE[type],
                status: logData[1],
              });
            }
          }
        });
      } else if (record === "connect") {
        logsData.forEach((logData) => {
          if (!(type === "light" && !this.isLegalLightTime(logData[0]))) {
            if (logData[1] === "off") {
              alarmLogs.push({
                // id: poleId,
                date: logData[0],
                type: TYPE[type],
                status: logData[1],
              });
            }
          }
        });
        // 箱門狀態
      } else if (record === "hd") {
        logsData.forEach((logData) => {
          if (logData[1] === "open") {
            alarmLogs.push({
              // id: poleId,
              date: logData[0],
              type: TYPE[type],
              status: ALARM_RECORD[record] + logData[1],
            });
          }
        });
      }
    }
    return alarmLogs;
  }

  // History Alarm End
}
