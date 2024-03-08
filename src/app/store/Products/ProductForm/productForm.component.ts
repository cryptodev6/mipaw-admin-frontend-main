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
interface IMAGE {
  image_id : string ;
  mime : string ;
  order_level : number
  path : string
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
  public groups: Array<Select2OptionData>;
  public petTypes: Array<Select2OptionData>;
  public Brands: Array<Select2OptionData>;
  public units: any[] = [];
  public selectedGroup: string[] = [];
  public selectedPetType: string[] = [];
  public selectedBrands: string[] = [];
  fileUploadUrl: string = environment.apiUrl + "api/uploads/create";
  serverImagesPath: any = environment.apiUrl + "images/";
  updatedValues: any;
  isInProgress: boolean = false;
  selectedImages: IMAGE[];
  mySubject = new Subject();
  counter = 0;
  beingFetched: boolean;

  constructor(
    private _productService: productService,
    private _catService: CategoryService,
    private fb: FormBuilder,
    private notifier: NotifierService,
    private state: StateService,
    private _httpSv: HttpService,
    private _authService: AuthenticationService,
    private trans: Transition
  ) { }
  ngOnInit() {
    let _self = this;
    this.id = this.trans.params().id;
    this.title = (this.id ? "Update" : "Add") + " Product Form";
    if(this.id){
      this.mySubject.subscribe({
        next: value => {
            // Check if the counter is at the third value
            this.counter++;
            if (_self.counter > 4) {
              _self.getProductDetails();
            }
        }
    });
    }
    this.ProductForm = new FormGroup({
      product_group_id: new FormControl("", [Validators.required]),
      barcode: new FormControl("", []),
      sku: new FormControl("", []),
      name: new FormControl("", [Validators.required, Validators.minLength(4)]),
      color_id: new FormControl("", []),
      measurement_unit_id: new FormControl("", []),
      pet_type: new FormControl("", []),
      price: new FormControl("", [Validators.required, Validators.min(1)]),
      high: new FormControl("", []),
      long: new FormControl("", []),
      width: new FormControl("", []),
      weigth: new FormControl("", [Validators.required]),
      stock: new FormControl("", [Validators.required]),
      status: new FormControl(1, []),
      discount: new FormControl("", []),
      bestseller: new FormControl(0, []),
      brand_id: new FormControl("", [Validators.required]),
      tax: new FormControl("", []),
      order_level: new FormControl("", [])
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
  async getProductDetails() {
    try{
      if(this.beingFetched){
        return ;
      }
      this.beingFetched = true;
      let productDetails = await this._productService.getDetails(this.id).toPromise();
      productDetails = productDetails.data;
      const { images , ...attributes} = productDetails;
      this.selectedImages = images;
      this.ProductForm.patchValue(this._productService.mapObject(attributes) );
      console.log("Product details" , productDetails );
    }catch(error){
      console.log("An error occired" , error )
    }
    this.beingFetched = false;

  }
  inflateData() {
    let that = this;

    //fetching the colors
    //Colors selectr
    this._catService.getAllColors().subscribe(
      (resp) => {
        that.mySubject.next("");

        //The nvaidation menu has been fetched and is in json format
        console.log("The color array which is fetched ", resp.data);

        // console.log("Altered colors array :: " , alteredData)
        that.colors = resp.data;
        if(!that.id && that.colors && that.colors.length > 0){
          this.ProductForm.controls.color_id.setValue((that.colors[0] as any).id);
        }
      },
      (err) => {
        console.log("Error log::", err);
      }
    );

    this._productService.getGroups().subscribe((resp) => {
        that.mySubject.next("");
        this.groups = resp.data;
        if(!that.id && resp.data && resp.data.length > 0){
          this.ProductForm.controls.product_group_id.setValue((resp.data[0] as any).id);
        }
    });
    this._productService.getPetTypes().subscribe((resp) => {
        that.mySubject.next("");

      this.petTypes = resp.data;
      if(!that.id && resp.data && resp.data.length > 0){
        this.ProductForm.controls.pet_type.setValue((resp.data[0] as any).id);
      }
    });
    this._productService.getBrands().subscribe((resp) => {
        that.mySubject.next("");

      this.Brands = resp.data;
    });
    this._productService.getMeasurementUnits().subscribe((resp) => {
        that.mySubject.next("");
      this.units = resp.data;
      if(!that.id && resp.data && resp.data.length > 0){
        this.ProductForm.controls.measurement_unit_id.setValue((resp.data[0] as any).id);
      }
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
            console.log("File uploaded" , file , responseText );
            let count = that.dropZone[0].dropzone.files.length;
            for (let i = 0; i < count; i++) {
              if (that.dropZone[0].dropzone.files[i].name == file.name) {
                that.dropZone[0].dropzone.files[i].uniqueId = responseText.data.id;
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
  ngOnDestroy(): void { 
    this.selectedImages = [];
  }
  searchProducts(event: any): void { }
  formSubmitted() {
    console.log("Product form is valid" , this.ProductForm.valid , this.ProductForm.value , this.id );
    
    if (this.ProductForm.invalid ) {
      Object.keys(this.ProductForm.controls).forEach((key) => {
        this.ProductForm.controls[key].markAsDirty();
      });
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
    console.log("Product form current value" , data );
    //getting the dropzone files
    let dropzoneFiles = this.dropZone[0].dropzone.files;
    let tmpDrp = dropzoneFiles.map((img) => img.uniqueId);

    //getting the images from library selected section
    data.images = tmpDrp.concat([]);
    if(data.images.length == 0){
      this.notifier.notify("error", "Please upload atleast one image");

      return;
    }
    console.log("Whats in images" , data);
    data.image_default_id = data.images[0];
    this._productService.create(data).subscribe(
      (resp) => {
        this.notifier.notify("success", "Product Successfuly added.");
        this.state.go("store.product");
        this.isInProgress = false;
      },
      (error) => {
        console.log("error", error);
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

    if (jQuery.isEmptyObject(this.updatedValues)) {
      this.notifier.notify("warning", "Nothing to change.");
      this.state.go("store.product");
      return;
    }
    console.log("Update form submission " , this.id , ">>>>" , this.updatedValues , "----", this.imagesSelected , "<<<<<", this.selectedImages);
    let images : any[] = (this.selectedImages || []).concat(this.imagesSelected || []);
    images = images.map((image : any )=>(image.image_id || image.unique_id || image.id));
    const image_default_id = images.length ? images[0] : -1;
    this._productService.update(this.id, {...this.ProductForm.value , images , image_default_id  }).subscribe(
      (resp) => {
        this.isInProgress = false;
        this.notifier.notify("success", "Product Successfuly updated.");

        this.state.go("store.product");
      },
      (error) => {
        let errors = (error && error.error && error.error.error) ? error.error.error : [];
        console.log("Error" , error.error.error )
        // Beautified error message
        let errorMessage = "Validation errors:\n";
        console.log("::::" , errors );
        errors = this.isIterable(errors) ? errors : [];
        console.log("::::>" , errors );

        errors.forEach(error => {
            errorMessage += `${error.path}: ${error.msg}\n`;
        });
        this.isInProgress = false;
        console.log("error", error.error.message);
        this.notifier.notify("error", (typeof error.error.error == 'string') ? error.error.error : errorMessage);
      }
    );
  }
  isIterable(obj) {
    // checks for null and undefined
    if (obj == null) {
      return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
  }
  updateGroups($evt) {
    $evt.data[0] = $evt.data[0] || {id : null};
    const id = $evt.data[0].id || '';
    const name = $evt.data[0].name || '';
    this.ProductForm.controls.product_group_id.setValue(id);
    this.selectedGroup = name;
  }
  updatePetTypes($evt) {
    $evt.data[0] = $evt.data[0] || {id : null}
    const id = $evt.data[0].id || '';
    const type = $evt.data[0].type || '';
    this.ProductForm.controls.pet_type.setValue(id);
    this.selectedPetType = type;
  }
  updateBrands($evt) {
    $evt.data[0] = $evt.data[0] || {id : null}

    const id = $evt.data[0].id || '';
    const name = $evt.data[0].name || '';
    this.ProductForm.controls.brand_id.setValue(id);
    this.selectedBrands = name;
  }
  updateColor($evt) {
    $evt.data[0] = $evt.data[0] || {id : null}

    const id = $evt.data[0].id || '';
    this.ProductForm.controls.color_id.setValue(id);
    console.log("Product form ", this.ProductForm.value);
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

  removeImage(id, event) {
    let elem = event.target;
    console.log("Whats in images selected" , this.selectedImages.length );
    let dropzoneFiles = this.dropZone[0].dropzone.files;
    const totalImages = (this.selectedImages || []).concat(dropzoneFiles || []);
    console.log("Total images" , totalImages );
    if(totalImages.length == 1){
      this.notifier.notify("error", "You need to add another image before you can delete this image");
      return ;
    }
    //Filtering local array
    this.imagesSelected = this.imagesSelected.filter(
      (iteratingImg) => id != iteratingImg.image_id
    );
    this.isInProgress = true;
    
    //Removing this image from product
    this._productService.removeImage({product_id : this.id , image_id : id }).subscribe(
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
