import { NgModule } from '@angular/core';
import {  UIRouterModule } from "@uirouter/angular";
import { Transition } from "@uirouter/core";

//================= User Defined Modules ========================//


//=================]]]]>::User Defined Components::<[[[[[=============//

import { MainComponent } from './../main/main.component';

//****************::Product Component::**************//
import { ProductComponent } from './../Products/Product/product.component';
import { ProductDetailComponent } from './../Products/ProductDetail/productDetail.component';
import { ProductFormComponent } from   './../Products/ProductForm/productForm.component';
import { CategoryComponent } from   '@store/Products/Category/category.component';

//****************::Order Component::****************//
import { OrderDetailComponent  } from './../orders/OrderDetail/orderDetail.component';
import { OrderFormComponent } from './../orders/OrderForm/orderForm.component';
import { OrderComponent} from './../orders/Order/order.component';
import { Page404Component} from '@/Page404/Page404.component';
import { BrandComponent } from '@store/brands/Brand/brand.component';
import { ClientComponent } from '@store/users/Client/client.component';
import { ClientFormComponent } from '@store/users/ClientForm/clientform.component';

//********* States which are protected from general public  ***************//
const STATES  = [

  {
    name : 'store.productdetail' ,
    url : '/productDetail/:id' ,
    component : ProductDetailComponent,
    resolve : [
      {
        token : "id",
        deps : [Transition] ,
        resolveFn : resolveFunc
      }
    ]
  },
  {
    name : 'store.productForm' ,
    url : '/productForm/:id' ,
    component : ProductFormComponent,
    params: {
        id : { squash: true, value: null },
    }
  }
    ,{
      name : 'store.product' ,
      url : '/product' ,
      component : ProductComponent
    },
    {
      name : 'store.category' ,
      url : '/category' ,
      component : CategoryComponent
    } ,
    {
      name : 'store.order' ,
      url : '/order' ,
      component : OrderComponent
    } ,
    {
      name : 'store.orderdetail' ,
      url : '/orderDetail/:id' ,
      component : OrderDetailComponent ,
      resolve : [
        {
          token : "id",
          deps : [Transition] ,
          resolveFn : resolveOrderDetailFunc
        }
      ]
    } ,
    {
      name : 'store.batchForm' ,
      url : '/batchForm/:id' ,
      component : BrandComponent ,
      resolve : [
        {
          token : "id",
          deps : [Transition] ,
          resolveFn : resolveBatchFormFunc
        }
      ]
    } ,
    {
      name : 'store.clientform' ,
      url : '/clientform/:id' ,
      component : ClientComponent ,
      params: {
            id : { squash: true, value: null },
      }
    },{
      name : 'store.guarantorform' ,
      url : '/guarantorform/:id' ,
      component : ClientFormComponent ,
      params: {
            id : { squash: true, value: null },
      }
    },
    {
      name : 'store.orderform' ,
      url : '/orderForm' ,
      component : OrderFormComponent
    },
    {
      name : 'store' ,
      url: '',
      component : MainComponent,
      redirectTo: 'store.dashboard',
      children : [
      ]
    }
  ];
@NgModule({
  imports : [UIRouterModule.forChild({states : STATES })] ,
  exports : [ UIRouterModule ] ,
  declarations : []
})
export class RoutingModule{}

export function resolveFunc(trans : Transition ){
        return trans.params().id
}
export function resolveOrderDetailFunc(trans : Transition ){
        return trans.params().id
}
export function resolveBatchFormFunc(trans : Transition ){
        return trans.params().id
}
