import { NgModule } from '@angular/core';
import {  UIRouterModule  } from "@uirouter/angular";

import { Page404Component} from '@/Page404/Page404.component';

import { LandingComponent } from '@/landing/landing.component';

const states = [
  {
    name : 'store.**' ,
    url : '/store' ,
    loadChildren :() => import('@store/store.module').then( result => result.StoreModule)
  },
  {
    name : 'login.**' ,
    url : '#login' ,
    loadChildren :() => import('@/auth/auth.module').then( result => result.AuthModule)
  } ,
  {
    name : 'auth' ,
    url : '/' ,
    loadChildren :() => import('@/auth/auth.module').then( result => result.AuthModule)
  }
]
@NgModule({
  imports : [UIRouterModule.forRoot({states : states , useHash : true })] ,
  exports : [ UIRouterModule ] ,
  declarations : []
})
export class MainRoutingModule{}