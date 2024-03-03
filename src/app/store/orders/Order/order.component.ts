import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewEncapsulation,
} from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject, Subscription } from "rxjs";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "@environments/environment";
import { DatePipe } from "@angular/common";
import { StateService } from "@uirouter/angular";
import { Observable, of, fromEvent } from "rxjs";
import { AuthenticationService } from "@services/authentication.service";
import {
  debounceTime,
  map,
  distinctUntilChanged,
  filter,
} from "rxjs/operators";
declare var $: any;

class DataTablesResponse {
  data: any[];
  draw: number;
}
@Component({
  selector: "order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class OrderComponent implements AfterViewInit, OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  @ViewChild("ordersSearch", { static: true }) ordersSearchInput: ElementRef;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  pageData: any;
  noOrders: boolean = false;
  rsrcTitle: String = "Installment Orders";
  static beingSearched: boolean = false;
  ajaxFirstCall: boolean = true;
  //For optimization in case a request is already made cancel that
  ajaxCallSubscription: any;
  static dataLengthChanged: boolean = true;
  //Pagination data
  static numOrders: any = "Displaying 1-10 of 40 orders";
  //Search filters
  filtersHidden: boolean = true;
  filtersJSON: any = {};

  public keyActions: { [key: string]: (evt) => void } = {
    "k--KeyF": this.searchTable,
  };
  dataBeingFetchedFirstTime: Boolean = true;

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private $state: StateService,
    private _authService: AuthenticationService
  ) {
    this.pageData = {
      title: "All Pending Orders",
      loaded: true,
      breadcrumbs: [
        {
          title: "Dashboard",
        },
        {
          title: "Orders List",
        },
      ],
    };
  }
  ngOnInit() {
    let that = this;
    //making an array to group data based on clients
    let groupedData = [];

    that.dtOptions = {
      serverSide: true,
      processing: true,
      pageLength: 10,
      searching: true,
      lengthChange: true,
      destroy: true,
      order: [[5, "desc"]],
      info: false,
      dom: '<"row view-filter"<"col-sm-12"<"float-left"l><"float-right"f><"clearfix">>>t<"row view-pager"<"col-sm-12"<"text-center"ip>>>',
      ajax: (dataTablesParameters: any, callback) => {
        if (this.ajaxCallSubscription) {
          this.ajaxCallSubscription.unsubscribe();
        }
        setInterval(() => {
          var $td = $('td[colspan="6"]'); // find the td element or elements to change.
          $td.attr("colspan", 1); // set the attribute to 4 for all the selected elements.
        }, 20);
        //Passing filters as well
        dataTablesParameters.filters = that.filtersHidden
          ? null
          : that.filtersJSON;

        this.ajaxCallSubscription = that.http
          .post<DataTablesResponse>(
            environment.apiUrl + "api/orders/lst",
            dataTablesParameters,
            {}
          )
          .subscribe((resp: any) => {
            //Removing all previous data
            groupedData = [];

            //Settng search spinner
            OrderComponent.beingSearched = false;
            //Order count spinner
            OrderComponent.dataLengthChanged = false;

            //in cse we have no orders
            // console.log(resp , "response")
            if (resp.total == 0 && that.ajaxFirstCall) 
            {
              this.noOrders = true;
            }
            //Ajax will make second and onward calls from this point on
            that.ajaxFirstCall = false;

            for (let i = 0; i < (resp.data || {}).orders.length; i++) {
              //this iteration object
              const orders = resp.data.orders;
              let objAtI = orders[i];

              let template = `<a href="javascript:void(0)" style="cursor:pointer;" data='${
                objAtI.order_id ? objAtI.order_id : ""
              }'
                                    class="badge badge-light mb-1 order-detail">
                                    View&nbsp;
                                    <span class="badge badge-light btn_order_loader spinner_${
                                      objAtI.order_id
                                    }" style="display:none;">
                                      <img src="assets/img/spinner.gif" class="btnorderLoader" style="width:10px;"/>
                                    </span>
                                    </a><br>`;
              //Making an id attribute
              // if client exists then client id else order id
              let idForRow = i;

              //Check if any order from same client already exists in array or not
              //No order exists for this client
              groupedData[idForRow] = objAtI;
              groupedData[idForRow].name = "Order#" + objAtI.order_id;
              //formatting the date
              groupedData[idForRow].order_date = this.datePipe.transform(
                objAtI.order_date,
                "dd.MM.yy hh:mm a"
              );
              groupedData[idForRow].allProducts = "";
              //Now up until now we had an order and against each order
              //We used to have products
              //But now we have to make changes such that for each order we justhave to append a batch
              //A batch is an order of a client taken during a session or an instant
              let products = objAtI.products.split(",");

              for (let j = 0; j < products.length; j++) {
                let tempProd = products[j].split("_");
                let template = `<a style="cursor:pointer;" data ='${tempProd[0]}' 
                    class="badge badge-light mb-1 product_detail">${tempProd[1]}&nbsp;
                                  <span class="badge badge-light">1</span>
                    </a><br>`;
                groupedData[idForRow].allProducts += template;
              }
              //Handle Total Payment
              groupedData[idForRow].total_amount = this.formatMoney(
                objAtI.total
              );

              //Handle Total Paid
              groupedData[idForRow].sub_total = this.formatMoney(
                objAtI.subtotal
              );

              //Handle discount
              groupedData[idForRow].discount = this.formatMoney(
                objAtI.discount
              );

              //Handle discount
              groupedData[idForRow].membership_discount = this.formatMoney(
                objAtI.membership_discount
              );
              //Handle discount
              groupedData[idForRow].shipping_cost = this.formatMoney(
                objAtI.shippingCost
              );
              //Handle discount
              groupedData[idForRow].referred_discount = this.formatMoney(
                objAtI.referred_discount
              );

              groupedData[idForRow].status = objAtI.status;

              groupedData[idForRow].user_name = objAtI.user_name;

              groupedData[idForRow].actions = groupedData[idForRow].actions
                ? groupedData[idForRow].actions + template
                : template;
            }
            //Making normalized array
            console.log(
              "Data after manipulation",
              JSON.parse(JSON.stringify(groupedData)),
              resp
            );
            that.dataBeingFetchedFirstTime = false;
            callback({
              recordsFiltered: resp.data.recordsTotal,
              recordsTotal: resp.data.recordsTotal,
              data: groupedData,
            });
            $("#overlay").hide();
          });
      },
      columns: [
        { data: "name" },
        { data: "allProducts" },
        { data: "total_amount" },
        { data: "sub_total" },
        { data: "discount" },
        { data: "membership_discount" },
        { data: "shipping_cost" },
        { data: "referred_discount" },
        { data: "status" },
        { data: "user_name" },
        { data: "order_date", className: "" },
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
      drawCallback: that.dtDrawCallBack,
      //data table options
    };
  }

  dtDrawCallBack() {
    let that = this;
    //Product click functionality
    (<any>$)(".product_detail").click(function (event) {
      let _id = event.target.attributes.data.nodeValue;
      that.$state.go("store.productdetail", { id: _id });
    });
    //Checkbox functionality
    // that.unCheckAllRows();
    $("#checkAllDataTables").prop("checked", false);
    $("#checkAllDataTables").prop("indeterminate", false).trigger("change");

    //Pagination previoius and next functionality
    $($(".dataTables_wrapper .pagination li:first-of-type"))
      .find("a")
      .addClass("prev");
    $($(".dataTables_wrapper .pagination li:last-of-type"))
      .find("a")
      .addClass("next");
    $(".dataTables_wrapper .pagination").addClass("pagination-sm");

    //Showing counts
    let api = $(this).dataTable().api();

    //Shosing drop down for selections
    $("#pageCountDatatable .dropdown-menu a").on("click", function (event) {
      //Showing spinner
      OrderComponent.dataLengthChanged = true;

      $(".dropdown-item").removeClass("active");
      $(this).addClass("active");
      $("#records").text($(this).text());
      api.page.len(parseInt($(this).text())).draw();
    });
    //Page records count
    console.log("Api info ", api.page.info());
    $("#pageCountDatatable span").html(
      "Displaying " +
        (api.page.info().start + 1) +
        "-" +
        api.page.info().end +
        " of " +
        api.page.info().recordsTotal +
        " orders"
    );
    OrderComponent.numOrders =
      "Displaying " +
      (api.page.info().start + 1) +
      "-" +
      api.page.info().end +
      " of " +
      api.page.info().recordsTotal +
      " orders";

    //Search datatable
    //search datatable functionality init
    fromEvent($("#searchDatatable"), "keyup")
      .pipe(
        //get value
        map((event: any) => {
          return event.target.value;
        }),

        //If character length is greater then two
        // , filter(res => res.length > -1  )

        //Time in milliseconds between key events
        debounceTime(1000),

        //If previous query is different from current
        distinctUntilChanged()

        //subscription for response
      )
      .subscribe((text: string) => {
        OrderComponent.beingSearched = true;
        api.search(text).draw();
      });
  }
  get beingSearched() {
    return OrderComponent.beingSearched;
  }
  get dataLengthChanged() {
    return OrderComponent.dataLengthChanged;
  }
  get numOrders() {
    return OrderComponent.numOrders;
  }
  ngAfterViewInit(): void {
    let that = this;

    this.dtTrigger.next();

    this.dtElement.dtInstance.then((dtInstance) => {
      (<any>dtInstance).on("click", "tbody tr .order-detail", function () {
        console.log("Whats this ", (<any>$)(this).attr("data"));
        let order_id = (<any>$)(this).attr("data");
        that.$state.go("store.orderdetail", { id: order_id });
      });
    });
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // alert("here");

      dtInstance.clear().draw();
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
  //helper
  unCheckAllRows() {
    $("#datatableRows tbody tr").removeClass("selected");
    $("#datatableRows tbody tr .custom-checkbox input")
      .prop("checked", false)
      .trigger("change");
  }
  checkAllRows() {
    $("#datatableRows tbody tr").addClass("selected");
    $("#datatableRows tbody tr .custom-checkbox input")
      .prop("checked", true)
      .trigger("change");
  }
  getSelectedRows() {
    //Getting Selected Ones
    //    console.log(this.$dataTableRows.rows('.selected').data());
  }
  controlCheckAll() {
    var anyChecked = false;
    var allChecked = true;
    $("#datatableRows tbody tr .custom-checkbox input").each(function () {
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
  showProductDetail(event, obj) {
    let _id = event.target.attributes.data.nodeValue;
    console.log("State is ::", obj.$state, "Id is", _id);
    this.$state.go("store.productdetail", { id: _id });
    console.log("on show detail", _id);
  }
  formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i = parseInt(
        (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
      ).toString();
      let j = i.length > 3 ? i.length % 3 : 0;

      return (
        negativeSign +
        (j ? i.substr(0, j) + thousands : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
        (decimalCount
          ? decimal +
            Math.abs(amount - <any>i)
              .toFixed(decimalCount)
              .slice(2)
          : "")
      );
    } catch (e) {
      console.log(e);
    }
  }

  //Filters Work
  toggleFilters(toSet) {
    this.filtersHidden = toSet;
    if (toSet) $(".responsive-background").hide("slow");
    else $(".responsive-background").show("slow");
  }
  applyFilters(val) {
    this.filtersJSON = {};
    //Getting all keys first
    Object.keys(val)
      //Getting all values as array
      .map((k) => {
        if (val[k].trim() != "") this.filtersJSON[k] = val[k];
      });
    //Filtering non-null values
    // console.log("Filters object" , this.filtersJSON);

    // this.rerender();4
    this.dtTrigger.next();
  }

  private searchTable(): void {
    $("#searchDatatable").focus().css("border", "2px solid #145388");
  }
}
