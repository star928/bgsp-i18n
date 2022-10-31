import { formatDate } from "@angular/common";
import { Component, Inject, LOCALE_ID, OnInit } from "@angular/core";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { PoleData, PoleLog } from "../../shared/model/pole.model";
import { PoleService } from "../../shared/service/pole/pole.service";

@Component({
  selector: "ngx-history",
  templateUrl: "./history.component.html",
  styleUrls: ["./history.component.scss"],
})
export class HistoryComponent implements OnInit {
  eventLog = $localize`:@@eventLog:事件紀錄`;
  alarmLog = $localize`:@@alarmLog:告警紀錄`;
  playerLog = $localize`:@@playLog:播放檔案紀錄`;

  type: Array<string>;
  tabName: string;
  types = {};
  poleData: PoleData;
  polesData: Array<PoleData>;
  poleLogs: Array<PoleLog>;
  poleId: string;
  doc: any;

  // image
  image_folder_path: string = "../../../assets/images/Baogao_Tab_Image/";
  preview_image: string;

  constructor(
    private poleService: PoleService,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.types[this.eventLog] = "";
    this.types[this.alarmLog] = "";
    this.types[this.playerLog] = ["player", "play"];
  }

  ngOnInit(): void {
    this.getPoleData();
  }

  ngOnDestroy(): void {}

  changeTab($event: any) {
    this.type = this.types[$event.tabTitle];
    this.tabName = $event.tabTitle;
  }

  getPoleData(): void {
    this.poleService.getPolesData().subscribe((data) => {
      this.polesData = data;
      this.poleData = data[0];
    });
  }

  exportPDF(poleLogs: Array<PoleLog>): void {
    if (poleLogs && poleLogs.length > 0 && poleLogs[0].log.length > 0) {
      this.doc = new jsPDF();
      this.doc.addFont(
        "../../../assets/fonts/SourceHanSansTC/SourceHanSansTC-VF.ttf",
        "SourceHanSansTC",
        "VF"
      );
      this.doc.setFont("SourceHanSansTC", "VF");
      this.doc.text(this.tabName, 80, 15);
      this.doc.autoTable({
        styles: {
          font: "SourceHanSansTC",
          textColor: [0, 0, 0],
        },
        startY: 20,
        head: [[$localize`:@@eventDate:事件日期`, $localize`:@@status:狀態`]],
        body: [...poleLogs[0].log[0].array],
      });
      this.doc.save(
        this.poleData.number +
          "_" +
          this.tabName +
          "_" +
          formatDate(new Date(), "yyyy-MM-dd", this.locale) +
          ".pdf"
      );
    }
  }

  exportEventPDF(compositeData: Array<any>): void {
    let poleLogs = compositeData[0];
    let deviceName = compositeData[1];
    let recordName = compositeData[2];
    if (poleLogs && poleLogs.length > 0) {
      this.doc = new jsPDF();
      this.doc.addFont(
        "../../../assets/fonts/SourceHanSansTC/SourceHanSansTC-VF.ttf",
        "SourceHanSansTC",
        "VF"
      );
      this.doc.setFont("SourceHanSansTC", "VF");
      this.doc.text(deviceName + " - " + recordName + this.tabName, 70, 15);
      this.doc.autoTable({
        styles: {
          font: "SourceHanSansTC",
          textColor: [0, 0, 0],
        },
        startY: 20,
        head: [[$localize`:@@eventDate:事件日期`, $localize`:@@status:狀態`]],
        body: [...poleLogs],
      });
      this.doc.save(
        this.poleData.number +
          "_" +
          deviceName +
          "_" +
          recordName +
          this.tabName +
          "_" +
          formatDate(new Date(), "yyyy-MM-dd", this.locale) +
          ".pdf"
      );
    }
  }

  exportAlarmPDF(alarmData: Array<Object>): void {
    if (alarmData && alarmData.length > 0) {
      let alarmLogs = [];
      alarmData.forEach((alarm) => alarmLogs.push(Object.values(alarm)));
      this.doc = new jsPDF();
      this.doc.addFont(
        "../../../assets/fonts/SourceHanSansTC/SourceHanSansTC-VF.ttf",
        "SourceHanSansTC",
        "VF"
      );
      this.doc.setFont("SourceHanSansTC", "VF");
      this.doc.text(this.tabName, 80, 15);
      this.doc.autoTable({
        styles: {
          font: "SourceHanSansTC",
          textColor: [0, 0, 0],
        },
        startY: 20,
        head: [
          [
            $localize`:@@eventDate:事件日期`,
            $localize`:@@featureType:功能名稱`,
            $localize`:@@status:狀態`,
          ],
        ],
        body: [...alarmLogs],
      });
      this.doc.save(
        this.poleData.number +
          "_" +
          this.tabName +
          "_" +
          formatDate(new Date(), "yyyy-MM-dd", this.locale) +
          ".pdf"
      );
    }
  }
}
