import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrandComponent } from './Brand/brand.component';
import { BrandFormComponent } from './BrandForm/brandform.component';
import { DataTablesModule } from 'angular-datatables';
import { UIModule } from '@ui/ui.module';

@NgModule({
  declarations: [
    BrandComponent,
    BrandFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTablesModule,
    UIModule
  ]
})
export class BrandsModule { }
