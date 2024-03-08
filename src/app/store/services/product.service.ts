import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class productService {
  uri = environment.apiUrl + "api/products";
  uploadsUri = environment.apiUrl + "api/uploads";

  constructor(private http: HttpClient) {}
  create(formData) {
    return this.http.post<any>(this.uri + "/create", formData);
  }
  update(_id, formData) {
    return this.http.post<any>(this.uri + "/update/" + _id, formData);
  }
  get(filters) {
    return this.http.get<any>(this.uri + "", filters);
  }
  getDetails(id: string) {
    return this.http.get<any>(this.uri + "/details/" + id);
  }
  getAll() {
    return this.http.get<any>(this.uri + "/all");
  }
  getGroups() {
    return this.http.get<any>(this.uri + "/all-products-groups");
  }
  getPetTypes() {
    return this.http.get<any>(this.uri + "/all-pets-types");
  }
  getBrands() {
    return this.http.get<any>(this.uri + "/all-brands");
  }
  viewDetail(_id) {
    return this.http.get<any>(this.uri + "/details/" + _id);
  }
  search(search) {
    return this.http.post<any>(this.uri + "/search", search);
  }
  remove(id) {
    return this.http.post<any>(this.uri + "/delete", { id: id });
  }
  removeImage(obj: any) {
    return this.http.post<any>(this.uploadsUri + "/delete/", obj);
  }
  getColors() {
    return this.http.get<any>(this.uri + "/colors");
  }
  getMeasurementUnits() {
    return this.http.get<any>(this.uri + "/get-all-measurement-units");
  }

  mapObject(productObj) {
    return {
      product_group_id: productObj.product_group_id,
      barcode: productObj.barcode,
      sku: productObj.sku,
      name: productObj.name,
      color_id: productObj.color_id,
      measurement_unit_id: productObj.measurement_unit_id,
      pet_type: productObj.pet_type,
      price: productObj.price,
      categories: [], // You need to populate this from somewhere
      high: productObj.high,
      long: productObj.long,
      width: productObj.width,
      weigth: productObj.weigth, // Typo: "weigth" should be "weight"
      stock: productObj.stock,
      status: productObj.status,
      discount: productObj.discount,
      bestseller: productObj.bestseller,
      brand_id: productObj.brand_id,
      tax: productObj.tax,
      order_level: productObj.order_level,
      description: productObj.description,
    };
  }
}
