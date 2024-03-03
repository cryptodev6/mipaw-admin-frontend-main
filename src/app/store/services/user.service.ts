import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

import { User } from '@models/user';

@Injectable({
  providedIn : 'root'
})
export class UserService{
  
  uri =  environment.apiUrl+"api/profile";

  constructor(private http:HttpClient){

  }
  create(formData)
  {
    return this.http.post<any>(this.uri+"/create" , formData);
  }
  update(formData)
  {
    return this.http.put<any>(this.uri+"/update" , formData);
  }
  get(filters){
    return this.http.post<any>(this.uri+""  , filters);
  }
  getAll(){
    return this.http.get<any>(this.uri+"");
  }
  getById(_id){
    return this.http.get<any>(this.uri+"/details?id="+_id);
  }
  logUserOut(id){
    return this.http.post<any>(this.uri+"/force-loguserout", {id : id });
  }
  search(query){
    query = query && query.trim().length ? query :  '-' ;
    return this.http.get<any>(this.uri+"/search/"+query);
  }
  remove(id: any) {
    return this.http.delete<any>(this.uri+"/"+id);
  }
}
