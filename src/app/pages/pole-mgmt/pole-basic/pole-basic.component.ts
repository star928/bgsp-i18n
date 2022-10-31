import { PoleManageData } from "./../../../shared/model/pole.model";
import { PoleService } from "../../../shared/service/pole/pole.service";
import { NbDialogService } from "@nebular/theme";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { PoleData } from "../../../shared/model/pole.model";
import { SavePoleComponent } from "./save-pole/save-pole.component";
import { cloneDeep } from "lodash";
import { AuthService } from "../../../shared/service/auth/auth.service";

@Component({
  selector: "ngx-pole-basic",
  templateUrl: "./pole-basic.component.html",
  styleUrls: ["./pole-basic.component.scss"],
})
export class PoleBasicComponent implements OnChanges, OnInit {
  @Input() polesManageData: Array<PoleManageData>;
  @Output() onUpdated: EventEmitter<boolean> = new EventEmitter<boolean>();

  // ng2-Smart-table
  source: LocalDataSource = new LocalDataSource();
  settings: Object;
  // ng2-Smart-table

  constructor(
    private authService: AuthService,
    private dialogService: NbDialogService,
    private poleService: PoleService
  ) {
    this.createTableSettings();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["polesManageData"]) {
      this.source.load(this.polesManageData);
    }
  }

  ngOnInit(): void {
    this.source.load(this.polesManageData);
  }

  createTableSettings(): void {
    this.settings = {
      mode: "external",
      hideHeader: true,
      hideSubHeader: false,
      noDataMessage: $localize`:@@noData:無資料`,
      actions: {
        columnTitle: $localize`:@@action:操作`,
        add: this.authService.isManager(),
        edit: this.authService.isManager(),
        delete: false,
        position: "left",
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      columns: {
        number: {
          title: $localize`:@@smartPoleNumber:智慧桿編號`,
          type: "string",
          filter: true,
        },
        enable: {
          title: $localize`:@@smartPole:智慧桿`,
          type: "string",
          filter: true,
        },
        light_enable: {
          title: $localize`:@@smartLight:智慧照明`,
          type: "string",
          filter: true,
        },
        environment_enable: {
          title: $localize`:@@environment:環境感測`,
          type: "string",
          filter: true,
        },
        player_enable: {
          title: $localize`:@@mediaPlayer:投放設備`,
          type: "string",
          filter: true,
        },
        solar_enable: {
          title: $localize`:@@solar:儲能系統`,
          type: "string",
          filter: true,
        },
        // player_screen: {
        //   title: "看板開關",
        //   type: "string",
        //   filter: true,
        // },
      },
      pager: {
        display: true,
        perPage: 7,
        filter: false,
      },
    };
  }

  openDialog(pole?: PoleManageData): void {
    if (pole) {
      let poleManageData = this.polesManageData.find(
        (data) => data.number === pole.number
      );
      this.dialogService
        .open(SavePoleComponent, {
          context: {
            poleManageData: poleManageData,
            polesManageData: this.polesManageData,
            type: $localize`:@@modify:修改`,
          },
        })
        .onClose.subscribe((isUpdated) => {
          if (isUpdated) {
            this.onUpdated.emit(true);
          }
        });
    } else {
      this.dialogService
        .open(SavePoleComponent, {
          context: {
            polesManageData: this.polesManageData,
            type: $localize`:@@create:新增`,
          },
        })
        .onClose.subscribe((isUpdated) => {
          if (isUpdated) {
            this.onUpdated.emit(true);
          }
        });
    }
  }

  deletePole(deletePole: PoleData): void {
    if (
      confirm(
        $localize`:@@confirmDeletePole:確定要刪除 ${deletePole.number} 嗎？`
      )
    ) {
      this.poleService.deletePole(deletePole.uuid).subscribe(
        () => {
          alert(
            $localize`:@@deletePoleSuccess:智慧桿 ${deletePole.number} 刪除成功！`
          );
          this.onUpdated.emit(true);
        },
        () => {
          alert(
            $localize`:@@deletePoleFailure:智慧桿 ${deletePole.number} 刪除失敗！`
          );
        }
      );
    }
  }
}
