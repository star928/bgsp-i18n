import { formatDate } from "@angular/common";
import { Inject, Injectable, LOCALE_ID } from "@angular/core";
import { SETTINGS } from "../../const/system-config";
import { PoleLog } from "../../model/pole.model";

@Injectable({
  providedIn: "root",
})
export class DataUtilsService {
  scopesTime = {}; // 毫秒
  date = $localize`:@@date:日期`;
  constructor(@Inject(LOCALE_ID) private locale: string) {
    this.scopesTime[$localize`:@@week:週`] = 604800000;
    this.scopesTime[$localize`:@@day:日`] = 86400000;
    this.scopesTime[$localize`:@@hour:小時`] = 3600000;
  }

  dateFilled(
    startTime: string,
    endTime: string,
    scope: string
  ): Array<Array<string>> {
    let dateTemplate = [];
    let startDate = new Date(startTime).getTime();
    if (scope === $localize`:@@hour:小時` && !startTime.endsWith("00:00")) {
      startDate += this.scopesTime[$localize`:@@hour:小時`];
    } else if (
      scope !== $localize`:@@month:月` &&
      !startTime.endsWith("00:00:00")
    ) {
      startDate += this.scopesTime[$localize`:@@day:日`];
    }
    let endDate = Math.min(new Date().getTime(), new Date(endTime).getTime());
    if (scope === $localize`:@@week:週`) {
      let weekDay = new Date(startDate).getDay();
      if (weekDay !== 1) {
        weekDay > 1
          ? (startDate +=
            (7 - weekDay + 1) * this.scopesTime[$localize`:@@day:日`])
          : (startDate +=
            (1 - weekDay) * this.scopesTime[$localize`:@@day:日`]);
      }
    }
    for (
      startDate;
      startDate < endDate;
      startDate = this.addDate(startDate, scope)
    ) {
      let dateString = "";
      if ($localize`:@@hour:小時`) {
        dateString +=
          formatDate(
            new Date(startDate).getTime(),
            "yyyy-MM-dd HH",
            this.locale
          ) + ":00:00";
      } else {
        dateString +=
          formatDate(new Date(startDate).getTime(), "yyyy-MM-dd", this.locale) +
          " 00:00:00";
      }
      dateTemplate.push([dateString, SETTINGS.noData]);
    }
    return dateTemplate;
  }

  fillData(
    poleLogsData: PoleLog,
    startTime: string,
    endTime: string,
    scope: string
  ): PoleLog {
    poleLogsData.log.forEach((logList) => {
      let dateTemplate = this.dateFilled(startTime, endTime, scope);
      logList.array.forEach((log) => {
        dateTemplate.find((date) => date[0] === log[0])[1] = log[1];
      });
      logList.array = dateTemplate;
    });
    return poleLogsData;
  }

  addDate(date: number, scope: string): number {
    if (scope === $localize`:@@month:月`) {
      return new Date(date).setMonth(new Date(date).getMonth() + 1);
    } else {
      return date + this.scopesTime[scope];
    }
  }

  mergeLogData(poleLogsData: PoleLog, recordName: Object): Array<Object> {
    let mergedData = [];
    // 若第一筆沒有資料，後續即便有資料，欄位也不會顯示出來，所以需先手動補上 SETTINGS.noData
    poleLogsData.log[0].array.forEach((log) => {
      let dateString = log[0];
      let tempData = { 日期: dateString };
      poleLogsData.log.forEach((logData) => {
        let dataArray = logData.array.find(
          (data) => data && data[0] === dateString
        );
        tempData[recordName[logData.record]] = dataArray
          ? dataArray[1]
          : SETTINGS.noData;
      });
      mergedData.push(tempData);
    });
    return mergedData;
  }
}
