import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy , Input , Output , EventEmitter} from '@angular/core';
declare var $: any;

import { Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , FormArray  , FormControl , Validators  } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NotifierService } from "angular-notifier";
import { PermissionService } from "@services/permissions.service";
import { isThisSecond } from 'date-fns';
declare var contextMenu: any;

class DataTablesResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}

@Component({
  'selector':'installments',
  'templateUrl':'./installments.component.html',
  'styleUrls':['./installments.component.scss']
})

export class InstallmentsComponent implements AfterViewInit, OnInit  {
  @ViewChild(DataTableDirective  , {static : false})
  dtElement : DataTableDirective;
  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();
  pageData : any;
  InstallmentForm : FormGroup ;
  EditInstallmentForm : FormGroup ;
  EditInstallmentId : any ;

  installmentList :any[];
  @Input() order_id : any;
  @Input('order') order_data : any;
  @Input('showForm') showForm : boolean ;
  @Output('dataUpdated') newData : EventEmitter<any> = new EventEmitter();
  rsrcTitle : String = "Installments";
  beingAdded : boolean = false;
  beingEditInstlmnt : boolean = false;
  beingDeletedInstlmnt : boolean = false;
  beingEditFormSubmit : boolean = false;
  printInProgress : boolean = false ;
  printAllInProgress : boolean = false ;
  currentlySelectedForPrint : String  = "";

  //for print component
  installmentData : any;
  //To track updates in a form
  updatedValues : any;

  constructor (private http:HttpClient , private fb:FormBuilder ,
    private datePipe : DatePipe ,
    private notifier : NotifierService , public _permService : PermissionService){
  }
  ngOnInit(){
    let that = this ;
    this.InstallmentForm=
    new FormGroup({
      installment_amount:new FormControl( '' , [Validators.required , Validators.min(1)] ),
      next_installment_date:new FormControl(that.monthFromNow()),
      comment : new FormControl( '' , [Validators.required , Validators.minLength(3)])
    });


    //Edit installment form
    this.EditInstallmentForm=
    new FormGroup({
      amount:new FormControl( '' , [Validators.required , Validators.min(1)] ),
      next_installment_date:new FormControl(that.monthFromNow()),
      comment : new FormControl( '' , [Validators.required , Validators.minLength(3)])
    });

    console.log("Order id in installments " , this.order_id)
    //dataTable
    this.dtOptions = { };
  }
  formSubmitted()
  {
    let formData = this.InstallmentForm.value;
    formData.order = this.order_id;
    // console.log("Form of installments which is gonna submit is" , formData)
    let that = this;
    this.beingAdded = true ;

  }
  ngAfterViewInit() : void {

    let that = this;

    setTimeout(() => {
      //Datetime picker initializing
      (<any>$)("#nextInstallmentDate")
        .datepicker({
             autoclose: true,
             rtl: false,
             templates: {
               leftArrow: '<i class="simple-icon-arrow-left"></i>',
               rightArrow: '<i class="simple-icon-arrow-right"></i>'
             } ,
             format : "dd/mm/yyyy" ,
             startDate : "+2d",
           }).datepicker("update" , that.monthFromNow());
                  (<any>$)("#nextInstallmentDate").on("change" , function (event) {
                        that.InstallmentForm.controls.next_installment_date.setValue(event.target.value)
                  });

       //Modal edit installment datetime picker initializing
       $('#nextEditInstallmentDate').datepicker('setDate', new Date());
       (<any>$)("#nextEditInstallmentDate").on("change" , function (event) {
        that.EditInstallmentForm.controls.next_installment_date.markAsDirty();
        that.EditInstallmentForm.controls.next_installment_date.setValue(event.target.value)
       })


    }, 5000);
     this.fetchInfo(true)

     //data table
     //dataTable
     this.dtOptions =
       {
               lengthChange: false,
               searching: false,
               destroy: true,
               info: false,
               dom: '',
               pageLength: 6,
               language: {
                 paginate: {
                   first : "<<" ,
                   previous: "<i class='simple-icon-arrow-left'></i>",
                   next: "<i class='simple-icon-arrow-right'></i>" ,
                   last : ">>"
                 }
               },
               drawCallback: function () {
                 $($(".dataTables_wrapper .pagination li:first-of-type"))
                   .find("a")
                   .addClass("prev");
                 $($(".dataTables_wrapper .pagination li:last-of-type"))
                   .find("a")
                   .addClass("next");

                 $(".dataTables_wrapper .pagination").addClass("pagination-sm");


               }
             };

      //Initializing the context menu
      /*03.35. Context Menu */
      setTimeout(() => {
        console.log("Context menu" , $().contextMenu);
        if ($().contextMenu) {
          $.contextMenu({
            selector: ".instmnt",
            callback: function (key, options) {
              var m = "clicked: " + key;
            },
            events: {
              show: function (options) {
                var $list = options.$trigger.parents(".list");
                if ($list && $list.length > 0) {
                  $list.data("shiftSelectable").rightClick(options.$trigger);
                }
              }
            },
            items: {
              copy: {
                name: "Copy",
                className: "simple-icon-docs"
              },
              archive: { name: "Move to archive", className: "simple-icon-drawer" },
              delete: { name: "Delete", className: "simple-icon-trash" }
            }
          });
        };
      }, 6000);



  }
  fetchInfo(isFirstTime): void{
    let that = this
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    if( this.dtElement && this.dtElement.dtInstance)
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }


    monthFromNow(){
      let d= new Date();
      d.setMonth(d.getMonth()+1);
      return this.datePipe.transform(d , 'dd/MM/yyyy');
    }
    //Method to edit installment
    editInstlmnt(event , installment){
      //check if the event is laready triggered
      if(this.beingEditInstlmnt)
        return ;

      //getting the target id from parent button data attribute
      //The event will be called even if children of button are
      //clicked so handle it
      let id =
            $(event.target).hasClass('btn') ?
                $(event.target).attr('data') :
                  $(event.target).closest('button').attr('data');

      //Preloader spinning
      this.beingEditInstlmnt = true;

      //setting the time of installment to the
      //Set the edit installment form
      this.EditInstallmentForm.patchValue(installment);

      //setting the installment id
      this.EditInstallmentId = id;

      $('#nextEditInstallmentDate').datepicker('setDate', new Date(installment.next_installment_date));

      //installment edit modal open
      $('#installmentEditModal').modal('show');

      //Preloader spinning
      this.beingEditInstlmnt = false;
    }

    //Method to delete installment
    deleteInstlmnt(event){
      let that = this;
      //chekc if the event is already triggered
      if(this.beingDeletedInstlmnt)
        return ;

      //getting the target id from parent button data attribute
      //The event will be called even if children of button are
      //clicked so handle it

      let id =
            $(event.target).hasClass('btn') ?
                $(event.target).attr('data') :
                  $(event.target).closest('button').attr('data');


      //setting up the preloaders/spinners
      this.beingDeletedInstlmnt = true;
    }
    //Edit installment form submit
    editInstallmentFormSubmitted(){
      //setting the spinner to spinning
      this.beingEditFormSubmit =true;
      //Reseting the updatedValues
      this.updatedValues = {}

      //Getting to know what has changed in the form
      this.getUpdates(this.EditInstallmentForm , this.updatedValues)

      //Check if there is something to update
      if( jQuery.isEmptyObject(this.updatedValues)  )
      {
        this.notifier.notify("warning" , "Nothing to change.");
        this.beingEditFormSubmit = false;

        //Close the modal
        $('#installmentEditModal').modal('hide');
        return;
      }
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
    printAllPreviousInstallment(event){
      //getting the target id from parent button data attribute
      //The event will be called even if children of button are
      //clicked so handle it
      let installmentId =
            $(event.target).hasClass('btn') ?
                $(event.target).attr('data') :
                  $(event.target).closest('button').attr('data');

      console.log(event.target , "In print method"  , installmentId)
      //Setting the preloader in ui
      this.printAllInProgress = true;
      this.currentlySelectedForPrint = "PRINT_ALL_PREVIOUS";
      //Setting the installment id so that child receipt component can pick
      this.installmentData = { installmentId , currentlySelectedForPrint : this.currentlySelectedForPrint } ;
    }
    printInstallment(event){
      //getting the target id from parent button data attribute
      //The event will be called even if children of button are
      //clicked so handle it
      let installmentId =
            $(event.target).hasClass('btn') ?
                $(event.target).attr('data') :
                  $(event.target).closest('button').attr('data');

      console.log(event.target , "In print method"  , installmentId)
      //Setting the preloader in ui
      this.printInProgress = true;
      this.currentlySelectedForPrint = "PRINT_SINGLE";
      //Setting the installment id so that child receipt component can pick
      this.installmentData = { installmentId , currentlySelectedForPrint : this.currentlySelectedForPrint } ;

    }
    //This method is being called when child has fethed the data and now system is going to print
    goForPrint(event){
      //Un Setting the preloader in ui
      this.printAllInProgress = false;
      this.printInProgress = false;
      document.getElementById('printInitializer').click()
    }
}
