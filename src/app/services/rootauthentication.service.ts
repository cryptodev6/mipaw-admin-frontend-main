import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';
import { BehaviorSubject , Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as jwt_decode from "jwt-decode";


@Injectable({providedIn : 'root'})
export class RootAuthenticationService {
  private currentUserSubject : BehaviorSubject<any>;
  public currentUser : Observable<any>;
  uri =  environment.apiUrl+"auth";
  access_token : String = '';
  constructor(private http : HttpClient ){
    try{
      this.access_token = localStorage.getItem('access_token') || "Bearer "
      this.currentUserSubject = new BehaviorSubject<any> (this.access_token)
      this.currentUser = this.currentUserSubject.asObservable()
    }catch(exc){
      console.log("In root auth service error " , exc)
    }
  }

  validateToken(){
    return this.http.post<any>(`${this.uri}/validate` , { token : this.access_token})
  }

  async logout(){
      try{
      this.access_token = "Bearer ";
      this.currentUserSubject.next(this.access_token);
      //remove user from local storage to log user out
      localStorage.removeItem('currenUser');
      sessionStorage.clear();
      }catch(error){
        console.log("Something went wrong while logging out " , error )
      }
  }
  public refreshToken(){
    try{
      this.access_token = localStorage.getItem('access_token') || "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
      console.log("Referesh item token " , this.access_token );
      this.currentUserSubject.next(this.access_token)
    }catch(exc){
      console.log("Token method" , exc)
    }
  }
  public get token()  {
    return this.currentUserSubject.value;
  }

  login(username : string, password : string ){
    return this.http.post<any>(`${this.uri}/authenticate` , { username , password })
    .pipe(map( user => {
      //Login successfull if there's a jwt token in the response
      if(user && user.token)
        {
          //store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('access_token' , user.token );
          sessionStorage.setItem('session' , user.session );
          this.currentUserSubject.next(user)
        }
      return user;
    }))
  }
}
