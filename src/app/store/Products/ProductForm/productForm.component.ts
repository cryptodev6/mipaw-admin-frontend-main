import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ViewEncapsulation,
  Input,
} from "@angular/core";
import { Transition } from "@uirouter/core";
import { Subject } from "rxjs";
import { productService } from "@services/product.service";
import { environment } from "@environments/environment";
import {
  FormGroup,
  FormArray,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Select2OptionData } from "ng2-select2";
import { CategoryService } from "@services/category.service";
import { NotifierService } from "angular-notifier";
import { StateService } from "@uirouter/angular";
import * as selectr from "@assets/js/vendor/selectr.js";
import { HttpService } from "@services/http.service";

import { AuthenticationService } from "@services/authentication.service";

interface color {
  name: string;
  rgb: string;
}
@Component({
  selector: "productForm",
  templateUrl: "./productForm.component.html",
  styleUrls: ["./productForm.component.scss"],
  encapsulation: ViewEncapsulation.None, //Use to disable CSS encapsulation for this component
})
export class ProductFormComponent implements AfterViewInit, OnInit {
  id: any;
  jsonRsp: any;
  pageData: any;
  ProductForm: FormGroup;
  title: String;
  prodImages: [];
  imagesSelected: any = [];
  active: Number;
  colors: color[];
  dropZone: any;
  public select2Options: any;
  public select2OptionsSingle: any;
  public categories: Array<Select2OptionData>;
  public groups: Array<Select2OptionData>;
  public units : any[] = [];
  public selectedCategories: string[] = [];
  fileUploadUrl: string = environment.apiUrl + "api/uploads/create";
  serverImagesPath: any = environment.apiUrl + "images";
  updatedValues: any;
  isInProgress: boolean = false;
  constructor(
    private _productService: productService,
    private _catService: CategoryService,
    private fb: FormBuilder,
    private notifier: NotifierService,
    private state: StateService,
    private _httpSv: HttpService,
    private _authService: AuthenticationService,
    private trans: Transition
  ) {}
  ngOnInit() {
    this.id = this.trans.params().id;
    this.title = (this.id ? "Update" : "Add") + " Product Form";

    this.ProductForm = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.minLength(4)]),
      product_group_id: new FormControl("", []),
      barcode: new FormControl("", []),
      sku: new FormControl("", []),
      description: new FormControl("", []),
      categories: new FormControl([], [Validators.required]),
      color_id: new FormControl("", [Validators.required]),
      measurement_unit_id: new FormControl("", [Validators.required]),

      images: new FormControl([]),
      sp: new FormControl("", [Validators.required, Validators.min(1)]),
      pp: new FormControl("", [Validators.required, Validators.min(1)]),
      otherInfo: new FormGroup({
        company: new FormControl("", [Validators.required]),
        description: new FormControl("", [Validators.required]),
        colors: new FormControl([]),
        inventory_type: new FormControl("Non Barcoded", [Validators.required]),
        universal_code: new FormControl(""),
        sku: new FormControl(""),
      }),
    });
    //Initializing select 2
    this.select2Options = {
      width: "100%",
      allowClear: true,
      placeholder: "",
      theme: "bootstrap",
    };
    this.select2OptionsSingle = {
      width: "100%",
      allowClear: true,
      placeholder: "",
      multiple: "multiple",
      theme: "bootstrap",
    };

    this.inflateData();
  }
  inflateData() {
    let that = this;

    //fetching the colors
    //Colors selectr
    this._catService.getAllColors().subscribe(
      (resp) => {
        //The nvaidation menu has been fetched and is in json format
        console.log("The color array which is fetched ", resp.data);

        // console.log("Altered colors array :: " , alteredData)
        that.colors = resp.data;
      },
      (err) => {
        console.log("Error log::" , err);
      }
    );

    //Fetching all categories
    this._catService.getAll().subscribe((resp) => {
      this.categories = resp.data;
    });
    this._productService.getGroups().subscribe((resp) => {
      this.groups = resp.data;
    });
    this._productService.getColors().subscribe((resp) => {
      this.colors = resp.data;
    });
    this._productService.getMeasurementUnits().subscribe((resp) => {
      this.units = resp.data;
    });

  }
  ngAfterViewInit(): void {
    let that = this;
    let access_token;
    //Taking care of authorization
    access_token = this._authService.token;

    let session = sessionStorage.getItem("session") || "";

    if ((<any>$()).dropzone && !$(".dropzone").hasClass("disabled")) {
      that.dropZone = (<any>$(".dropzone")).dropzone({
        url: that.fileUploadUrl,
        headers: { Authorization: "Bearer " + access_token, session },
        init: function () {
          this.on("addedfile", function (file) {
            that.isInProgress = true;
          });
          this.on("success", function (file, responseText) {
            that.notifier.notify("success", "File Uploaded.");
            let count = that.dropZone[0].dropzone.files.length;
            for (let i = 0; i < count; i++) {
              if (that.dropZone[0].dropzone.files[i].name == file.name) {
                that.dropZone[0].dropzone.files[i].uniqueId = responseText.id;
              }
            }
            that.isInProgress = false;
          });
          this.on("error", function (file, responseText) {
            that.notifier.notify("error", "Failed to upload!");
            that.isInProgress = false;
          });
        },
        thumbnailWidth: 160,
        previewTemplate:
          '<div class="dz-preview dz-file-preview mb-3"><div class="d-flex flex-row "><div class="p-0 w-30 position-relative"><div class="dz-error-mark"><span><i></i></span></div><div class="dz-success-mark"><span><i></i></span></div><div class="preview-container"><img data-dz-thumbnail class="img-thumbnail border-0" /><i class="simple-icon-doc preview-icon" ></i></div></div><div class="pl-3 pt-2 pr-2 pb-1 w-70 dz-details position-relative"><div><span data-dz-name></span></div><div class="text-primary text-extra-small" data-dz-size /><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div><div class="dz-error-message"><span data-dz-errormessage></span></div></div></div><a href="#/" class="remove" data-dz-remove><i class="glyph-icon simple-icon-trash"></i></a></div>',
      });
    }
  }
  ngOnDestroy(): void {}
  searchProducts(event: any): void {}
  formSubmitted() {
    if (this.ProductForm.invalid || this.colorsLength() == 0) {
      Object.keys(this.ProductForm.controls).forEach((key) => {
        this.ProductForm.controls[key].markAsDirty();
      });
      Object.keys((<any>this.ProductForm.controls.otherInfo).controls).forEach(
        (key) => {
          (<any>this.ProductForm.controls.otherInfo).controls[
            key
          ].markAsDirty();
        }
      );
      return;
    }
    //Showing spinner
    this.isInProgress = true;
    //Check if the product is supposed to be updated
    if (this.id) {
      this.updateProductFormSubmit();
      return;
    }
    //making a json object to send
    let data = this.ProductForm.value;

    //getting the dropzone files
    let dropzoneFiles = this.dropZone[0].dropzone.files;
    let tmpDrp = dropzoneFiles.map((img) => img.uniqueId);

    //getting the images from library selected section
    data.images = tmpDrp.concat([]);

    //Adding the colors to the form
    let selectedColors = $(".list-group-item.selected");
    data.otherInfo.colors = [];
    for (let index = 0; index < selectedColors.length; index++) {
      const col = selectedColors[index];
      data.otherInfo.colors.push((<any>col.children[0]).style.backgroundColor);
    }
    console.log('dddddd',data)

    //get the categories selected by the user
    this._productService.create(data).subscribe(
      (resp) => {
        this.notifier.notify("success", "Product Successfuly added.");
        this.state.go("store.product");
        this.isInProgress = false;
      },
      (error) => {
        console.log("error", error.error.message);
        this.notifier.notify("error", error.error.message);
        this.isInProgress = false;
      }
    );
  }
  //In case the user is here to update product
  updateProductFormSubmit() {
    //Using component variable to keep track of only the updated values
    this.updatedValues = {};

    //Identifying keys to update
    this.getUpdates(this.ProductForm, this.updatedValues);

    //check if user has edited the product
    //getting the dropzone files
    let dropzoneFiles = this.dropZone[0].dropzone.files;
    let tmpDrp = dropzoneFiles.map((img) => img.uniqueId);

    let tmpSfl = [].map((img) => img.label);

    //getting the images from library selected section
    if (tmpDrp.concat(tmpSfl).length)
      this.updatedValues.images = tmpDrp
        .concat(tmpSfl)
        .concat(this.imagesSelected);

    //In case we have to adjust otherInfo
    let flagOtherInfo = false;

    if (
      (<any>$)("#selectColor").val().length ||
      (this.updatedValues.otherInfo &&
        (this.updatedValues.otherInfo.model ||
          this.updatedValues.otherInfo.company ||
          this.updatedValues.otherInfo.colors))
    ) {
      if (this.updatedValues.otherInfo == undefined)
        this.updatedValues.otherInfo = {};
      this.updatedValues.otherInfo.model = (<any>(
        this.ProductForm.controls.otherInfo
      )).controls.model.value;
      this.updatedValues.otherInfo.company = (<any>(
        this.ProductForm.controls.otherInfo
      )).controls.company.value;
      this.updatedValues.otherInfo.inventory_type = (<any>(
        this.ProductForm.controls.otherInfo
      )).controls.inventory_type.value;
      flagOtherInfo = true;
    }
    //Getting the colors
    if ((<any>$)("#selectColor").val().length || flagOtherInfo) {
      //Since user has selected some color
      this.updatedValues.colors = [];

      //Adding the colors to the form
      let selectedColors = $(".list-group-item.selected");
      for (let index = 0; index < selectedColors.length; index++) {
        const col = selectedColors[index];
        this.updatedValues.colors.push(
          (<any>col.children[0]).style.backgroundColor
        );
      }
    }

    //Checking the categories
    let tempSelectedCategories = this.ProductForm.controls.categories.value.map(
      (elem) => elem.icon
    );

    if (jQuery.isEmptyObject(this.updatedValues)) {
      this.notifier.notify("warning", "Nothing to change.");
      this.state.go("store.product");
      return;
    }

    //get the categories selected by the user
    this._productService.update(this.id, this.updatedValues).subscribe(
      (resp) => {
        this.isInProgress = false;
        this.notifier.notify("success", "Product Successfuly updated.");

        this.state.go("store.product");
      },
      (error) => {
        this.isInProgress = false;
        console.log("error", error.error.message);
        this.notifier.notify("error", error.error.message);
      }
    );
  }
  updateCategories($evt) {
    this.ProductForm.controls.categories.setValue(
      $evt.data.map((category) => {
        return { name: category.text, icon: category.id };
      })
    );
  }
  updateGroups($evt) {
    const id = $evt.data[0].id || '';
    this.ProductForm.controls.product_group_id.setValue(id);
  }
  updateColor($evt) {
    const id = $evt.data[0].id || '';
    this.ProductForm.controls.color_id.setValue(id);
    console.log("Product form " , this.ProductForm.value );
  }
  //helper method from hex to rgb
  hexToRGB(h) {
    let r = "0",
      g = "0",
      b = "0";

    // 3 digits
    if (h.length == 4) {
      r = "0x" + h[1] + h[1];
      g = "0x" + h[2] + h[2];
      b = "0x" + h[3] + h[3];

      // 6 digits
    } else if (h.length == 7) {
      r = "0x" + h[1] + h[2];
      g = "0x" + h[3] + h[4];
      b = "0x" + h[5] + h[6];
    }

    return "rgb(" + +r + "," + +g + "," + +b + ")";
  }
  searchColor(col) {
    let allOpts = $(".colorOpt");
    let allLst = $(".list-group-item");
    let noMatch = true;

    let index = 0;
    for (index = 0; index < allOpts.length; index++) {
      const element = allOpts[index];
      if (element.innerHTML.search(col) == -1) $(allLst[index]).hide();
      else {
        $(allLst[index]).show();
        noMatch = false;
      }
    }
    if (noMatch) $(".no-matching-options").show();
    else $(".no-matching-options").hide();
  }
  colorsLength() {
    return $(".list-group-item.selected").length;
  }

  removeImage(img, event) {
    let elem = event.target;
    //Filtering local array
    this.imagesSelected = this.imagesSelected.filter(
      (iteratingImg) => img != iteratingImg
    );
    this.isInProgress = true;

    //Removing this image from product
    this._productService.remove(this.id).subscribe(
      (resp) => {
        //Since the image is remove now adjust the UI
        $(elem).closest(".cardImgParent").fadeOut();
        this.isInProgress = false;
      },
      (error) => {
        this.isInProgress = false;
        this.notifier.notify("error", error.error);
      }
    );
  }

  //Get the updated form control values only
  getUpdates(
    formItem: FormGroup | FormArray | FormControl,
    updatedValues,
    name?: string
  ) {
    if (formItem instanceof FormControl) {
      if (name && formItem.dirty) {
        if (updatedValues == undefined) updatedValues = [];
        updatedValues[name] = formItem.value;
      }
    } else {
      for (const formControlName in formItem.controls) {
        if (formItem.controls.hasOwnProperty(formControlName)) {
          const formControl = formItem.controls[formControlName];

          if (formControl instanceof FormControl) {
            this.getUpdates(formControl, updatedValues, formControlName);
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
  paginate() {
    var btns = document.querySelectorAll(".btn");
    var paginationWrapper = document.querySelector(".pagination-wrapper");
    var bigDotContainer = document.querySelector(".big-dot-container");
    var littleDot = document.querySelector(".little-dot");

    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", btnClick);
    }

    function btnClick() {
      if (this.classList.contains("btn--prev")) {
        paginationWrapper.classList.add("transition-prev");
      } else {
        paginationWrapper.classList.add("transition-next");
      }

      var timeout = setTimeout(cleanClasses, 500);
    }

    function cleanClasses() {
      if (paginationWrapper.classList.contains("transition-next")) {
        paginationWrapper.classList.remove("transition-next");
      } else if (paginationWrapper.classList.contains("transition-prev")) {
        paginationWrapper.classList.remove("transition-prev");
      }
    }
  }
}
