import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select2Module , Select2OptionData } from 'ng2-select2';

import { UIModule } from '@ui/ui.module';
import { DataTablesModule } from 'angular-datatables';
import { OrderComponent} from './Order/order.component';
import { OrderDetailComponent } from './OrderDetail/orderDetail.component';
import { SummaryOrderDetailComponent } from './OrderDetail/summary/summaryOrder.component';

//Order Details Components
import { ProductsDetailComponent } from './OrderDetail/productsDetail/productsDetail.component';
import { OrderFormComponent } from './../orders/OrderForm/orderForm.component';
import { RoutingModule } from './../routing/routing.module';
import { OrderClientStepComponent} from './OrderForm/client/clientStep.component';
import { OrderGuarantorStepComponent} from './OrderForm/guarantors/guarantorsStep.component';
import { OrderProductsStepComponent} from './OrderForm/products/productsStep.component';
import { SelectComponentForOrder } from './OrderForm/SelectComponent/select.component';
import { ConfirmOrderComponent } from './OrderForm/modal/confirmModal.component';

//**************::  Utilities  ::*******************//
import { UtilsModule } from "@utilities/utils.module";

import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserDetailsComponent } from './OrderDetail/userDetails/userDetails.component';

@NgModule({
  declarations: [ SummaryOrderDetailComponent ,OrderComponent , OrderFormComponent, OrderDetailComponent ,
    UserDetailsComponent ,ProductsDetailComponent , OrderClientStepComponent , OrderProductsStepComponent , 
    OrderGuarantorStepComponent  , SelectComponentForOrder , ConfirmOrderComponent ],
  imports: [
    CommonModule ,
    ReactiveFormsModule ,
    DataTablesModule  ,
    RoutingModule ,
    Select2Module ,
    UIModule ,
    UtilsModule,
    NgSelectModule ,
    FormsModule ,
    ConfirmationPopoverModule.forRoot({
         confirmButtonType: 'danger', // set defaults here
         focusButton: 'confirm',
   }),
  ]
})
export class OrdersModule { }
