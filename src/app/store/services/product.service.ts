import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class productService{
  
  
  
  uri =  environment.apiUrl+"api/products";

  constructor(private http:HttpClient){}
  create(formData)
  {
    return this.http.post<any>(this.uri+"/create" , formData);
  }
  update(_id , formData)
  {
    return this.http.post<any>(this.uri+"/update/"+_id , formData);
  }
  get(filters){
    return this.http.get<any>(this.uri+""  , filters);
  }
  getAll(){
    return this.http.get<any>(this.uri+"/all");
  }
  getGroups() {
    return this.http.get<any>(this.uri+"/all-products-groups");
  }
  getPetTypes() {
    return this.http.get<any>(this.uri+"/all-pets-types");
  }
  getBrands() {
    return this.http.get<any>(this.uri+"/all-brands");
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/details/"+_id);
  }
  search(search){
    return this.http.post<any>(this.uri+"/search"  , search);
  }
  remove(id)
  {
    return this.http.post<any>(this.uri+"/delete" , {id : id });
  }
  getColors() {
    return this.http.get<any>(this.uri+"/colors");
  }
  getMeasurementUnits() {
    return this.http.get<any>(this.uri+"/get-all-measurement-units");
  }
}
