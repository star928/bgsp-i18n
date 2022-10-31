import { Subscription } from "rxjs";
import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { NbThemeService } from "@nebular/theme";
import { color } from "echarts";

@Component({
  selector: "line-chart-lite",
  templateUrl: "./line-chart-lite.component.html",
  styleUrls: ["./line-chart-lite.component.scss"],
})
export class LineChartLiteComponent implements OnInit, OnDestroy {
  themeSubscription: Subscription;
  simpleLineOptions: any;

  @Input() title: string;
  @Input() data: Array<Array<string>>;

  constructor(private theme: NbThemeService) {}

  ngOnInit(): void {
    this.createSimpleLine(this.title, this.data);
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  createSimpleLine(title: string, data: Array<Array<string>>) {
    this.themeSubscription = this.theme.getJsTheme().subscribe((config) => {
      const colors: any = config.variables;
      const echarts: any = config.variables.echarts;
      let echartsBgColor: string;

      if (config.name === "dark") {
        echartsBgColor = "rgba(55, 66, 97, 0.8)";
      } else if (config.name === "default") {
        echartsBgColor = "antiquewhite";
      }

      this.simpleLineOptions = Object.assign(
        {},
        {
          backgroundColor: echartsBgColor,
          color: [colors.infoLight],
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross",
              label: {
                backgroundColor: echarts.tooltipBackgroundColor,
              },
            },
          },
          legend: {
            data: [title],
            textStyle: {
              color: echarts.textColor,
            },
            orient: "vertical",
            left: "left",
          },
          grid: {
            top: "30px",
            bottom: "0px",
            left: "10px",
            right: "45px",
            containLabel: true,
          },
          xAxis: [
            {
              name: "Hr",
              type: "time",
              boundaryGap: false,
              axisLine: {
                show: false,
                lineStyle: {
                  color: echarts.axisLineColor,
                },
              },
              axisLabel: {
                color: echarts.textColor,
                formatter: "{HH}",
              },
            },
          ],
          yAxis: [
            {
              type: "value",
              splitNumber: 2,
              axisLine: {
                show: true,
                lineStyle: {
                  color: echarts.axisLineColor,
                },
              },
              splitLine: {
                show: false,
                lineStyle: {
                  color: echarts.splitLineColor,
                },
              },
              axisLabel: {
                show: true,
                color: echarts.textColor,
              },
              axisTick: {
                show: false,
              },
            },
          ],
          series: [
            {
              name: title,
              type: "line",
              smooth: true,
              symbol: "none",
              data: data,
              lineStyle: { color: "#b7e09d" },
            },
          ],
        }
      );
    });
  }
}
