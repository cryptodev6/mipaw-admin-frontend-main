import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { environment } from '@environments/environment';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

//Animations module
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule  , HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule , FormsModule } from '@angular/forms';
import { MainRoutingModule } from "@/routing/routing.module";
import { Select2Module , Select2OptionData } from 'ng2-select2';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MomentModule } from 'angular2-moment';
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { ProgressBarModule } from "angular-progress-bar";

//***************:: Landing ::***************************//
import { LandingComponent } from './landing/landing.component';

//***************::Helpers ::***************************//
import { JwtInterceptor } from "@/helpers/jwt.interceptor";

//***************::Notifier options :: *****************//
import { customNotifierOptions } from "./store/UI/Toaster/notifier";

///Module Specific
import {DatePipe} from '@angular/common';

//*****************:: QR CODE  ::**********************//
import { NgQrScannerModule } from 'ngx-qr'; //scanner
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

//**************:: Redux Store ::*********************//

@NgModule({
  declarations: [
    LandingComponent
    ],
  imports: [
    BrowserAnimationsModule,
    NotifierModule.withConfig(customNotifierOptions) ,
    BrowserModule,
    Select2Module ,
    HttpClientModule ,
    FormsModule ,
    ReactiveFormsModule ,
    MainRoutingModule ,
    NgxSkeletonLoaderModule,
    MomentModule ,
    ProgressBarModule,
    NgQrScannerModule ,
    NgxQRCodeModule 
  ],
  providers: [
    { provide : HTTP_INTERCEPTORS , useClass : JwtInterceptor , multi : true },
    DatePipe
  ],
  bootstrap: [LandingComponent]
})
export class AppModule { }
