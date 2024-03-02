import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StateService } from "@uirouter/angular";
import * as jwt_decode from "jwt-decode";
import { RootAuthenticationService } from "@/services/rootauthentication.service";
import { NotifierService } from "angular-notifier";

@Component({
  selector: "loginForm",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  respData: any[];

  constructor(
    private _state: StateService,
    private fb: FormBuilder,
    private _rootAuthService: RootAuthenticationService,
    private notifier: NotifierService
  ) {
    this.respData = [];
    let token = localStorage.getItem("access_token");
    if (token && token.length > 30) {
      localStorage.removeItem("access_token");
    }
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ["", Validators.required],
      password: ["", Validators.required],
    });
  }

  isValid(controlName) {
    return (
      this.loginForm.get(controlName).invalid &&
      this.loginForm.get(controlName).touched
    );
  }

  login() {
    let that = this;
    if (this.loginForm.valid)
      this._rootAuthService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe(
          (response) => {
            this.respData = response;
            console.log("Login subscription", response);
            if (response) {
              this.loggedIn(response);
            }
          },
          (err) => {
            console.log("Error exception in login", err);
            this.loggedIn(err);

            if (err.error && err.error.message) {
              console.log(err, "<<<<<");
              that.notifier.notify("error", "err.error.message ");
            }
            $(".container").addClass("shake");
            //Just removing class after a bit
            setTimeout(function () {
              $(".container").removeClass("shake");
            }, 3000);
            $("input").addClass("inpErr");
          }
        );
  }
  loggedIn(response) {
    //Remove old access_token in case any
    try {
      localStorage.clear();
      //Refreshing token
      const token = response.token || "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      console.log("Logged in token " , token );
      localStorage.setItem("access_token", token );

      //Refereshing root auth's service token as well
      this._rootAuthService.refreshToken();
      console.log("Ok i am leaving");
      this._state.go("store");
    } catch (exc) {
      console.error("Exception occured login", exc);
    }
  }
}
