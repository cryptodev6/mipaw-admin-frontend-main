import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment}  from '@environments/environment';

@Injectable({
  providedIn : 'root'
})
export class CategoryService{
  uri =  environment.apiUrl+"api/categories";
  allCatUri = "assets/data/categories.json";

  constructor(private http:HttpClient){}
  create(formData)
  {
    console.log("Sending Data" , formData);
    return this.http.post<any>(this.uri+"/create-category" , formData);
  }
  update(formData)
  {
    console.log("Updating " , formData , this );
    return this.http.put<any>(this.uri+"/update-category" , formData);
  }
  getAll(){
    return this.http.get<any>(this.uri+"/featured");
  }
  viewDetail(_id){
    return this.http.get<any>(this.uri+"/"+_id);
  }
  search(query){
    return this.http.post<any>(this.uri+"/search" , {search : query});
  }
  deleteCategory(ids){
    return this.http.post<any>(this.uri+"/delete" , {ids : ids })
  }
}
