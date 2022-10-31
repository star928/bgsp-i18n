import { NbMenuItem } from "@nebular/theme";

export const MENU_ITEMS_ADMIN: Array<NbMenuItem> = [
  {
    title: $localize`:@@sysconfig:系統設定`,
    icon: "people-outline",
    link: "/pages/sysconfig",
    home: true,
  },
  {
    title: $localize`:@@acManage:帳號管理`,
    icon: "people-outline",
    link: "/pages/acmanage",
    home: true,
  },
];

export const MENU_ITEMS_MANAGER: Array<NbMenuItem> = [
  {
    title: "Dashboard",
    icon: "globe-outline",
    children: [
      {
        title: $localize`:@@smartPole:智慧桿`,
        icon: "layers-outline",
        link: "/pages/dashboard",
        home: true,
      },
      {
        title: $localize`:@@latestData:即時資料`,
        icon: "activity-outline",
        link: "/pages/data",
      },
    ],
  },
  {
    title: $localize`:@@reports:資料報表`,
    icon: "printer-outline",
    link: "/pages/reports",
  },
  {
    title: $localize`:@@spManage:智慧桿管理`,
    icon: "keypad-outline",
    children: [
      {
        title: $localize`:@@console:控制台`,
        link: "/pages/pole-mgmt",
        icon: "options-2-outline",
      },
      {
        title: $localize`:@@digitalSignage:數位看板`,
        icon: "monitor-outline",
        link: "/pages/digital-signage",
      },
    ],
  },
  {
    title: $localize`:@@history:歷程資料`,
    icon: "edit-outline",
    link: "/pages/history",
  },
  {
    title: $localize`:@@sysconfig:系統設定`,
    icon: "people-outline",
    link: "/pages/sysconfig",
  },
];
