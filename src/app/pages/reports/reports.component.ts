import { formatDate } from "@angular/common";
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from "@angular/core";
import { NbThemeService } from "@nebular/theme";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Subscription } from "rxjs";
import { FileService } from "../../shared/service/file/file.service";
import { PoleService } from "../../shared/service/pole/pole.service";
import { PoleData, PoleLog } from "../../shared/model/pole.model";

@Component({
  selector: "ngx-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit, OnDestroy {
  themeSubscription: Subscription;
  polesData: Array<PoleData>;
  poleData: PoleData;
  tabsName = [
    [$localize`:@@smartLight:智慧照明`, "light"],
    [$localize`:@@environment:環境感測`, "environment"],
    [$localize`:@@solar:儲能系統`, "solar"],
    [$localize`:@@holder:箱體狀態`, "holder"],
  ];
  deviceType = "light";
  tabName = $localize`:@@smartLight:智慧照明`;
  // 智慧桿歷程資料
  poleLogsData: PoleLog;
  // 智慧桿歷程資料

  // jsPDF
  doc: any;
  // jsPDF

  // image
  image_folder_path: string = "../../../assets/images/Baogao_Tab_Image/";
  preview_image: string;

  constructor(
    private poleService: PoleService,
    private fileService: FileService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit(): void {
    this.getPolesData();
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  changeTab($event: any) {
    this.tabName = $event.tabTitle;
    this.deviceType = this.tabsName.find((tab) => tab[0] === this.tabName)[1];
  }

  getPolesData(): void {
    this.poleService.getPolesData().subscribe((data) => {
      this.polesData = data;
      this.poleData = data[0];
    });
  }

  exportPDF(hybridData: Array<any>): void {
    this.doc = new jsPDF();
    this.doc.addFont(
      "../../../assets/fonts/SourceHanSansTC/SourceHanSansTC-VF.ttf",
      "SourceHanSansTC",
      "VF"
    );
    this.doc.setFont("SourceHanSansTC", "VF");
    this.doc.text("思源黑體", 10, 10);
    this.doc.save(
      hybridData[2] +
      "_" +
      this.tabName +
      "_" +
      hybridData[1] +
      $localize`:@@reportFilename:趨勢報表_` +
      formatDate(new Date(), "yyyy-MM-dd", this.locale) +
      ".pdf"
    );
  }

  exportCSV(hybridData: Array<any>): void {
    this.fileService.exportToCsv(
      hybridData[2],
      hybridData[0] +
      "_" +
      this.tabName +
      "_" +
      hybridData[1] +
      $localize`:@@reportFilename:趨勢報表_` +
      formatDate(new Date(), "yyyy-MM-dd", this.locale)
    );
  }
}
