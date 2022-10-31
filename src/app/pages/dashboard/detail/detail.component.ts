import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NbDialogService } from "@nebular/theme";
import * as L from "leaflet";
import { LocalDataSource } from "ng2-smart-table";
import { Subscription } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import { ICON_PATH } from "../../../shared/const/file-path";
import { DeviceData } from "../../../shared/model/device.model";
import { AlarmService } from "../../../shared/service/alarm/alarm.service";
import { PoleService } from "../../../shared/service/pole/pole.service";
import { PoleData } from "./../../../shared/model/pole.model";

@Component({
  selector: "ngx-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class DetailComponent implements OnInit, OnDestroy {
  // Table Data
  settings = {
    mode: "external",
    hideSubHeader: true,
    noDataMessage: $localize`:@@noData:無資料`,
    actions: {
      columnTitle: $localize`:@@action:操作`,
      add: false,
      edit: false,
      delete: false,
      position: "right",
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    columns: {
      date: {
        title: $localize`:@@eventDate:事件日期`,
        type: "string",
        filter: true,
      },
      type: {
        title: $localize`:@@featureType:功能名稱`,
        type: "string",
        filter: true,
      },
      status: {
        title: $localize`:@@status:狀態`,
        type: "string",
        filter: true,
      },
    },
    pager: {
      display: true,
      perPage: 3,
    },
  };

  // Theme
  themeSubscription: any;
  // SmartPole
  smartPoleId: string;

  // 地址
  location: string;
  notFound = false;

  poleData$: Subscription;
  poleData: PoleData;

  // Map
  map: L.Map;
  mapOptions: L.MapOptions;

  // icon folder path
  icon_folder_path = "assets/icons/BaoGao_Icon/SVG/";
  // icon folder path End

  // Device Data Start
  connectStates: Array<DeviceData>;
  smartLights: Array<DeviceData>;
  envSensors: Array<DeviceData>;
  saveEnergys: Array<DeviceData>;
  // Device Data End

  // Table Source
  source: LocalDataSource = new LocalDataSource();
  alarmList: Array<Object>;
  alarmList$: Subscription;
  // Icon Data
  icon_data = ICON_PATH;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private poleService: PoleService,
    private dialogService: NbDialogService,
    private alarmService: AlarmService
  ) {
    this.smartPoleId = this.route.snapshot.paramMap.get("id");
    this.getPoleData();
  }

  ngOnInit(): void {
    if (!this.poleData) {
      this.router.navigateByUrl("/");
    }
  }

  ngOnDestroy(): void {
    if (this.alarmList$) {
      this.alarmList$.unsubscribe();
    }
    if (this.poleData$) {
      this.poleData$.unsubscribe();
    }
  }

  // 電桿基本資料 Start
  getPoleData(): void {
    this.poleData$ = this.poleService.polesData$
      .pipe(
        map((data) => data.find((pole) => pole.number === this.smartPoleId)),
        tap((data) => {
          if (data) {
            this.poleData = data;
            this.setMap(data);
            this.setLocation(data);
            this.setConnectStates(data);
            this.setSmartLightData(data);
            this.setEnvSensorsData(data);
            this.setSaveEnergys(data);
          } else {
            this.notFound = true;
          }
        }),
        concatMap((data) => {
          return this.alarmService.alarmList$.pipe(
            map((alarmList) =>
              alarmList.filter((alarm) => alarm["id"] === data.number)
            )
          );
        })
      )
      .subscribe((alarmList) => this.source.load(alarmList));
  }
  // 電桿基本資料 End

  // Leaflet Start
  setMap(poleData: PoleData): void {
    this.mapOptions = {
      layers: [
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution:
              '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> © <a href="https://carto.com/about-carto/">CARTO</a>',
          }
        ),
      ],
      zoom: 17,
      center: L.latLng({
        lat: poleData.geoLocation["lat"],
        lng: poleData.geoLocation["lng"],
      }),
    };
  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.createMarker(this.poleData);
  }

  setMarkerColor(color: string): L.MarkerOptions {
    return {
      icon: L.icon({
        iconSize: [25, 41],
        iconAnchor: [10, 41],
        popupAnchor: [2, -40],
        iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      }),
    };
  }

  createMarker(poleData: PoleData): void {
    let markColor = "green";

    L.marker(
      [poleData.geoLocation["lat"], poleData.geoLocation["lng"]],
      this.setMarkerColor(markColor)
    ).addTo(this.map);
  }
  // Leaflet End

  // Set Device Data Start

  setLocation(PoleData: PoleData): void {
    let tempLocation = Object.keys(PoleData.location[0]);
    this.location = tempLocation.toString();
    tempLocation = PoleData.location[0][this.location][0];
    this.location += ", " + Object.keys(tempLocation).toString();
    tempLocation = tempLocation[Object.keys(tempLocation).toString()];
    this.location += ", " + tempLocation;
  }

  setConnectStates(poleData: PoleData): void {
    this.connectStates = [
      {
        name: "NB-IoT",
        iconPath: poleData.light_show
          ? !(
            poleData.light_show === "offline" &&
            (this.alarmService.isLegalLightTime(poleData.light_show_time) ||
              !this.alarmService.isLatestRecord(poleData.light_show_time))
          )
            ? this.icon_folder_path +
            this.icon_data["safe"]["connection"]["NB-IoT"]
            : this.icon_folder_path +
            this.icon_data["warning"]["connection"]["NB-IoT"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["connection"]["NB-IoT"],
        state: poleData.light_show
          ? poleData.light_show === "offline" &&
            (this.alarmService.isLegalLightTime(poleData.light_show_time) ||
              !this.alarmService.isLatestRecord(poleData.light_show_time))
            ? poleData.light_show
            : poleData.light_show + " " + $localize`:@@noPower:( 未供電 )`
          : "n/a",
      },
      {
        name: $localize`:@@player:多媒體播放器`,
        iconPath: poleData.player_show
          ? poleData.player_show === "online"
            ? this.icon_folder_path +
            this.icon_data["safe"]["connection"]["media"]
            : this.icon_folder_path +
            this.icon_data["warning"]["connection"]["media"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["connection"]["media"],
        state: poleData.player_show ? poleData.player_show : "n/a",
      },
      {
        name: $localize`:@@gateway:物聯網閘道器`,
        iconPath:
          poleData.environment_show ||
            poleData.solar_show ||
            poleData.holder_show
            ? poleData.environment_show === "online" ||
              poleData.solar_show === "online" ||
              poleData.holder_show === "online"
              ? this.icon_folder_path +
              this.icon_data["safe"]["connection"]["gateway"]
              : this.icon_folder_path +
              this.icon_data["warning"]["connection"]["gateway"]
            : this.icon_folder_path +
            this.icon_data["disabled"]["connection"]["gateway"],
        state:
          poleData.environment_show ||
            poleData.solar_show ||
            poleData.holder_show
            ? poleData.holder_show
            : "n/a",
      },
    ];
  }

  setSmartLightData(poleData: PoleData): void {
    this.smartLights = [
      {
        name: $localize`:@@voltage:電壓`,
        iconPath: poleData.v
          ? this.icon_folder_path +
          this.icon_data["safe"]["smart-light"]["volt"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["smart-light"]["volt"],
        state:
          poleData.v && poleData.light_show === "online"
            ? poleData.v + " V"
            : "n/a",
      },
      {
        name: $localize`:@@current:電流`,
        iconPath: poleData.c
          ? this.icon_folder_path +
          this.icon_data["safe"]["smart-light"]["current"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["smart-light"]["current"],
        state:
          poleData.c && poleData.light_show === "online"
            ? poleData.c + " mA"
            : "n/a",
      },
      {
        name: $localize`:@@brightness:亮度`,
        iconPath: poleData.b
          ? this.icon_folder_path +
          this.icon_data["safe"]["smart-light"]["brightness"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["smart-light"]["brightness"],
        state:
          poleData.b && poleData.light_show === "online"
            ? poleData.b + " %"
            : "n/a",
      },
      {
        name: $localize`:@@power:功率`,
        iconPath: poleData.p
          ? this.icon_folder_path +
          this.icon_data["safe"]["smart-light"]["power-consumption"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["smart-light"]["power-consumption"],
        state:
          poleData.p && poleData.light_show === "online"
            ? poleData.p + " W"
            : "n/a",
      },
    ];
  }

  setEnvSensorsData(poleData: PoleData): void {
    this.envSensors = [
      {
        name: $localize`:@@temperature:溫度`,
        iconPath: poleData.t
          ? this.icon_folder_path +
          this.icon_data["safe"]["env-sensor"]["temperature"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["env-sensor"]["temperature"],
        state: poleData.t ? poleData.t + " °C" : "n/a",
      },
      {
        name: $localize`:@@humidity:濕度`,
        iconPath: poleData.rh
          ? this.icon_folder_path +
          this.icon_data["safe"]["env-sensor"]["humidity"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["env-sensor"]["humidity"],
        state: poleData.rh ? poleData.rh + " %" : "n/a",
      },
      {
        name: "PM2.5",
        iconPath: poleData["pm2.5"]
          ? this.icon_folder_path +
          this.icon_data["safe"]["env-sensor"]["pm2.5"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["env-sensor"]["pm2.5"],

        state: poleData["pm2.5"] ? poleData["pm2.5"] + " μg/m³" : "n/a",
      },
      {
        name: "PM10",
        iconPath: poleData.pm10
          ? this.icon_folder_path + this.icon_data["safe"]["env-sensor"]["pm10"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["env-sensor"]["pm10"],
        state: poleData.pm10 ? poleData.pm10 + " μg/m³" : "n/a",
      },
      {
        name: "O₃",
        iconPath: poleData.o3
          ? this.icon_folder_path + this.icon_data["safe"]["env-sensor"]["o3"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["env-sensor"]["o3"],
        state: poleData.o3 ? poleData.o3 + " ppm" : "n/a",
      },
      {
        name: "CO",
        iconPath: poleData.co
          ? this.icon_folder_path + this.icon_data["safe"]["env-sensor"]["co"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["env-sensor"]["co"],
        state: poleData.co ? poleData.co + " ppm" : "n/a",
      },
      {
        name: "NO₂",
        iconPath: poleData.no2
          ? this.icon_folder_path + this.icon_data["safe"]["env-sensor"]["no2"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["env-sensor"]["no2"],
        state: poleData.no2 ? poleData.no2 + " ppm" : "n/a",
      },
      {
        name: "SO₂",
        iconPath: poleData.so2
          ? this.icon_folder_path + this.icon_data["safe"]["env-sensor"]["so2"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["env-sensor"]["so2"],
        state: poleData.so2 ? poleData.so2 + " ppm" : "n/a",
      },
    ];
  }

  setSaveEnergys(poleData: PoleData): void {
    this.saveEnergys = [
      {
        name: $localize`:@@inputCurrent:充電電流`,
        iconPath: poleData.ai
          ? this.icon_folder_path +
          this.icon_data["safe"]["save-energy"]["current-charge"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["save-energy"]["current-charge"],
        state: poleData.ai ? poleData.ai + " mA" : "n/a",
      },
      {
        name: $localize`:@@inputVoltage:充電電壓`,
        iconPath: poleData.vi
          ? this.icon_folder_path +
          this.icon_data["safe"]["save-energy"]["volt-charge"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["save-energy"]["volt-charge"],
        state: poleData.vi ? poleData.vi + " V" : "n/a",
      },
      {
        name: $localize`:@@inputPower:充電功率`,
        iconPath: poleData.pi
          ? this.icon_folder_path +
          this.icon_data["safe"]["save-energy"]["power-charge"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["save-energy"]["power-charge"],
        state: poleData.pi ? poleData.pi + " W" : "n/a",
      },
      {
        name: $localize`:@@bc:電量`,
        iconPath: poleData.bc
          ? this.icon_folder_path +
          this.icon_data["safe"]["save-energy"]["battery"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["save-energy"]["battery"],
        state: poleData.bc ? poleData.bc + " %" : "n/a",
      },
      {
        name: $localize`:@@outputCurrent:放電電流`,
        iconPath: poleData.ao
          ? this.icon_folder_path +
          this.icon_data["safe"]["save-energy"]["current-discharge"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["save-energy"]["current-discharge"],
        state: poleData.ao ? poleData.ao + " mA" : "n/a",
      },
      {
        name: $localize`:@@outputVoltage:放電電壓`,
        iconPath: poleData.vo
          ? this.icon_folder_path +
          this.icon_data["safe"]["save-energy"]["volt-discharge"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["save-energy"]["volt-discharge"],
        state: poleData.vo ? poleData.vo + " V" : "n/a",
      },
      {
        name: $localize`:@@outputPower:放電功率`,
        iconPath: poleData.po
          ? this.icon_folder_path +
          this.icon_data["safe"]["save-energy"]["power-discharge"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["save-energy"]["power-discharge"],
        state: poleData.po ? poleData.po + " W" : "n/a",
      },
      {
        name: $localize`:@@batteryTemperature:電池溫度`,
        iconPath: poleData.bt
          ? this.icon_folder_path +
          this.icon_data["safe"]["save-energy"]["temperature"]
          : this.icon_folder_path +
          this.icon_data["disabled"]["save-energy"]["temperature"],
        state: poleData.bt ? poleData.bt + " °C" : "n/a",
      },
    ];
  }
  // Set Device Data End

  maximizePhoto(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog);
  }
}
