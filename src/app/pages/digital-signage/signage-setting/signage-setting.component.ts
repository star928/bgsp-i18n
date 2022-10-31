import { HttpEventType } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { EMPTY, Observable } from "rxjs";
import { concatMap, map, mergeMap, tap } from "rxjs/operators";
import { ERROR_CODE } from "../../../shared/const/error-code";
import {
  DigitalSignage,
  SignageSourcce,
  SourceMedia,
} from "../../../shared/model/signage.model";
import { DisplayService } from "../../../shared/service/display/display.service";

@Component({
  selector: "signage-setting",
  templateUrl: "./signage-setting.component.html",
  styleUrls: ["./signage-setting.component.scss"],
})
export class SignageSettingComponent implements OnInit {
  @Input() templateList: Array<string>;
  @Input() signage: DigitalSignage;

  sourceList = {
    template_3: ["main", "main2"],
    template_4: ["main"],
  };
  sources = {
    main: $localize`:@@mainBlock:主要播放區`,
    main2: $localize`:@@subBlock:次要播放區`,
  };
  templates = Object.keys(this.sourceList);

  // files
  // acceptList = [
  //   "video/mp4",
  //   "video/quicktime",
  //   "image/jpeg",
  //   "image/bmp",
  //   "image/png",
  //   "image/gif",
  //   "image/tiff",
  //   "audio/mpeg",
  //   "audio/vnd.dlna.adts",
  // ];

  acceptList = ["mp4", "mov", "jpg", "bmp", "png", "gif", "tiff", "mp3", "aac"];

  video = $localize`:@@video:影片`;
  image = $localize`:@@image:圖片`;
  audio = $localize`:@@audio:音訊`;

  acceptTypes = [
    [this.video, ["mp4", "mov"]],
    [this.image, ["jpg", "bmp", "png", "gif", "tiff"]],
    [this.audio, ["mp3", "aac"]],
  ];

  media: FormGroup;
  mainFiles: FileList;
  main2Files: FileList;
  uploadProgress: Object;
  isUploading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private displayService: DisplayService,
    protected ref: NbDialogRef<SignageSettingComponent>
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  getSignage(): Observable<DigitalSignage> {
    return this.displayService
      .getList()
      .pipe(
        map((list) => list.find((signage) => signage.id === this.signage.id))
      );
  }

  createForm(): void {
    this.media = this.formBuilder.group({
      text: [
        this.signage?.source?.find((source) => source.id === "marqueetext")
          ?.text,
      ],
      interval: [this.signage?.interval, Validators.min(0)],
    });
  }

  findSource(sourceId: string): SignageSourcce {
    return this.signage.source.find((source) => source.id === sourceId);
  }

  selectFiles(fileList: FileList, num: number): void {
    let isAcceptType = true;
    for (let i = 0; i < fileList.length; i++) {
      isAcceptType = this.checkSubName(fileList[i], isAcceptType);
    }
    if (isAcceptType) {
      if (num === 0) {
        this.mainFiles = fileList;
      } else {
        this[`main${num + 1}Files`] = fileList;
      }
    }
  }

  checkSubName(file: File, isAcceptType: boolean): boolean {
    if (!this.acceptList.find((type) => file.name.endsWith(type))) {
      alert(
        $localize`:@@notAcceptType:檔案 ${file.name} 不符合容許的格式，請重新選擇！`
      );
      return false;
    } else {
      return isAcceptType;
    }
  }

  upload(templateId: string): void {
    let uploadGroups$: Observable<any>;
    let uploads$: Observable<any>;
    let sourceIds: Array<string> = this.sourceList[templateId];
    this.uploadProgress = {};
    sourceIds.forEach((sourceId) => {
      let progressList: Array<Object> = [];
      this.uploadProgress[sourceId] = progressList;
      let files = this[`${sourceId}Files`];
      if (files && files.length > 0) {
        uploads$ = null;
        this.isUploading = true;
        for (let i = 0; i < files.length; i++) {
          let file: FormData = new FormData();
          file.append("id", this.signage.id);
          file.append("page", templateId);
          file.append("source", sourceId);
          file.append("file", files[i]);
          let upload$ = this.displayService.uploadFiles(file).pipe(
            tap(
              (res) => {
                if (res.type === HttpEventType.UploadProgress) {
                  let progress = progressList.find(
                    (progress) => progress["name"] === files[i].name
                  );
                  if (!progress) {
                    progressList.push({
                      name: files[i].name,
                      percent: Math.round((res.loaded / res.total) * 100),
                    });
                  } else {
                    progress["percent"] = Math.round(
                      (res.loaded / res.total) * 100
                    );
                  }
                }
              },
              () =>
                alert(
                  $localize`:@@uploadFileFailure:${this.sources[sourceId]} - 檔案 ${files[i].name} 新增失敗！`
                )
            )
          );
          if (!uploads$) {
            uploads$ = this.displayService.getList().pipe(
              concatMap((list) => {
                if (list.find((signage) => signage.id === this.signage.id)) {
                  return upload$;
                } else {
                  // if (confirm(`目前修改的樣式不存在，是否要改為新增？`)) {
                  //   return upload$;
                  // } else {
                  alert(
                    $localize`:@@modifySignageFailure:${this.signage.id} 修改失敗：原因：檔案不存在。`
                  );
                  this.closeDialog(true);
                  return EMPTY;
                  // }
                }
              })
            );
          } else {
            uploads$ = uploads$.pipe(
              concatMap((res) => {
                if (res.type === HttpEventType.Response) {
                  return upload$;
                } else {
                  return EMPTY;
                }
              })
            );
          }
        }
        if (!uploadGroups$) {
          uploadGroups$ = uploads$;
        } else {
          uploadGroups$ = uploadGroups$.pipe(
            mergeMap((res) => {
              if (res.type === HttpEventType.Response) {
                return uploads$;
              } else {
                return EMPTY;
              }
            })
          );
        }
      } else {
        alert(
          $localize`:@@noFileSelected:${this.sources[sourceId]} - 未選擇檔案！`
        );
      }
    });
    uploadGroups$?.subscribe(
      (res) => {
        if (res.type === HttpEventType.Response) {
          alert($localize`:@fileUploadSuccess:檔案上傳完成！`);
          this.isUploading = false;
          this.closeDialog(true);
        }
      },
      () => {
        alert($localize`:@@fileUploadFailure:檔案上傳失敗！`);
        this.isUploading = false;
        this.closeDialog(true);
      }
    );
  }

  updateMarquee(): void {
    let signage = new FormData();
    signage.append("id", this.signage.id);
    signage.append("page", this.signage.page);
    signage.append("source", "marqueetext");
    signage.append(
      "text",
      this.media.get("text").value
        ? this.media.get("text").value
        : $localize`:@@enterMarqueeText:請輸入跑馬燈文字`
    );
    let update$ = this.displayService
      .updateSignage(signage)
      .pipe(tap(() => alert($localize`:@@updateSuccess:修改成功！`)));
    this.displayService
      .getList()
      .pipe(
        concatMap((list) => {
          if (list.find((signage) => signage.id === this.signage.id)) {
            return update$;
          } else {
            // if (confirm(`目前修改的樣式不存在，是否要改為新增？`)) {
            //   return update$;
            // } else {
            alert(
              $localize`:@@modifySignageFailure:${this.signage.id} 修改失敗：原因：檔案不存在。`
            );
            this.closeDialog(true);
            return EMPTY;
            // }
          }
        })
      )
      .subscribe();
  }

  updateCarouselTime(): void {
    let signage = new FormData();
    signage.append("id", this.signage.id);
    signage.append("page", this.signage.page);
    signage.append("interval", this.media.get("interval").value);
    let update$ = this.displayService
      .updateSignage(signage)
      .pipe(tap(() => alert($localize`:@@updateSuccess:修改成功！`)));
    this.displayService
      .getList()
      .pipe(
        concatMap((list) => {
          if (list.find((signage) => signage.id === this.signage.id)) {
            return update$;
          } else {
            // if (confirm(`目前修改的樣式不存在，是否要改為新增？`)) {
            //   return update$;
            // } else {
            alert(
              $localize`:@@modifySignageFailure:${this.signage.id} 修改失敗：原因：檔案不存在。`
            );
            this.closeDialog(true);
            return EMPTY;
            // }
          }
        })
      )
      .subscribe();
  }

  previewFile(fileId: string): void {
    // this.displayService.getFile(fileId).subscribe(
    //   (res) => {
    //     window.open(URL.createObjectURL(res), "_blank");
    //   },
    //   (error) => {
    //     if (ERROR_CODE[error.statusText]) {
    //       alert(`預覽失敗！原因：檔案${ERROR_CODE[error.statusText]}。`);
    //     } else {
    //       alert(`預覽失敗！`);
    //     }
    //     this.closeDialog(true);
    //   }
    // );
    window.open(`/resource-center/${fileId}`, "_blank");
  }

  deleteFile(sourceId: string, media: SourceMedia): void {
    if (confirm($localize`:@@confirmDeleteFile:確認是否要刪除檔案${media.id}?`))
      this.displayService
        .deleteFile(this.signage.id, sourceId, media.uuid)
        .subscribe(
          () => {
            alert($localize`:@@deleteSuccess:刪除成功！`);
            let files = this.signage.source.find(
              (source) => source.id === sourceId
            ).file;
            files.splice(
              files.findIndex((file) => file === media),
              1
            );
          },
          (error) => {
            if (ERROR_CODE[error.statusText]) {
              alert(
                $localize`:@@deleteFileFailure:刪除失敗！原因：檔案${
                  ERROR_CODE[error.statusText]
                }。`
              );
            } else {
              alert($localize`:@@deleteFailure:刪除失敗！`);
            }
            this.closeDialog(true);
          }
        );
  }
  closeDialog(isUpdated: boolean): void {
    this.ref.close(isUpdated);
  }
}
