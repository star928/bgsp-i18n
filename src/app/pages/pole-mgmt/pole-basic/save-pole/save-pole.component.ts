import { formatDate } from "@angular/common";
import { Component, Inject, Input, LOCALE_ID, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef, NbTimePickerComponent } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { DigitalSignage } from "../../../../shared/model/signage.model";
import { DisplayService } from "../../../../shared/service/display/display.service";
import { PoleService } from "../../../../shared/service/pole/pole.service";
import { PoleManageData } from "./../../../../shared/model/pole.model";

@Component({
  selector: "ngx-save-pole",
  templateUrl: "./save-pole.component.html",
  styleUrls: ["./save-pole.component.scss"],
})
export class SavePoleComponent implements OnInit {
  @Input() poleManageData: PoleManageData;
  @Input() polesManageData: Array<PoleManageData>;
  @Input() type: string;

  pole: FormGroup;
  signages: Array<DigitalSignage>;
  signage: DigitalSignage = new DigitalSignage("");
  display: string;
  checked: any;
  submitted: boolean = false;

  // Schedule Start
  schedules = ["on", "off"];
  weeks: Array<Array<string>> =
    [
      ["monday", $localize`:@@monday:星期一`],
      ["tuesday", $localize`:@@tuesday:星期二`],
      ["wednesday", $localize`:@@wednesday:星期三`],
      ["thursday", $localize`:@@thursday:星期四`],
      ["friday", $localize`:@@friday:星期五`],
      ["saturday", $localize`:@@saturday:星期六`],
      ["sunday", $localize`:@@sunday:星期日`],
    ];
  week: string;
  startDate: string = "";
  endDate: string = "";

  screenScheduleSource: LocalDataSource = new LocalDataSource();

  screenScedule_setting = {
    mode: "inline",
    hideHeader: false,
    hideSubHeader: true,
    noDataMessage: $localize`:@@noData:無資料`,
    actions: {
      columnTitle: $localize`:@@action:操作`,
      add: false,
      edit: false,
      delete: true,
      position: "right",
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      wday: {
        title: $localize`:@@date:星期`,
        type: "string",
        filter: true,
      },
      start: {
        title: $localize`:@@startTime:開始時間`,
        type: "string",
        filter: true,
      },
      end: {
        title: $localize`:@@endTime:結束時間`,
        type: "string",
        filter: true,
      },
      display: {
        title: $localize`:@@style:樣式`,
        type: "string",
        filter: true,
      },
    },
    pager: {
      display: true,
      perPage: 5,
      filter: false,
    },
  };
  // Schedule End

  constructor(
    protected ref: NbDialogRef<SavePoleComponent>,
    private formBuilder: FormBuilder,
    private poleService: PoleService,
    private displayService: DisplayService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  get poleEnable() {
    return this.pole.get("enable").value;
  }
  get playerScreen() {
    return this.pole.get("player_screen").value;
  }

  ngOnInit(): void {
    this.getSignageList();
    this.poleFormBuild();
    if (this.poleManageData) {
      this.loadSchedules(this.poleManageData.player_schedule);
    }
  }

  loadSchedules(schedules: Array<Object>): void {
    schedules.forEach(schedule => schedule['wday'] = this.weeks.find(week => week[0] === schedule['wday'])[1]);
    this.screenScheduleSource.load(schedules);
  }


  poleFormBuild(): void {
    this.pole = this.formBuilder.group({
      uuid: [this.poleManageData?.uuid],
      enable: [this.poleManageData?.enable, Validators.required],
      passwd: [this.poleManageData?.passwd, Validators.required],
      number: [this.poleManageData?.number, Validators.required],
      geoLocation: this.formBuilder.group({
        lat: [this.poleManageData?.geoLocation["lat"], Validators.required],
        lng: [this.poleManageData?.geoLocation["lng"], Validators.required],
      }),
      light_enable: [
        this.poleManageData?.light_enable
          ? this.poleManageData.light_enable
          : false,
      ],
      environment_enable: [
        this.poleManageData?.environment_enable
          ? this.poleManageData.environment_enable
          : false,
      ],
      player_enable: [
        this.poleManageData?.player_enable
          ? this.poleManageData.player_enable
          : false,
      ],
      solar_enable: [
        this.poleManageData?.player_enable
          ? this.poleManageData.solar_enable
          : false,
      ],
      player_screen: [
        this.poleManageData?.player_screen
          ? this.poleManageData.player_screen
          : "off",
      ],
      player_schedule: [
        this.poleManageData?.player_schedule
          ? this.poleManageData.player_schedule
          : [],
      ],
    });
  }

  getSignageList(): void {
    this.displayService.getList().subscribe((data) => {
      this.signages = data.filter((signage) => !signage.publishable);
    });
  }

  // signageFilter(isPublished: boolean): Array<DigitalSignage> {
  //   return this.signages.filter(
  //     (signage) => isPublished === !signage.publishable
  //   );
  // }

  checkboxChanged(isChecked: any, type: string): void {
    this.pole.get(type).setValue(isChecked);
  }

  setDate(time: Date, type: string): void {
    if (time && time instanceof Date) {
      this[type] = formatDate(time, "HH:mm", this.locale);
    }
  }

  addPlayerSchedule(
    startTime: NbTimePickerComponent<Date>,
    endTime: NbTimePickerComponent<Date>
  ): void {
    let schedules: Array<Object> = this.pole.get("player_schedule").value;
    let start = formatDate(startTime.date, "HH:mm", this.locale);
    let end = formatDate(endTime.date, "HH:mm", this.locale);
    let existed = [];
    schedules
      .filter(
        (schedule) => {
          return schedule["wday"] === this.week &&
            ((start < schedule["start"] && end > schedule["end"]) ||
              (start >= schedule["start"] && end <= schedule["end"]) ||
              (schedule["start"] > start && schedule["start"] < end) ||
              (schedule["end"] > start && schedule["end"] < end));
        }
      )
      .forEach((schedule) =>
        existed.push([schedule["start"] + " - " + schedule["end"]])
      );
    if (existed.length > 0) {
      alert(
        $localize`:@@selectedTimeError :所選時間與 ${existed} 重疊，請重新選擇！`
      );
    } else {
      schedules.push({
        wday: this.week,
        start: start,
        end: end,
        display: this.display,
      });
    }
    this.screenScheduleSource.load(schedules);
    // this.screenScheduleSource.load(
    //   schedules.sort((a, b) => {
    //     if (this.weekIndex[a["wday"]] !== this.weekIndex[b["wday"]]) {
    //       return this.weekIndex[a["wday"]] - this.weekIndex[b["wday"]];
    //     } else if (a["start"] !== b["start"]) {
    //       return Number.parseInt(a["start"]) - Number.parseInt(b["start"]);
    //     } else if (a["end"] !== b["end"]) {
    //       return a["end"] - b["end"];
    //     } else {
    //       return a["display"] - b["display"];
    //     }
    //   })
    // );
  }

  deletePlayerSchedule($event: any): void {
    if (
      confirm(
        $localize`:@@confirmDeleteMPSchedule:確認要刪除 ${$event.data["wday"]} 的排程嗎？`
      )
    ) {
      $event.confirm.resolve();
      let schedules: Array<Object> = this.pole.get("player_schedule").value;
      schedules.splice(
        schedules.findIndex((scheduleData) => scheduleData === $event.data),
        1
      );
      this.screenScheduleSource.load(schedules);
      // this.screenScheduleSource.load(
      //   schedules.sort((a, b) => {
      //     if (this.weekIndex[a["wday"]] !== this.weekIndex[b["wday"]]) {
      //       return this.weekIndex[a["wday"]] - this.weekIndex[b["wday"]];
      //     } else if (
      //       this.weekIndex[a["start"]] !== this.weekIndex[b["start"]]
      //     ) {
      //       return this.weekIndex[a["start"]] - this.weekIndex[b["start"]];
      //     } else if (this.weekIndex[a["end"]] !== this.weekIndex[b["end"]]) {
      //       return this.weekIndex[a["end"]] - this.weekIndex[b["end"]];
      //     } else {
      //       return this.weekIndex[a["display"]] - this.weekIndex[b["display"]];
      //     }
      //   })
      // );
    } else {
      $event.confirm.reject();
    }
  }
  // Schedule End

  savePole(): void {
    let poleNumber = this.pole.get("number").value;
    if (confirm($localize`:@@confirmUpdate:確定要${this.type}嗎？`)) {
      let schedules: Array<Object> = this.pole.get("player_schedule").value;
      schedules.forEach(schedule => schedule['wday'] = this.weeks.find(week => week[1] === schedule['wday'])[0]);
      this.pole
        .get("player_schedule")
        .setValue(schedules);
      // 判斷是否為新增
      if (!this.poleManageData) {
        // 判斷智慧桿編號是否重複
        if (!this.polesManageData.find((pole) => pole.number === poleNumber)) {
          this.poleService.createPole(this.pole).subscribe(
            () => {
              alert(
                $localize`:@@updatePoleSuccess:智慧桿 ${this.pole.get("number").value
                  } ${this.type}成功！`
              );
              this.close(true);
            },
            () => {
              alert(
                $localize`:@@updatePoleFailure:智慧桿 ${this.pole.get("number").value
                  } ${this.type}失敗！`
              );
            }
          );
        } else {
          alert($localize`:@@poleNumberExist:智慧桿編號重複，請重新輸入！`);
        }
      } else {
        if (
          this.poleManageData.number === poleNumber ||
          !this.polesManageData.filter((pole) => pole.number === poleNumber)
            .length
        ) {
          this.pole
            .get("player_schedule")
            .setValue(this.pole.get("player_schedule").value);
          this.poleService.updatePole(this.pole).subscribe(
            () => {
              alert(
                $localize`:@@updatePoleSuccess:智慧桿 ${this.pole.get("number").value
                  } ${this.type}成功！`
              );
              this.close(true);
            },
            () => {
              alert(
                $localize`:@@updatePoleFailure:智慧桿 ${this.pole.get("number").value
                  } ${this.type}失敗！`
              );
            }
          );
        } else {
          alert($localize`:@@poleNumberExist:智慧桿編號重複，請重新輸入！`);
        }
      }
    }
  }

  close(isUpdated: boolean): void {
    this.ref.close(isUpdated);
  }
}
