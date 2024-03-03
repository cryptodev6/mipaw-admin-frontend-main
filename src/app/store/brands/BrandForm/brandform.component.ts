import {Component , OnInit , AfterViewInit} from '@angular/core';
import { FormBuilder , FormGroup , FormControl ,FormArray  , Validators } from '@angular/forms';
declare var $: any;
import { NotifierService } from "angular-notifier";
import { StateService } from '@uirouter/angular';
import { Transition } from "@uirouter/core";

@Component({
  selector : 'brandform',
  templateUrl: './brandform.component.html',
  styleUrls: ['./brandform.component.scss']
})
export class BrandFormComponent implements OnInit , AfterViewInit{
  pageData : any;
  BrandForm : FormGroup ;
  id : any  ;
  opInProgress : Boolean = false;
  updatedValues : any;

  constructor(private fb:FormBuilder , private notifier : NotifierService ,
            private $state : StateService , private trans:Transition ){
    this.pageData = {
      title: 'Brand Form',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Brand'
        },
        {
          title: 'Client Form'
        }
      ]
    };

  }
  ngOnInit(){
    this.id = this.trans.params().id;
    this.pageData.title = (this.id ? "Update": "Add")+" Client Form";


    let that = this ;
    this.BrandForm = this.fb.group({
      name: ['' , Validators.required ],
      phone: ['' , Validators.required ], 
      address: [''],
      cnic :['', Validators.required ],
      father_name :[''],
      father_cnic:['']
    })

  }
  ngAfterViewInit(){
    if(this.id)
    {
      this.fetchBrandInfo();
    }
  }
  fetchBrandInfo() {
    throw new Error('Method not implemented.');
  }
  addClient(){
      let that = this;
      this.opInProgress = true;

      //In case the form is suppose to update
      if(this.id)
        {
          this.updateClient();
          return ;
        }
      //hide both failed and success idons
      $(".icon").fadeOut();
  }
  //Method to update client
  updateClient(){
    //Using component variable to keep track of only the updated values
    this.updatedValues = {};

    //Identifying keys to update
    this.getUpdates(this.BrandForm , this.updatedValues);

    //Check if there is something to update
    if( jQuery.isEmptyObject(this.updatedValues)  )
    {
      this.notifier.notify("warning" , "Nothing to change.");
      this.opInProgress = false;
      //Show failed icon
      $(".icon.fail").fadeIn();
      this.$state.go('store.client');
      return;
    }
  }
  inpPhone(event)
    {
      let keyCode  = event.which;
      let str = event.target.value;

      if(str.length > 11 && keyCode !=8)
        {
          event.preventDefault();
          return ;
        }

      //If its not a number prvenet from writing
      if( keyCode < 48 || keyCode > 57)
        event.preventDefault();

      if(str.length == 4)
        event.target.value = str+="-";
      // console.log(event ,  , "Key code phone")
    }
    inputCNIC(event){
      let keyCode  = event.which;
      let str = event.target.value;

      if(str.length > 14 && keyCode !=8)
        {
          event.preventDefault();
          return ;
        }

      //If its not a number prevent from writing
      if( keyCode < 48 || keyCode > 57)
        event.preventDefault();

      if(str.length == 5 || str.length == 13 )
        event.target.value = str+="-";
      }

      //Get the updated form control values only
      getUpdates(formItem: FormGroup | FormArray | FormControl,updatedValues, name?: string) {

        if (formItem instanceof FormControl) {
          if (name && formItem.dirty) {
            if(updatedValues == undefined )
              updatedValues = [];
            updatedValues[name] = formItem.value;
          }
        } else {
          for (const formControlName in formItem.controls) {

            if (formItem.controls.hasOwnProperty(formControlName)) {
              const formControl = formItem.controls[formControlName];

              if (formControl instanceof FormControl) {
                this.getUpdates(formControl, updatedValues , formControlName);

              } else if (
                formControl instanceof FormArray &&
                formControl.dirty &&
                formControl.controls.length > 0
              ) {
                updatedValues[formControlName] = [];
                this.getUpdates(formControl, updatedValues[formControlName]);
              } else if (formControl instanceof FormGroup && formControl.dirty) {
                updatedValues[formControlName] = {};
                this.getUpdates(formControl, updatedValues[formControlName]);
              }
            }
          }
        }
      }
      deleteClient(){
        // this._brandService
        //   .remove(this.id)
        //     .subscribe(
        //         resp=>{
        //           //Client deleted
        //           this.notifier.notify("success", resp.message );
        //         } ,
        //         error=>{
        //           this.notifier.notify("error", error.error.message );
        //           console.log("Error occured" , error)
        //         })
      }

      enableFormFields(){
        this.BrandForm.enable();
      }
}
