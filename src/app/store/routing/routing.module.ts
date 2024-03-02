import { NgModule } from '@angular/core';
import {  UIRouterModule } from "@uirouter/angular";
import { Transition } from "@uirouter/core";

//================= User Defined Modules ========================//


//=================]]]]>::User Defined Components::<[[[[[=============//
import { MainComponent } from './../main/main.component';

//****************::Order Component::****************//
import { OrderDetailComponent  } from './../orders/OrderDetail/orderDetail.component';
import { OrderFormComponent } from './../orders/OrderForm/orderForm.component';
import { OrderComponent} from './../orders/Order/order.component';
import { BrandComponent } from '@store/brands/Brand/brand.component';
import { UsersComponent } from '@store/users/User/users.component';
import { UsersFormComponent } from '@store/users/UserForm/usersform.component';
import { ProductDetailComponent } from '@store/products/ProductDetail/productDetail.component';
import { ProductFormComponent } from '@store/products/ProductForm/productForm.component';
import { ProductComponent } from '@store/products/Product/product.component';
import { CategoryComponent } from '@store/products/Category/category.component';

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
      component : UsersComponent ,
      params: {
            id : { squash: true, value: null },
      }
    },{
      name : 'store.usersform' ,
      url : '/guarantorform/:id' ,
      component : UsersFormComponent ,
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
      redirectTo: 'store.order',
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
