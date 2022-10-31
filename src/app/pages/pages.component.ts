import { Component, OnInit } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { MENU_ITEMS_ADMIN, MENU_ITEMS_MANAGER } from './pages-menu';


@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit {

  menu: Array<NbMenuItem>;

  ngOnInit(): void {
    let accessType: string = sessionStorage.getItem('AccessType');
    if (accessType) {
      if (accessType === 'admin') {
        this.menu = MENU_ITEMS_ADMIN;
      } else if (accessType === 'manager') {
        this.menu = MENU_ITEMS_MANAGER;
      }
    }
  }
}
