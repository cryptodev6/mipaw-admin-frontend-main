import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';

import { RoutingModule } from "./routing/routing.module";
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { customNotifierOptions } from "./UI/Toaster/notifier";

import { Select2Module , Select2OptionData } from 'ng2-select2';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MomentModule } from 'angular2-moment';

//To show tree view
import { NestableModule } from 'ngx-nestable';
import {ProgressBarModule} from "angular-progress-bar";

//==================:: Helpers ::=============================//
import { DeviceDetectorService } from 'ngx-device-detector';

//=================]]]]>::User Defined Components::<[[[[[=============//
import { MainComponent } from './main/main.component';

//****************::Sign in Moduele :: ***************//

//****************::Product Component::**************//
import { ProductsModule } from './Products/products.module';

//****************::Order Component::****************//
import { OrdersModule } from './orders/orders.module';


//***************::Auth service being sjared in whole module ::****************//
import { AuthenticationService } from '@services/authentication.service';

//**************::Modal Module ::*****************//

import { AlertService } from '@services/alert.sevice';

import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

import { UIModule } from './UI/ui.module';
import { BrandsModule } from './brands/brands.module';
@NgModule({
  declarations: [
    MainComponent ,
    ],
  imports: [
    NotifierModule.withConfig(customNotifierOptions) ,
    Select2Module ,
    FormsModule ,
    ReactiveFormsModule ,
    RoutingModule ,
    NgxSkeletonLoaderModule,
    MomentModule ,
    ProgressBarModule,
    CommonModule ,
    NestableModule,
    ProductsModule ,
    BrandsModule ,
    OrdersModule ,
    UIModule ,
    ConfirmationPopoverModule.forRoot({
         confirmButtonType: 'danger', // set defaults here
         focusButton: 'confirm',
   })
  ],
  providers: [
    AuthenticationService,
    DeviceDetectorService,
    AlertService
  ],
  bootstrap: [MainComponent],
  exports : []
})
export class StoreModule { }
