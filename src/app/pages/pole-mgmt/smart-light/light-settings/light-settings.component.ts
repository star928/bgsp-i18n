import { PoleService } from "../../../../shared/service/pole/pole.service";
import { formatDate } from "@angular/common";
import {
  Component,
  Inject,
  Input,
  LOCALE_ID,
  OnInit,
  Output,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { NbDialogRef, NbTimePickerComponent } from "@nebular/theme";
import { LocalDataSource } from "ng2-smart-table";
import { PoleData } from "../../../../shared/model/pole.model";

@Component({
  selector: "ngx-light-settings",
  templateUrl: "./light-settings.component.html",
  styleUrls: ["./light-settings.component.scss"],
})
export class LightSettingsComponent implements OnInit {
  @Input() poleData: PoleData;

  pole: FormGroup;
  scheduleForm: FormGroup;

  lightControlType = { on: "開啟", off: "關閉", schedule: "排程" };
  lightControls = Object.keys(this.lightControlType);
  schedules: Array<string> = [];
  tableSchedules: Array<Object> = [];
  schedule: Object = { scope: "", brightness: "" };
  scope: string = "";

  scheduleSettings = {
    mode: "external",
    hideHeader: false,
    hideSubHeader: true,
    noDataMessage: $localize`:@@noData:無資料`,
    actions: {
      columnTitle: $localize`:@@action:操作`,
      add: false,
      edit: true,
      delete: true,
      position: "right",
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      scope: {
        title: $localize`:@@timeScope:時段`,
        type: "string",
        filter: true,
        width: "50%",
      },
      brightness: {
        title: $localize`:@@brightnessWithUnit:亮度 (%)`,
        type: "string",
        filter: true,
        width: "50%",
      },
    },
    pager: {
      display: true,
      perPage: 5,
      filter: false,
    },
  };

  scheduleSource: LocalDataSource = new LocalDataSource();

  constructor(
    protected ref: NbDialogRef<LightSettingsComponent>,
    private formBuilder: FormBuilder,
    private poleService: PoleService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  ngOnInit(): void {
    this.poleFormBuild();
    this.scheduleFormBuild();
    if (this.poleData) {
      this.poleData.light_schedule.forEach((scedule) => {
        this.tableSchedules.push({
          scope:
            scedule.split(":")[0].slice(0, 2) +
            ":" +
            scedule.split(":")[0].slice(2),
          brightness: parseInt(scedule.split(":")[1], 16),
        });
      });
      this.scheduleSource.load(this.tableSchedules);
    }
  }

  poleFormBuild(): void {
    this.pole = this.formBuilder.group({
      uuid: [this.poleData?.uuid],
      light_username: [this.poleData?.light_username, Validators.required],
      light_passwd: [this.poleData?.light_passwd, Validators.required],
      light_dimming: [this.poleData?.light_dimming, Validators.required],
      light_control: [
        this.poleData?.light_control ? this.poleData.light_control : "off",
        Validators.required,
      ],
      light_schedule: [this.poleData?.light_schedule],
    });
  }

  // schedule Start

  scheduleFormBuild(): void {
    this.scheduleForm = this.formBuilder.group({
      scope: ["", Validators.required],
      brightness: [
        "",
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
    });
  }

  setDate(time: Date): void {
    if (time && time instanceof Date) {
      this.scope = formatDate(time, "HH:mm", this.locale);
    }
  }

  addSchedule(scheduleScope: NbTimePickerComponent<Date>): void {
    let tempSchedule = this.tableSchedules.find(
      (schedule) =>
        schedule["scope"] ===
        formatDate(new Date(scheduleScope.date), "HH:mm", this.locale)
    );
    if (tempSchedule) {
      tempSchedule["brightness"] = this.scheduleForm.get("brightness").value;
    } else {
      let scope = formatDate(
        this.scheduleForm.get("scope").value,
        "HH:mm",
        this.locale
      );
      this.tableSchedules.push({
        scope: scope,
        brightness: this.scheduleForm.get("brightness").value,
      });
    }
    this.scheduleSource.load(this.tableSchedules);
    this.scheduleFormBuild();
  }

  editSchedule(
    editSchedule: Object,
    scheduleScope: NbTimePickerComponent<Date>
  ): void {
    this.schedule = editSchedule;
    let scope = new Date(
      formatDate(new Date(), "YYYY-MM-dd", this.locale) +
      " " +
      editSchedule["scope"]
    );
    this.scheduleForm.setValue({
      scope: scope,
      brightness: editSchedule["brightness"],
    });
    scheduleScope.date = scope;
  }

  deleteSchedule(deleteSchedule: Object): void {
    if (confirm($localize`:@@confirmDelete:確認要刪除嗎？`)) {
      let schedules: Array<Object> = this.tableSchedules;
      schedules.splice(
        schedules.findIndex((scheduleData) => scheduleData === deleteSchedule),
        1
      );
      this.scheduleSource.load(schedules);
    }
  }

  isExisted(): boolean {
    if (this.scheduleForm.get("scope").value) {
      if (
        this.tableSchedules.find(
          (schedule) =>
            schedule["scope"] ===
            formatDate(
              this.scheduleForm.get("scope").value,
              "HH:mm",
              this.locale
            )
        )
      ) {
        return true;
      }
    } else {
      return false;
    }
  }

  isScheduleChanged(): boolean {
    if (this.schedule) {
      return (
        this.scheduleForm["scope"] === this.schedule["scope"] &&
        this.scheduleForm["brightness"] === this.schedule["brightness"]
      );
    } else {
      return false;
    }
  }

  // schedule End

  transformSchedule(transSchedule: Object): void {
    let tempSchedule = transSchedule["scope"].split(":");
    let tempBrightness = transSchedule["brightness"].toString(16);
    if (tempBrightness.length <= 1) {
      tempBrightness = "0" + tempBrightness;
    }
    this.schedules.push(
      tempSchedule[0] + tempSchedule[1] + ":" + tempBrightness
    );
  }

  saveSettings(): void {
    this.schedules = [];
    this.tableSchedules.forEach((schedule) => this.transformSchedule(schedule));
    this.pole.get("light_schedule").setValue(this.schedules);

    if (
      confirm(
        $localize`:@@confirmModifyPoleSettings:確定要修改 ${this.poleData.number} 的設定嗎？`
      )
    ) {
      this.poleService.updatePole(this.pole).subscribe(
        () => {
          alert(
            $localize`:@@modifyPoleSuccess:智慧桿 ${this.poleData.number} 修改成功！`
          );
          this.close(true);
        },
        () => {
          alert(
            $localize`:@@modifyPoleFailure:智慧桿 ${this.poleData.number} 修改失敗！`
          );
        }
      );
    }
  }

  close(isUpdated: boolean): void {
    this.ref.close(isUpdated);
  }
}
