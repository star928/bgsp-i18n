import { Component, OnInit, TemplateRef, ViewChildren } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import {
  NbAccordionComponent,
  NbDialogRef,
  NbDialogService,
} from "@nebular/theme";
import { DigitalSignage } from "../../shared/model/signage.model";
import { AuthService } from "../../shared/service/auth/auth.service";
import { DisplayService } from "../../shared/service/display/display.service";
import { ERROR_CODE } from "./../../shared/const/error-code";
import { SignagePreviewDialogComponent } from "./signage-preview_dialog/signage-preview-dialog.component";
import { SignageSettingComponent } from "./signage-setting/signage-setting.component";

@Component({
  selector: "digital-signage",
  templateUrl: "./digital-signage.component.html",
  styleUrls: ["./digital-signage.component.scss"],
})
export class DigitalSignageComponent implements OnInit {
  isManager: boolean;

  signageList: Array<DigitalSignage>;
  @ViewChildren("accordion") accordion: ViewChildren;

  blobFile: SafeResourceUrl;

  twoBlock = $localize`:@@twoBlock:直式兩層`;
  threeBlock = $localize`:@@threeBlock:直式三層`;
  fullscreen = $localize`:@@fullscreen:直式全版`;

  // template
  templateList = [this.twoBlock, this.threeBlock, this.fullscreen];
  template = this.templateList[0];
  templatesValue = [
    this.twoBlock,
    "template_3",
    this.threeBlock,
    "template_3",
    this.fullscreen,
    "template_4",
  ];

  // image
  image_folder_path: string = "../../../assets/images/Baogao_Tab_Image/";
  preview_image: string = this.image_folder_path + "h00005.png";

  constructor(
    private authService: AuthService,
    private displayService: DisplayService,
    private dialogService: NbDialogService
  ) {
    this.isManager = this.authService.isManager();
  }

  ngOnInit(): void {
    this.getDisplayList();
  }

  getDisplayList(): void {
    this.displayService.getList().subscribe((list) => {
      this.signageList = list;
    });
  }

  signageFilter(
    signageList: Array<DigitalSignage>,
    templateName: string
  ): Array<DigitalSignage> {
    if (templateName) {
      let signages = signageList.filter((signage) =>
        signage.id.startsWith(templateName + "_")
      );
      if (signages) {
        return signages;
      }
    } else {
      return signageList.filter((signage) => !signage.id.startsWith($localize`:@@vertical:直式`));
    }
  }

  createDisplay(signageId: string, ref: NbDialogRef<any>): void {
    if (
      this.signageList.find(
        (signage) =>
          signage.id.toLowerCase() ===
          this.template + "_" + signageId.toLowerCase()
      )
    ) {
      alert(
        $localize`:@@existSignage:${signageId} 此看板名稱已存在，請重新輸入。`
      );
    } else if (signageId.length === 0) {
      alert($localize`:@@nullSignageName:看板名稱為空白。`);
    } else {
      let formData = new FormData();
      let sourceId = this.templatesValue[this.template];
      if (this.template === this.threeBlock) {
        formData.append("source", "marqueetext");
        formData.append(
          "text",
          $localize`:@@enterMarqueeText:請輸入跑馬燈文字`
        );
      }
      formData.append("id", this.template + "_" + signageId);
      formData.append("page", sourceId);
      this.displayService.createSignage(formData).subscribe(
        () => {
          this.getDisplayList();
          alert(
            $localize`:@@createSignageSuccess:新增 ${signageId} 看板成功！`
          );
          ref.close();
        },
        () =>
          alert($localize`:@@createSignageFailure:新增 ${signageId} 看板失敗！`)
      );
    }
  }

  addSignage(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog, { context: "" }).onClose.subscribe();
  }

  accordionOpenAll(accordion: NbAccordionComponent): void {
    accordion.openAll();
  }
  accordionCloseAll(accordion: NbAccordionComponent): void {
    accordion.closeAll();
  }

  signageSetting(signage: DigitalSignage): void {
    const dialogRef = this.dialogService.open(SignageSettingComponent, {
      context: {
        signage: signage,
        templateList: this.templateList,
      },
      closeOnBackdropClick: false,
    });
    dialogRef.onClose.subscribe((isUpdated) => {
      if (isUpdated) {
        this.getDisplayList();
      }
    });
  }

  signagePreview(signage: DigitalSignage): void {
    this.displayService.getList().subscribe((list) => {
      if (list.find((display) => signage.id == display.id)) {
        this.dialogService
          .open(SignagePreviewDialogComponent, {
            context: {
              signage: signage,
            },
          })
          .onClose.subscribe(() => this.getDisplayList());
      } else {
        alert($localize`:@@signageNotExist:${signage.id} 樣式不存在！`);
        this.signageList = list;
      }
    });
  }

  publishSignage(signageId: string): void {
    if (
      confirm(
        $localize`:@@confirmPublishSignage:確認要將看板 ${signageId} 發布嗎？`
      )
    ) {
      this.displayService.publishSignage(signageId).subscribe(
        () => {
          alert($localize`:@@publishSuccess:發布成功！`);
          this.getDisplayList();
        },
        (error) => {
          if (ERROR_CODE[error.statusText]) {
            alert(
              $localize`:@@publishError:發布失敗！原因：樣式${ERROR_CODE[error.statusText]
                }。`
            );
          } else {
            alert($localize`:@@publishFailure:發布失敗！`);
          }
          this.getDisplayList();
        }
      );
    }
  }

  deleteSignage(signageId: string): void {
    if (
      confirm(
        $localize`:@@confirmDeleteSignage:確認要將看板 ${signageId} 刪除嗎？`
      )
    ) {
      this.displayService.deleteSignage(signageId).subscribe(
        () => {
          alert($localize`:@@deleteSuccess:刪除成功！`);
          this.getDisplayList();
        },
        (error) => {
          if (ERROR_CODE[error.statusText]) {
            alert(
              $localize`:@@deleteError:刪除失敗！原因：樣式${ERROR_CODE[error.statusText]
                }。`
            );
          } else {
            alert($localize`:@@deleteFailure:刪除失敗！`);
          }
          this.getDisplayList();
        }
      );
    }
  }
}
