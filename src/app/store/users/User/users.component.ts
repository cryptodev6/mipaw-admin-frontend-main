import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "@environments/environment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "@services/user.service";
declare var $: any;
import { NotifierService } from "angular-notifier";
import { StateService } from "@uirouter/angular";

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
}
@Component({
  selector: "users",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
})
export class UsersComponent implements AfterViewInit, OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  pageData: any;
  UserForm: FormGroup;
  userList: any[];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private $state: StateService,
    private _userService : UserService,
    private notifier: NotifierService,

  ) {
    this.pageData = {
      title: "All Users",
      loaded: true,
      breadcrumbs: [
        {
          title: "Dashboard",
        },
        {
          title: "Users List",
        },
      ],
    };
  }
  ngOnInit() {
    let that = this;
    this.UserForm = this.fb.group({
      name: ["", Validators.required],
      phone: ["", Validators.required],
      address: [""],
      cnic: ["", Validators.required],
      father_name: [""],
      father_cnic: [""],
    });

    that.dtOptions = {
      serverSide: true,
      processing: true,
      pageLength: 10,
      searching: true,
      lengthChange: true,
      destroy: true,
      info: false,
      dom: '<"row view-filter"<"col-sm-12"<"float-left"l><"float-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>',
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(
            environment.apiUrl + "api/profile/list",
            dataTablesParameters,
            {}
          )
          .subscribe((resp: any) => {
            this.userList = resp.data.list.map((user) => {
              let template = `<a href="javascript:void(0)" style="cursor:pointer;" data='${user.id}'
                                    class="badge badge-light mb-1 order-update">
                                    Update&nbsp;
                                    <span class="badge badge-light btn_order_loader spinner_update_${user.id}" style="display:none;">
                                      <img src="assets/img/spinner.gif" class="btnorderLoader" style="width:10px;"/>
                                    </span>
                              </a>
                              <a href="javascript:void(0)" style="cursor:pointer;" data='${user.id}'
                                    class="badge badge-light mb-1 order-delete">
                                    Delete&nbsp;
                                    <span class="badge badge-light btn_order_loader spinner_delete_${user.id}" style="display:none;">
                                      <img src="assets/img/spinner.gif" class="btnorderLoader" style="width:10px;"/>
                                    </span>
                              </a>`;
              return {
                ...user,
                actions: template,
              };
            });

            callback({
              recordsFiltered: resp.recordsTotal,
              recordsTotal: resp.recordsTotal,
              data: this.userList
            });
            $("#overlay").hide();
          });
      },
      columns: [
        { data: "id" },
        { data: "first_name" },
        { data: "last_name" },
        { data: "email" },
        { data: "actions" },
      ],
      language: {
        paginate: {
          first: "<<",
          last: ">>",
          previous: "<i class='simple-icon-arrow-left'></i>",
          next: "<i class='simple-icon-arrow-right'></i>",
        },
      },
      drawCallback: function () {
        //Datatable Api
        var api = $(this).dataTable().api();
        
        //end of setting

        $("#checkAllDataTables").prop("checked", false);
        $("#checkAllDataTables").prop("indeterminate", false).trigger("change");

        $($(".dataTables_wrapper .pagination li:first-of-type"))
          .find("a")
          .addClass("prev");
        $($(".dataTables_wrapper .pagination li:last-of-type"))
          .find("a")
          .addClass("next");
        $(".dataTables_wrapper .pagination").addClass("pagination-sm");

        $("#pageCountDatatable span").html(
          "Displaying " +
            (api.page.info().start + 1) +
            "-" +
            api.page.info().end +
            " of " +
            api.page.info().recordsTotal +
            " items"
        );

        $("#searchDatatable").on("change", function (event) {
          api.search($("#searchDatatable").val().toString()).draw();
        });
        //
        $("#pageCountDatatable .dropdown-menu a").on("click", function (event) {
          $(".dropdown-item").removeClass("active");
          $(this).addClass("active");
          $("#records").text($(this).text());
          api.page.len(parseInt($(this).text())).draw();
        });
      },
    };

    //data table options
  }
  ngAfterViewInit(): void {
    let that = this;
    this.dtTrigger.next();
    this.dtElement.dtInstance.then((dtInstance) => {
      (<any>dtInstance).on("click", "tbody tr .order-update", function () {
        console.log("Whats this ", (<any>$)(this).attr("data"));
        let user_id = (<any>$)(this).attr("data");
        that.$state.go("store.userform", { id: user_id });
      });
      (<any>dtInstance).on("click", "tbody tr .order-delete", function () {
        console.log("Whats this ", (<any>$)(this).attr("data"));
        let user_id = (<any>$)(this).attr("data");      
        that.deleteUser(user_id); 
      });

    });
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
  navigateToAddUserForm() {
    this.$state.go("store.userform");
  }
  
  async deleteUser(id) {
    try{
      $(".spinner_delete_"+id).show();
      const userDeleted : any = await this._userService.remove(id).toPromise();
      this.notifier.notify("success", "User has been deleted");
      this.rerender();
    }catch(error){
      this.notifier.notify("error", error.error .error);
    }finally{
      $(".spinner_delete_"+id).hide();
    }
  }
}
