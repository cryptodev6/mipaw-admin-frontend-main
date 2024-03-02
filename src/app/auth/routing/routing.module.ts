import { NgModule } from "@angular/core";
import { UIRouterModule } from "@uirouter/angular";

//================= User Defined Modules ========================//
import { LoginComponent } from "@/auth/login/login.component";

//********* States which are protected from general public  ***************//
const STATES = [
  {
    name: "login",
    url: "",
    component: LoginComponent,
  }
];
@NgModule({
  imports: [UIRouterModule.forChild({ states: STATES })],
  exports: [UIRouterModule],
  declarations: [],
})
export class AuthRoutingModule {}
