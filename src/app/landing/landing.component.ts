import { Component, AfterViewInit } from "@angular/core";
import { StateService } from "@uirouter/angular";
import { RootAuthenticationService } from "./../services/rootauthentication.service";

@Component({
  selector: "app-root",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"],
})
export class LandingComponent implements AfterViewInit {
  constructor(
    private $state: StateService,
    private _authService: RootAuthenticationService
  ) {
    let token = localStorage.getItem("access_token");
    console.log(
      "Landing component Access token i have ",
      (token || "null").substring(0, 20) + "..."
    );
    window.onstorage = () => {
      console.log(
        "WINDOW_ONSTORAGE Token changed:::\r\n",
        localStorage.getItem("access_token")
      );
    };
    const queryString = window.location.hash;
    let urlParts = queryString.split("#/");

    this._authService.validateToken().subscribe(
      (resp) => {
        console.log("Validating token" , resp);
        if (resp && resp.token) {
          try {
            localStorage.removeItem("access_token");
            localStorage.setItem("access_token", resp.token);
            sessionStorage.setItem("session", resp.session);
          } catch (exc) {
            console.log("An exception occured in landing component", exc);
          }
          this._authService.refreshToken();
        }
        // this.$state.go("store.dashboard");
        this.$state.transitionTo('store', {
          param: 'some parameter'
        }, {
            reload : true
        });
        setTimeout(() => {
          if (urlParts.length > 1) {
            let route = urlParts[1] || "";
            if (route.trim().length > 4) {
              window.location.href = window.location.origin + "/#/" + route;
            }
          }
        }, 1000);
      },
      (err) => {
        console.log("Error occured while validating", err);
        this.$state.go("login" , { } , { reload : true});

        // this.$state.transitionTo('login', {
        //   param: 'some parameter'
        // }, {
        //     reload : true
        // });
      }
    );
  }
  ngAfterViewInit() {}
}
