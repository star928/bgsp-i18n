import { VIDEO_TYPE } from "./../../../shared/const/media-type";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { IMAGE_TYPE } from "../../../shared/const/media-type";
import { DigitalSignage } from "../../../shared/model/signage.model";
import { DisplayService } from "../../../shared/service/display/display.service";
import { ERROR_CODE } from "../../../shared/const/error-code";
import { DomSanitizer } from "@angular/platform-browser";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "signage-preview-dialog",
  templateUrl: "./signage-preview-dialog.component.html",
  styleUrls: ["./signage-preview-dialog.component.scss"],
})
export class SignagePreviewDialogComponent implements OnInit, OnDestroy {
  @Input() signage: DigitalSignage;

  signageId: string;
  templateId: string;
  interval: number;
  canLoad: boolean = true;
  message = {};

  sourceList = {
    template_3: ["main", "main2", "marqueetext"],
    template_4: ["main"],
  };
  // files = { main: "", main2: "" };
  marquee_text: string;
  main_vdo: any;
  main2_vdo: any;
  main_vdo_src: string;
  main_img_src: string;
  main2_vdo_src: string;
  main2_img_src: string;

  constructor(
    private sanitizer: DomSanitizer,
    private displayService: DisplayService,
    protected ref: NbDialogRef<SignagePreviewDialogComponent>
  ) {}

  ngOnInit(): void {
    this.signageId = this.signage.id;
    this.templateId = this.signage.page;
    this.interval = this.signage.interval;

    if (this.signageId && this.templateId) {
      for (let sourceId of this.sourceList[this.templateId]) {
        if (sourceId === "marqueetext") {
          this.getMarqueeText(sourceId);
        } else {
          this.getNextFile(sourceId, "first");
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.canLoad = false;
  }

  getMarqueeText(sourceId: string): void {
    if (this.signage.id.startsWith("直式三層_")) {
      this.displayService
        .getMarqueeText(this.signageId, sourceId)
        .subscribe((res) => {
          // this.files[sourceId] = res;
          this.marquee_text = res["text"];
        });
    }
  }

  getNextFile(sourceId: string, fileUUID: string): void {
    this.message[sourceId] = $localize`:@@loading:讀取中，請稍後。`;
    this.displayService
      .getNextFile(this.signageId, sourceId, fileUUID)
      .subscribe(
        (res) => {
          if (res["file"]) {
            // this.files[sourceId] = res;
            this.chnageFiles(sourceId, res["file"]);
          } else {
            this.message[sourceId] = $localize`:@@noFile:無上傳檔案！`;
          }
        },
        (error) => {
          this.message[sourceId] = $localize`:@@noFile:無上傳檔案！`;
          if (fileUUID !== "first") {
            alert(
              $localize`:@@fileLoadingFailure:檔案讀取失敗，請確認樣式或檔案是否存在！`
            );
            this.ref.close();
          }
        }
      );
  }

  // previewFile(sourceId: string, fileUUID: string): void {
  //   this.displayService.getFile(fileUUID).subscribe(
  //     (file) => {
  //       if (
  //         this.signage.source.find((source) => source.id === sourceId).file
  //           .length > 1
  //       ) {
  //         if (Object.values(IMAGE_TYPE).find((type) => type === file.type)) {
  //           this[`${sourceId}_img_src`] =
  //             this.sanitizer.bypassSecurityTrustResourceUrl(
  //               URL.createObjectURL(file)
  //             );
  //           this[`${sourceId}_vdo_src`] = "";
  //           if (this.canLoad) {
  //             setTimeout(
  //               () => this.getNextFile(sourceId, fileUUID),
  //               this.interval * 1000
  //             );
  //           }
  //         } else if (
  //           Object.values(VIDEO_TYPE).find((type) => type === file.type)
  //         ) {
  //           this[`${sourceId}_vdo_src`] =
  //             this.sanitizer.bypassSecurityTrustResourceUrl(
  //               URL.createObjectURL(file)
  //             );
  //           this[`${sourceId}_img_src`] = "";
  //         }
  //       } else {
  //         if (Object.values(IMAGE_TYPE).find((type) => type === file.type)) {
  //           this[`${sourceId}_img_src`] =
  //             this.sanitizer.bypassSecurityTrustResourceUrl(
  //               URL.createObjectURL(file)
  //             );
  //           this[`${sourceId}_vdo_src`] = "";
  //         } else if (
  //           Object.values(VIDEO_TYPE).find((type) => type === file.type)
  //         ) {
  //           this[`${sourceId}_vdo_src`] =
  //             this.sanitizer.bypassSecurityTrustResourceUrl(
  //               URL.createObjectURL(file)
  //             );
  //           this[`${sourceId}_img_src`] = "";
  //         }
  //       }
  //     },
  //     (error) => {
  //       if (ERROR_CODE[error.statusText]) {
  //         alert(
  //           `讀取失敗！原因：${fileUUID} ${ERROR_CODE[error.statusText]}。`
  //         );
  //       } else {
  //         alert(`讀取失敗！`);
  //         this.ref.close();
  //       }
  //     }
  //   );
  // }

  chnageFiles(sourceId: string, fileUUID: string): void {
    let filesName: Array<string> = fileUUID.split(".");
    if (
      this.signage.source.find((source) => source.id === sourceId).file.length >
      1
    ) {
      if (IMAGE_TYPE[filesName[filesName.length - 1].toLowerCase()]) {
        this[`${sourceId}_img_src`] = fileUUID;
        this[`${sourceId}_vdo_src`] = "";
        if (this.canLoad) {
          setTimeout(
            () => this.getNextFile(sourceId, fileUUID),
            this.interval * 1000
          );
        }
      } else if (VIDEO_TYPE[filesName[filesName.length - 1].toLowerCase()]) {
        this[`${sourceId}_vdo_src`] = fileUUID;
        this[`${sourceId}_img_src`] = "";
      }
    } else {
      if (IMAGE_TYPE[filesName[filesName.length - 1].toLowerCase()]) {
        this[`${sourceId}_img_src`] = fileUUID;
        this[`${sourceId}_vdo_src`] = "";
      } else if (VIDEO_TYPE[filesName[filesName.length - 1].toLowerCase()]) {
        this[`${sourceId}_vdo_src`] = fileUUID;
        this[`${sourceId}_img_src`] = "";
      }
    }
  }

  videoDomLoad($event: any, sourceId: string): void {
    if (
      this.signage.source.find((source) => source.id === sourceId).file
        .length === 1
    ) {
      if (sourceId === "main") {
        this[`${sourceId}_vdo`] = $event.target;
        this[`${sourceId}_vdo`].loop = true;
      }
    }
  }

  videoEnded(sourceId: string, videoUUID: string): void {
    this.getNextFile(sourceId, videoUUID);
  }
}
