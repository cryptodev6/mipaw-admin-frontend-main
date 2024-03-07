import {Component , OnInit , ViewChild , AfterViewInit , OnDestroy} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
declare var $: any;
import { NotifierService } from "angular-notifier";
import { StateService } from '@uirouter/angular';

class DataTablesResponse{
  data :any[];
  draw :number ;
  recordsTotal : number;
  recordsFiltered : number;
}
@Component({
  selector : 'brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements AfterViewInit , OnInit{
  @ViewChild(DataTableDirective  , {static : false})
  dtElement : DataTableDirective;
  dtOptions : DataTables.Settings = {} ;
  dtTrigger: Subject<any> = new Subject();
  pageData : any;
  BrandForm : FormGroup ;
  clientList :any[];

  constructor(private http:HttpClient , private fb:FormBuilder ,
              private notifier : NotifierService, private $state : StateService){
    this.pageData = {
      title: 'All Brands',
      loaded: true,
      breadcrumbs: [
        {
          title: 'Dashboard'
        },
        {
          title: 'Brand List'
        }
      ]
    };

  }
  ngOnInit(){
    let that = this ;
    this.BrandForm = this.fb.group({
      name: ['' , Validators.required],
      phone: ['' , Validators.required]
      , address: ['']
      , cnic:['' , Validators.required],
      father_name : [''],
      father_cnic : ['']
    });

    that.dtOptions = {
        serverSide : true ,
        processing: true ,
        pageLength: 10 ,
        searching : true,
        lengthChange: true,
        destroy: true,
        info: false,
        dom: '<"row view-filter"<"col-sm-12"<"float-left"l><"float-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>',
        ajax : (dataTablesParameters: any, callback) =>{
				that.http.post<DataTablesResponse>(environment.apiUrl+'api/brands' , dataTablesParameters , { })
                      .subscribe((resp : any)=>{
                        const data = resp.data.rows.map(row=>{
                          return {...row , number : 'Brand#'+row.id}
                        })
              					this.clientList = data;

                        callback({
                          recordsFiltered:resp.data.count,
                          recordsTotal : resp.data.count,
                          data : data
                        });
  					$('#overlay').hide();
  				});
			   } ,
         columns : [ {data:'number'} , {data : 'name'} , {data: 'image_id'} , {data : 'brandImage'}] ,
        language: {
          paginate: {
            first : "<<",
            last: ">>" ,
            previous: "<i class='simple-icon-arrow-left'></i>",
            next: "<i class='simple-icon-arrow-right'></i>"
          }
        },
        drawCallback: function () {
          //Datatable Api
          var api = $(this).dataTable().api();

          //Setting onclick details
          (<any>$)("#clientsTable tbody tr").click(function(event) {
            //getting the dtata against the row
            let rData = api.rows($(event.target).closest("tr") ).data();

            if(rData && rData.length)
              {
                //Json data is actually at first index
                let data = rData[0];
                let _id = data._id;
                // that.$state.go('store.Brandform' , {id : _id})
                this.$state.transitionTo('store.Brandform', {
                  id : _id
                }, {
                    reload : true
                });
              }
          })
          //end of setting
          that.unCheckAllRows();

          $("#checkAllDataTables").prop("checked", false);
          $("#checkAllDataTables").prop("indeterminate", false).trigger("change");

          $($(".dataTables_wrapper .pagination li:first-of-type"))
            .find("a")
            .addClass("prev");
          $($(".dataTables_wrapper .pagination li:last-of-type"))
            .find("a")
            .addClass("next");
          $(".dataTables_wrapper .pagination").addClass("pagination-sm");

          console.log("Start of" ,api.page.info().start);
          console.log("Api " ,api);
          $("#pageCountDatatable span").html("Displaying " +(api.page.info().start + 1) + "-" + api.page.info().end + " of " + api.page.info().recordsTotal + " items");

          $("#searchDatatable").on("change", function (event) {
            api.search($("#searchDatatable").val().toString()).draw();
          });
          //
          $("#pageCountDatatable .dropdown-menu a").on("click", function (event) {
            $(".dropdown-item").removeClass("active");
            $(this).addClass("active");
            $("#records").text($(this).text() );
              api.page.len(parseInt($(this).text())).draw();
          });
          // initialize the context menu
          that.initContextMenu();

        }
      };

      $('#datatableRows tbody').on('click', 'tr', function () {
        $(this).toggleClass('selected');
        var $checkBox = $(this).find(".custom-checkbox input");
        $checkBox.prop("checked", !$checkBox.prop("checked")).trigger("change");
        that.controlCheckAll();
      });




      $("#checkAllDataTables").on("click", function (event) {
        var isCheckedAll = $("#checkAllDataTables").prop("checked");
        if (isCheckedAll) {
          that.checkAllRows();
        } else {
          that.unCheckAllRows();
        }
      });


    //data table options
  }
  ngAfterViewInit() : void {


    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
  //helper
  unCheckAllRows() {
    $('#datatableRows tbody tr').removeClass('selected');
    $('#datatableRows tbody tr .custom-checkbox input').prop("checked", false).trigger("change");
  }
  checkAllRows() {
    $('#datatableRows tbody tr').addClass('selected');
    $('#datatableRows tbody tr .custom-checkbox input').prop("checked", true).trigger("change");
  }
  getSelectedRows() {
          //Getting Selected Ones
      //    console.log(this.$dataTableRows.rows('.selected').data());
        }
    controlCheckAll() {
      var anyChecked = false;
      var allChecked = true;
      $('#datatableRows tbody tr .custom-checkbox input').each(function () {
        if ($(this).prop("checked")) {
          anyChecked = true;
        } else {
          allChecked = false;
        }
      });
      if (anyChecked) {
        $("#checkAllDataTables").prop("indeterminate", anyChecked);
      } else {
        $("#checkAllDataTables").prop("indeterminate", anyChecked);
        $("#checkAllDataTables").prop("checked", anyChecked);
      }
      if (allChecked) {
        $("#checkAllDataTables").prop("indeterminate", false);
        $("#checkAllDataTables").prop("checked", allChecked);
      }
    }
    addClient(){
      let that = this;
      $(".modal-footer .label").hide()
      $(".spinner").show()
    }
    //Initializing the contextv menu
    initContextMenu(){

      /*03.35. Context Menu */
      if ($().contextMenu) {
        $.contextMenu({
          selector: "#clientsTable tbody tr",
          callback: function (key, options) {
            var m = "clicked: " + key;
          },
          items: {
            copy: {
              name: "Copy",
              className: "simple-icon-docs",
              callback: function(key, opt){
                  alert("Clicked on " + key);
              }
            },
            archive: { name: "Move to archive", className: "simple-icon-drawer" },
            delete: { name: "Delete", className: "simple-icon-trash" }
          }
        });
      }else
        console.error("No Context menu")
    }
}
