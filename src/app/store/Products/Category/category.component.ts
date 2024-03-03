import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { Subject } from "rxjs";
import { CategoryService } from "@services/category.service";
import { environment } from "@environments/environment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { asIconPicker } from "jquery-asIconPicker";
import { NotifierService } from "angular-notifier";
import { StateService } from "@uirouter/angular";

@Component({
  selector: "category",
  templateUrl: "./category.component.html",
  styleUrls: ["./category.component.scss"],
})
export class CategoryComponent implements AfterViewInit, OnInit {
  pageData: any;
  showSpinner: boolean = true;
  CategoryForm: FormGroup;
  categoryList: any[];
  filters: any;
  totalProducts: Number;
  active: Number;
  pagination: Number[];
  allIcons: any;
  rsrcTitle: String = "Category";
  itemSelected: boolean = false;
  noCategories: Boolean = false;
  public searchBlock: any;
  public dataBlock: any;
  constructor(
    private _catService: CategoryService,
    private fb: FormBuilder,
    private _notify: NotifierService,
    private $state: StateService
  ) {
    this.totalProducts = 0;
    this.pageData = {
      title: "Product Settings",
      loaded: true,
      breadcrumbs: [
        {
          title: "Category List",
        },
      ],
    };
    this.filters = {
      limit: 10,
      skip: 0,
      sorttype: "created_at",
      sortdirection: -1,
    };
    this.pagination = [1];
    this.active = 1;
  }
  ngOnInit() {
    this.inflateData();
    this.CategoryForm = this.fb.group({
      id : [""],
      name: ["", Validators.required],
    });
  }
  inflateData() {
    let that = this;
    this._catService.getAll().subscribe((resp) => {
      that.showSpinner = false;
      if (resp.data.length == 0) {
        that.noCategories = true;
      } else that.noCategories = false;
      this.categoryList = resp.data;
    });
  }
  ngAfterViewInit(): void {
    let that = this;
    $(".dropdown-menu-right a").on("click", function (event) {
      $(".dropdown-menu-right .dropdown-item").removeClass("active");
      $(this).addClass("active");
      $("#records").text($(this).text());
      that.filters.limit = parseInt($(this).text());
      that.inflateData();
    });
    $(".filter").on("click", function (event) {
      $("#sortBy").text("Order By " + $(this).text());
      that.filters.sortdirection = that.filters.sortdirection * -1;
      that.inflateData();
    });

    //taking care of check boxes
    setTimeout(() => {
      console.log("Checkbox length ", $(".item:checkbox").length);
      $(".item:checkbox").on("change", () => {
        that.itemSelected = $(".item:checkbox:checked").length > 0;
      });
    }, 200);
  }
  ngOnDestroy(): void {}
  checkAll(evt): void {
    $(".custom-control-input")
      .not(evt.target)
      .prop("checked", evt.target.checked);
  }

  addCategory() {
    console.log("New Category added", this.CategoryForm.value);
    if (this.CategoryForm.invalid) {
      $("#Label").css("border-color", "red");
      $("#iconSelected").css("border-color", "red");
      return false;
    }
    (this.CategoryForm.value.id ? this._catService.update(this.CategoryForm.value) : this._catService.create(this.CategoryForm.value))
    .subscribe(
      (resp) => {
        this.inflateData();
        this._notify.notify("success", resp.data.name + " saved");
        this.CategoryForm.reset();
        $(".selectedIcon").removeClass("selectedIcon");
      },
      (err) => {
        this._notify.notify(
          "error",
          err.error
            ? err.error.error
            : "Something went wrong while saving category"
        );
      }
    );
  }
  resetIconSearch() {
    this.CategoryForm.reset();
  }
  //returns true if user has selected an item
  anItemSelected() {
    return $(".item:checkbox:checked").length > 0;
  }
  checkBoxStateChange() {
    this.itemSelected = this.anItemSelected();
  }
  deleteCategory() {
    let allTobeDeleted = $(".item:checkbox:checked");
    if(allTobeDeleted.length == 0){
      this._notify.notify("error", "Please select at least one category");
      return;
    }
    //getting all the ids from the data attribute of the input check boxes
    let arrIds = allTobeDeleted.map((inpObj) => {
      return $(allTobeDeleted.get(inpObj)).attr("data_id");
    });
    let Ids = arrIds.get();

    //ask the server to delete these
    this._catService.deleteCategory(Ids).subscribe(
      (resp) => {
        this._notify.notify("success", "Deletion success");
        this.inflateData();
      },
      (err) => {
        this._notify.notify("error", err.error.error);
      }
    );
  }
  search(event) {
    this.showSpinner = true;
    //Getting the search value
    let queryString = event.target.value;

    this._catService.search(queryString).subscribe(
      (resp) => {
        console.log("category search response ", resp);

        this.categoryList = resp;
        this.showSpinner = false;
      },
      (error) => {
        console.log("An error occured", error);
        this.showSpinner = false;
      }
    );
  }

  singleSelected() {
    return $(".catInp.custom-control-input:checked").length == 1;
  }
  editCategory() {
    if(!this.singleSelected()){
      this._notify.notify("error", "Please select one category");
      return ;
    }
    let id = $(".custom-control-input:checked").attr("data_id");
    let name = $(".custom-control-input:checked").attr("data_name");
    console.log("id is ::", id);
    this.CategoryForm.patchValue({id , name});
    ($(".bd-example-modal-lg") as any).modal("show")
  }
  resetForm(){
    this.CategoryForm.reset();
  }
}
