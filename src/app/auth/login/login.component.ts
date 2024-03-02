import { Component , OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators } from '@angular/forms';
// import { ToastrService } from 'ngx-toast';
import { AuthenticationService } from '@/auth/services/authentication.service';
import { StateService } from '@uirouter/angular';
import * as jwt_decode from "jwt-decode";
import { RootAuthenticationService } from '@/services/rootauthentication.service'
import { NotifierService } from 'angular-notifier';

@Component ({
  selector : 'loginForm',
  templateUrl : './login.component.html',
  styleUrls : ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  loginForm : FormGroup;
  respData : any[];

  constructor (
    // private toastr : ToastrService ,
    private _state :  StateService,
    private fb : FormBuilder ,
    private _authService : AuthenticationService,
    private _rootAuthService : RootAuthenticationService ,
    private notifier : NotifierService,
  ){
    this.respData = [] ;

    console.log("GONNA_SET_TOKEN LOGIN COMPOENENT REMOVE TOKEN.code#248@#$ " , localStorage.getItem("access_token") )
   let token =  localStorage.getItem("access_token");
   if(token && token.length > 30){
    //  console.trace();
    //  alert("Gonna remove token");
     localStorage.removeItem('access_token')

   }
  }

  ngOnInit(){
    this.loginForm = this.fb.group({
      email : [ '' , Validators.required ] ,
      password : ['' , Validators.required ]
    })
  }

  isValid(controlName){
    return this.loginForm.get(controlName).invalid && this.loginForm.get(controlName).touched
  }

  login(){
    let that = this;
    if(this.loginForm.valid)
      this._authService.login(this.loginForm.value.email , this.loginForm.value.password)
        .subscribe(
          response => {
            console.log("While logging in" , response )
            this.respData = response

            if(response)
            {
              //handle no permissions
              if (response.message && response.message.search("98%^@") != -1) {

              }
              
              //Remove old access_token in case any
              try{
                console.log("GONNA_SET_TOKENLogging in.code#732342@#$ " , response )

                localStorage.clear();
                //Refreshing token
                // this.toastr.success("Login success" , '')
               localStorage.setItem('access_token' , response.token )

               this._authService.refreshToken();
               //Refereshing root auth's service token as well
               this._rootAuthService.refreshToken();
               that._state.go('store')
                // this.router.navigate(['dashboard'])
              }catch(exc){
                console.error("Exception occured in login compoenent" , exc)
              }
            }
          },
          err => {
            console.log(err )
            if(err.error && err.error.message ){
              console.log(err , "<<<<<")

              that.notifier.notify("error" , "err.error.message " );
            }
            $('.container').addClass("shake")
            //Just removing class after a bit
            setTimeout( function(){
              $('.container').removeClass("shake");
            },3000 )
            $('input').addClass('inpErr');
            // this.toastr("Authentication Failed", err.error.message )
          }
        )
  }

  loginMock(){
    // Hardcoded credentials
      let hardcodedCred = {
          email: 'user@user.com',
          password: 'password'
      };

      // Mock token for demonstration purposes
      let mockToken = "mockedToken12345";

      // Check if the form is valid (you might want to remove this if you are hardcoding the login)
      if(this.loginForm.valid) {
          // Compare the input with hardcoded credentials
          if(this.loginForm.value.email === hardcodedCred.email && this.loginForm.value.password === hardcodedCred.password) {
              console.log("Hardcoded login successful");

              // Simulate response object with token
              let response = {
                  token: mockToken
              };

              localStorage.clear();
              localStorage.setItem('access_token', response.token);

              // Simulate refreshing tokens
              this._authService.refreshToken();
              this._rootAuthService.refreshToken();

              // Redirect to store
              this._state.go('store');
          } else {
              console.error("Hardcoded credentials mismatch");
              // Implement your logic for failed login
          }
      }
      // The rest of the original login logic should be commented out or removed
  }


}
