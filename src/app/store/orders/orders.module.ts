import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select2Module , Select2OptionData } from 'ng2-select2';
import { NgxPrintModule } from 'ngx-print';

import { UIModule } from '@ui/ui.module';
import { DataTablesModule } from 'angular-datatables';
import { OrderComponent} from './Order/order.component';
import { OrderDetailComponent } from './OrderDetail/orderDetail.component';
import { InstallmentsComponent } from './OrderDetail/installments/installments.component';
import { SummaryOrderDetailComponent } from './OrderDetail/summary/summaryOrder.component';

//Order Details Components
import { OtherOrdersComponent } from './OrderDetail/otherOrders/otherOrders.component';
import { CLientDetailsComponent } from './OrderDetail/clientDetails/clientDetails.component';
import { GuarantorsDetailComponent } from './OrderDetail/guarantorsDetail/guarantorsDetail.component';
import { ProductsDetailComponent } from './OrderDetail/productsDetail/productsDetail.component';
import { OrderFormComponent } from './../orders/OrderForm/orderForm.component';
import { RoutingModule } from './../routing/routing.module';
import { OrderClientStepComponent} from './OrderForm/client/clientStep.component';
import { OrderGuarantorStepComponent} from './OrderForm/guarantors/guarantorsStep.component';
import { OrderProductsStepComponent} from './OrderForm/products/productsStep.component';
import { SelectComponentForOrder } from './OrderForm/SelectComponent/select.component';
import { ConfirmOrderComponent } from './OrderForm/modal/confirmModal.component';
import { ProductsModule } from './../Products/products.module';
import { BatchesComponent } from './OrderDetail/batches/batches.component';
import { WaiversComponent } from './OrderDetail/waivers/waivers.component';


//**************::  Utilities  ::*******************//
import { UtilsModule } from "@utilities/utils.module";


import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { CRMComponent } from './OrderDetail/CRM/crm.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [ SummaryOrderDetailComponent ,OrderComponent , OrderFormComponent, OrderDetailComponent , InstallmentsComponent,
    CLientDetailsComponent ,GuarantorsDetailComponent,ProductsDetailComponent ,
    OrderClientStepComponent , OrderProductsStepComponent , OrderGuarantorStepComponent  , SelectComponentForOrder ,
    ConfirmOrderComponent  , OtherOrdersComponent , BatchesComponent ,CRMComponent , WaiversComponent ],
  imports: [
    CommonModule ,
    ReactiveFormsModule ,
    DataTablesModule  ,
    RoutingModule ,
    ProductsModule ,
    Select2Module ,
    UIModule ,
    NgxPrintModule ,
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
