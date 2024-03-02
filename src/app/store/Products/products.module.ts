import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from '@ui/ui.module';

import { ReactiveFormsModule  } from '@angular/forms';
import { Select2Module , Select2OptionData } from 'ng2-select2';
import { RoutingModule } from './../routing/routing.module';
import { NotifierModule , NotifierOptions } from "angular-notifier";
import { customNotifierOptions } from "./../UI/Toaster/notifier";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
//*****************:: QR CODE  ::**********************//
import { NgQrScannerModule } from 'ngx-qr';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ProductComponent } from '@store/products/Product/product.component';
import { ProductDetailComponent } from '@store/products/ProductDetail/productDetail.component';
import { ProductFormComponent } from '@store/products/ProductForm/productForm.component';
import { CategoryComponent } from '@store/products/Category/category.component';

@NgModule({
  declarations: [ ProductComponent , ProductDetailComponent , ProductFormComponent  , CategoryComponent ],
  imports: [
    NotifierModule.withConfig(customNotifierOptions) ,
    CommonModule,
    ReactiveFormsModule ,
    Select2Module ,
    RoutingModule,
    NgxSkeletonLoaderModule,
    UIModule,
    NgQrScannerModule,
    NgxQRCodeModule
  ],
  exports : [
  ]
})
export class ProductsModule { }
