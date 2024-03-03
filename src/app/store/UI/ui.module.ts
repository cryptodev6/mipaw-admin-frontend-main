import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgComponent } from "@ui/Image/img.component";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Preloader } from '@ui/preloader/preloader.component';
import { AlertComponent } from './Alert/alert.component';
import { SafeHtmlPipe } from './Pipes/raw.pipe';

@NgModule({
  declarations: [ ImgComponent , Preloader , AlertComponent , SafeHtmlPipe],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule

  ],
  exports : [
    ImgComponent ,
    Preloader,
    NgxSkeletonLoaderModule,
    AlertComponent,
    SafeHtmlPipe
  ]
})
export class UIModule { }
