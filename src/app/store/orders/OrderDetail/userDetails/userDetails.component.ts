import { Component,OnInit,OnDestroy,AfterViewInit,Input , OnChanges} from "@angular/core";
import { orderDetailService } from '@services/orderDetails.service';

@Component({
  selector:"userDetails",
  templateUrl:"./userDetails.component.html",
  styleUrls:["./userDetails.component.scss"]
})

export class UserDetailsComponent  implements OnInit , AfterViewInit ,OnDestroy  , OnChanges{

  @Input() user_id;
  userData:any;
  rsrcTitle : String = "Users";
  constructor(private _orderDetailServices : orderDetailService ) {

  }

  ngOnInit():void
  {
    if(this.user_id)
      this.getUserData();
  }

  ngOnChanges(changes){
    // console.log("Changes recieved in client details ," , changes)
      if(changes.user_id && changes.user_id.currentValue)
      {
        this.user_id = changes.user_id.currentValue
        this.getUserData();
      }
  }
  ngAfterViewInit():void
  {

  }
  ngOnDestroy():void
  {

  }

  getUserData()
  {
    // this._clientService.viewDetail( this.client_id)
    //   .subscribe(
    //     response =>
    //     {

    //       this.userData = response;

    //       console.log("Client details in orders:" , response);


    //     },
    //     error => {
    //     console.log(error)
    //     })
  }
}
