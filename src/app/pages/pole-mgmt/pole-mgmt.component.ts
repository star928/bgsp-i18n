import { mergeMap, tap } from "rxjs/operators";
import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { interval, Subscription, Observable } from "rxjs";
import { PoleData, PoleManageData } from "../../shared/model/pole.model";
import { PoleService } from "../../shared/service/pole/pole.service";
import { NbDialogRef, NbDialogService } from "@nebular/theme";

@Component({
  selector: "ngx-pole-mgmt",
  templateUrl: "./pole-mgmt.component.html",
  styleUrls: ["./pole-mgmt.component.scss"],
})
export class PoleMgmtComponent implements OnInit, OnDestroy {
  type: string;

  polesManageData: Array<PoleManageData>;
  polesData: Array<PoleData>;
  getPolesData$: Subscription;
  createPole$: Subscription;
  updatePole$: Subscription;
  deletePole$: Subscription;
  polesDataInterval$: Subscription;

  // image
  image_folder_path: string = "../../../assets/images/Baogao_Tab_Image/";
  preview_image: string;

  // read frequency
  freScope: number = 5;
  freScopes: Array<number> = [];

  toggleStatus: string = "on";
  toggleTranslate = { on: $localize`:@@on:開啟`, off: $localize`:@@off:關閉` };

  constructor(
    private poleService: PoleService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit(): void {
    this.getPolesData();
    this.polesDataInterval$ = interval(300000).subscribe(() =>
      this.getPolesData()
    );
    this.createFreScopes();
  }

  createFreScopes(): void {
    for (let f = 5; f < 60; f += 5) {
      this.freScopes.push(f);
    }
  }

  changeUpdateFrequency(ref: NbDialogRef<any>): void {
    if (
      confirm(
        $localize`:@@confirmModifyFreq:確認修改更新頻率為${this.freScope} 分鐘嗎？`
      )
    ) {
      if (this.polesDataInterval$) {
        this.polesDataInterval$.unsubscribe();
      }
      this.getPolesData();
      this.polesDataInterval$ = interval(this.freScope * 60 * 1000).subscribe(
        () => this.getPolesData()
      );
      ref.close();
    }
  }

  ngOnDestroy(): void {
    if (this.polesDataInterval$) {
      this.polesDataInterval$.unsubscribe();
    }
  }

  getPolesData(): void {
    this.poleService
      .getManagePolesData()
      .subscribe((data) => (this.polesManageData = data));
    this.poleService
      .getPolesData()
      .subscribe((data) => (this.polesData = data));
  }

  // change tab (photo changing)
  changeTab($event: any) {
    this.type = $event.tabTitle;
  }

  onUpdated(isUpdated: boolean): void {
    if (isUpdated) {
      this.getPolesData();
    }
  }

  toggleSignageSchedule(ref: NbDialogRef<any>, status: string): void {
    let toggles$: Observable<PoleManageData>;
    if (
      confirm(
        $localize`:@@confirmModifyAllMP:此操作將會控制所有看板，確認要${this.toggleTranslate[status]}全部看板的排程？`
      )
    ) {
      this.polesManageData.forEach((poleManageData) => {
        poleManageData.player_screen = status;
        if (!toggles$) {
          toggles$ = this.poleService.managePole(poleManageData).pipe(
            tap(
              () => { },
              (error) =>
                alert(
                  $localize`:@@modifyManagePoleFailure:智慧桿 ${poleManageData.number} 修改失敗！`
                )
            )
          );
        } else {
          toggles$ = toggles$.pipe(
            mergeMap(() =>
              this.poleService.managePole(poleManageData).pipe(
                tap(
                  () => { },
                  (error) =>
                    alert(
                      $localize`:@@modifyManagePoleFailure:智慧桿 ${poleManageData.number} 修改失敗！`
                    )
                )
              )
            )
          );
        }
      });
      toggles$.subscribe(() => {
        alert(
          $localize`:@@modifyScheduleSuccess:看板排程${this.toggleTranslate[status]}成功！`
        );
        this.getPolesData();
        ref.close();
      });
    }
  }

  readSetting(frequency): void {
    this.dialogService.open(frequency);
  }
}
