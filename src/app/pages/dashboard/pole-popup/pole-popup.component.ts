import { SETTINGS } from "./../../../shared/const/system-config";
import { AlarmService } from "./../../../shared/service/alarm/alarm.service";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PoleData } from "./../../../shared/model/pole.model";
import { ICON_PATH } from '../../../shared/const/file-path';

@Component({
  selector: "ngx-pole-popup",
  templateUrl: "./pole-popup.component.html",
  styleUrls: ["./pole-popup.component.scss"],
})
export class PolePopupComponent implements OnInit, OnDestroy {
  @Input() poleData: PoleData;
  GLOBAL_SETTINGS = SETTINGS;
  ICON = ICON_PATH;
  record: Object;
  iconRoot = "assets/icons/BaoGao_Icon/SVG/";
  cctvList = {
    BGSP00001: "http://61.218.188.34:9991/Live?channel=17211&mode=0",
    BGSP00002: "http://61.218.188.34:9991/Live?channel=17310&mode=0",
    BGSP00003: "http://61.218.188.146:9991/Live?mode=0&channel=ZN110_0_1_010_DOME_6",
    BGSP00004: "http://61.218.188.34:9991/Live?channel=18010&mode=0",
  };


  constructor(private router: Router, private alarmService: AlarmService) { }

  ngOnInit(): void { }

  ngOnDestroy(): void { }

  checkLightState(): boolean {
    return (
      this.poleData.light_show === "online" ||
      (this.poleData.light_show === "offline" &&
        !this.alarmService.isLegalLightTime(this.poleData.light_show_time))
    );
  }

  translateLightState(): string {
    return this.poleData.light_show === "online" ||
      this.alarmService.isLegalLightTime(this.poleData.light_show_time) ||
      !this.alarmService.isLatestRecord(this.poleData.light_show_time)
      ? this.poleData.light_show
      : this.poleData.light_show + " " + $localize`:@@noPower:( 未供電 )`;
  }

  showDetail(): void {
    this.router.navigateByUrl(`pages/dashboard/detail/${this.poleData.number}`);
  }
}
