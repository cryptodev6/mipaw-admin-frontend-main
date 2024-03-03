import { Component, OnInit, AfterViewInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
} from "@angular/forms";
declare var $: any;
import { NotifierService } from "angular-notifier";
import { StateService } from "@uirouter/angular";
import { Transition } from "@uirouter/core";
import { UserService } from "@store/services/user.service";

@Component({
  selector: "usersform",
  templateUrl: "./usersform.component.html",
  styleUrls: ["./usersform.component.scss"],
})
export class UsersFormComponent implements OnInit, AfterViewInit {
  pageData: any;
  UserForm: FormGroup;
  id: any;
  opInProgress: Boolean = false;
  updatedValues: any;

  constructor(
    private fb: FormBuilder,
    private _userService: UserService,
    private notifier: NotifierService,
    private $state: StateService,
    private trans: Transition
  ) {
    this.pageData = {
      title: "User Form",
      loaded: true,
      breadcrumbs: [
        {
          title: "Users",
        }
      ],
    };
  }
  ngOnInit() {
    this.id = this.trans.params().id;
    const title = (this.id ? "Update" : "Add") + " User Form";
    this.pageData.breadcrumbs.push({
        title 
      }
    );
    this.pageData.title = title;
    this.UserForm = this.fb.group({
      first_name: ["", [Validators.required , Validators.minLength , Validators.maxLength ]],
      last_name: ["", [Validators.required , Validators.minLength , Validators.maxLength ]],
      id: [""],
      user_type : ["2" , Validators.required],
      email: ["", [Validators.required , Validators.minLength , Validators.maxLength  , Validators.email]]
    });
  }
  ngAfterViewInit() {
    if (this.id) {
      this.fetchUserInfo();
    }
  }
  fetchUserInfo() {
    this._userService.getById(this.id).subscribe(
      (resp) => {
        console.log("FetchUser Info :" , resp);
        //Since the data is in the form of array thats why first index is our value
        resp = resp.data;

        //Setting the form values
        this.UserForm.patchValue(resp );
      },
      (error) => {
        this.notifier.notify("error", error.error.message);
        console.log("Error occured", error);
      }
    );
  }
  
  addUser() {
    let that = this;
    this.opInProgress = true;

    //In case the form is suppose to update
    if (this.id) {
      this.updateUser();
      return;
    }
    //hide both failed and success idons
    $(".icon").fadeOut();

    this._userService.create(this.UserForm.value).subscribe(
      (response) => {
        this.opInProgress = false;

        //Success icon show
        $(".icon.success").fadeIn();
        this.notifier.notify("success", "User Added");
        that.$state.go("store.users");
      },
      (error) => {
        this.opInProgress = false;
        //Show failed icon
        $(".icon.fail").fadeIn();
        console.log("Error in user form", error);
        this.notifier.notify("error", error.error.message);
      }
    );
  }
  //Method to update user
  updateUser() {
    //Using component variable to keep track of only the updated values
    this.updatedValues = {};

    //Identifying keys to update
    this.getUpdates(this.UserForm, this.updatedValues);

    //Check if there is something to update
    if (jQuery.isEmptyObject(this.updatedValues)) {
      this.notifier.notify("warning", "Nothing to change.");
      this.opInProgress = false;
      //Show failed icon
      $(".icon.fail").fadeIn();
      this.$state.go("store.users");
      return;
    }

    //Its time to update
    //get the categories selected by the user
    this._userService.update({...this.updatedValues , id : this.id}).subscribe(
      (resp) => {
        this.notifier.notify("success", "User Successfuly updated.");
        this.$state.go("store.users");
      },
      (error) => {
        console.log("error", error);
        this.opInProgress = false;
        this.notifier.notify(
          "error",
          error.error.message ? error.error.message : "Something went wrong while deleting user"
        );
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
 
}
