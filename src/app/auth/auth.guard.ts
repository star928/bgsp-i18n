import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (sessionStorage.getItem('AccessType')) {
      return true;
    } else {
      this.router.navigateByUrl('auth/login');
    }
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (sessionStorage.getItem('AccessType') === 'manager') {
      return true;
    } else if (sessionStorage.getItem('AccessType') === 'admin') {
      if (
        childRoute.routeConfig.path === '**' || childRoute.routeConfig.path === 'sysconfig' || childRoute.routeConfig.path === 'acmanage') {
        return true;
      } else {
        this.router.navigateByUrl('pages/sysconfig');
      }
    }
  }

}
