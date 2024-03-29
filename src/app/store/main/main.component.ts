import { Component, OnInit, AfterViewInit } from "@angular/core";
import { StateService } from "@uirouter/angular";
import * as jwt_decode from "jwt-decode";
import { HttpService } from "@services/http.service";
import { AuthenticationService } from "@services/authentication.service";
import { RootAuthenticationService } from "@/services/rootauthentication.service";
import { environment } from "@environments/environment";
declare var $: any;
declare var document: any;
@Component({
  selector: "store",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class MainComponent implements OnInit, AfterViewInit {
  title = "Store";
  navigationMenu: any;
  menuFileUrl: string = "assets/data/menu.json";
  name: any;
  profile_pic: any = "";
  subHiddenBreakpoint: Number = 1440;
  searchHiddenBreakpoint: Number = 768;
  menuHiddenBreakpoint: Number = 768;
  menuClickCount: number = 0;
  allMenuClassNames: string =
    "menu-default menu-hidden sub-hidden main-hidden menu-sub-hidden main-show-temporary sub-show-temporary menu-mobile";
  nextClasses: string = "";
  lastActiveSubmenu: string = "";
  serverImagesPath: any = environment.cloudinary;
  logoUrl: String = "";
  filtersApplied: any[];
  subscription: any = null;

  public constructor(
    private $state: StateService,
    private _httpSv: HttpService,
    private _authService: AuthenticationService,
    private _rootAuthService: RootAuthenticationService
  ) {
    this.subscription = this._authService.currentUserSubject.subscribe(
      (token) => {
        try {
          console.log(
            "Auth token in main component ",
            (token || "").substring(0, 20) + "..."
          );
          let decodedToken = (jwt_decode as any)(token);
          this.name = decodedToken.username || "";
          this.profile_pic = decodedToken.profile_pic || "";
          this.getMenu();
        } catch (err) {
          console.log("Invalid token provided ", token);
        }
      }
    );
  }
  back(): void {}
  ngOnInit() {
    this.navigationMenu = [];

    let decodedToken = (jwt_decode as any)(this._authService.token);
    this.logoUrl = this.serverImagesPath.small + "store/" + decodedToken.store_id + ".png";
    console.log("What i have in decode token :", decodedToken);
    this.profile_pic = decodedToken.profile_pic || "";
  }
  handleImageError(event: any) {
    event.target.src = '/assets/img/person.png';
  }

  async signout() {
    //clear token in auth service as well
    await this._rootAuthService.logout();
    await this._authService.logout();
    // this.$state.go("login");
    this.$state.transitionTo('login', {
      param: 'some parameter'
    }, {
        reload : true
    });
    console.log("Signing out");
  }

  ngAfterViewInit() {
  }
  filterMenu(menu) {
    menu = menu.slice(0);
    for (let index = 0; index < menu.length; index++) {
      let removeThisElement = true;
      const menuElement = menu[index];
      //if menu has sub-children
      if (menuElement.sub) {
        //Checking the sub array if any of the sub array element
        //passes the permission criiteria then it means we
        //dont need to delete parent
        let isPermitted = false;
        // console.log("Menu element sub print" , JSON.stringify(menuElement) );

        menuElement.sub.forEach((elem, i) => {
          // console.log("gonnacheck" , elem.title)
          let permRequired = "view";
          if (elem.title.match(/Add/i)) permRequired = "add";
          let tempIsPermitted = true;
          if (tempIsPermitted) isPermitted = true;
          else {
            // console.log("Gonna remove" ,menu[index].sub[i] )
            delete menu[index].sub[i];
            return false;
          }
        });
        //just cleaning the empty spaces
        menu[index].sub.filter((elem) => elem);
        removeThisElement = !isPermitted;
      } else {
        //if menu has no children
        let permRequired = "view";
        if (menuElement.title.match(/Add/i)) permRequired += "|add";
        let isPermitted = true;
        removeThisElement = !isPermitted;
      }
      // console.log("Passed" , menuElement , "result" , removeThisElement)
      if (removeThisElement) {
        delete menu[index];
      }
    }
    return menu;
  }
  getMenu() {
    this._httpSv.getData(this.menuFileUrl).subscribe(
      (data) => {
        //The nvaidation menu has been fetched and is in json format
        //Check each group and sub group for permission
        let dataAltered = this.filterMenu(data).filter((el) => {
          if (el.sub) el.sub = el.sub.filter((subChild) => subChild);
          return el;
        });

        this.navigationMenu = dataAltered;

        setTimeout(() => {
          this.makeNav();
          //Initially activate menu
          this.activateNav();
        }, 0);
      },
      (err) => {
        console.log(err, "Navigation error");
      }
    );
  }
  makeNav() {
    let that = this;
    //Navigation
    let menuClickCount = 0;
    let allMenuClassNames =
      "menu-default menu-hidden sub-hidden main-hidden menu-sub-hidden main-show-temporary sub-show-temporary menu-mobile";
    let setMenuClassNames = function (clickIndex, calledFromResize, link) {
      menuClickCount = clickIndex;
      let container = $("#app-container");
      if (container.length == 0) {
        return;
      }

      link = link || getActiveMainMenuLink();

      //menu-default no subpage
      if (
        $(".sub-menu ul[data-link='" + link + "']").length == 0 &&
        (menuClickCount == 2 || calledFromResize)
      ) {
        if ($(window).outerWidth() >= that.menuHiddenBreakpoint) {
          if (isClassIncludedApp("menu-default")) {
            if (calledFromResize) {
              $("#app-container").removeClass(allMenuClassNames);
              $("#app-container").addClass(
                "menu-default menu-sub-hidden sub-hidden"
              );
              menuClickCount = 1;
            } else {
              $("#app-container").removeClass(allMenuClassNames);
              $("#app-container").addClass(
                "menu-default main-hidden menu-sub-hidden sub-hidden"
              );
              menuClickCount = 0;
            }
            resizeCarousel();
            return;
          }
        }
      }

      //menu-sub-hidden no subpage
      if (
        $(".sub-menu ul[data-link='" + link + "']").length == 0 &&
        (menuClickCount == 1 || calledFromResize)
      ) {
        if ($(window).outerWidth() >= that.menuHiddenBreakpoint) {
          if (isClassIncludedApp("menu-sub-hidden")) {
            if (calledFromResize) {
              $("#app-container").removeClass(allMenuClassNames);
              $("#app-container").addClass("menu-sub-hidden sub-hidden");
              menuClickCount = 0;
            } else {
              $("#app-container").removeClass(allMenuClassNames);
              $("#app-container").addClass(
                "menu-sub-hidden main-hidden sub-hidden"
              );
              menuClickCount = -1;
            }
            resizeCarousel();
            return;
          }
        }
      }

      //menu-sub-hidden no subpage
      if (
        $(".sub-menu ul[data-link='" + link + "']").length == 0 &&
        (menuClickCount == 1 || calledFromResize)
      ) {
        if ($(window).outerWidth() >= that.menuHiddenBreakpoint) {
          if (isClassIncludedApp("menu-hidden")) {
            if (calledFromResize) {
              $("#app-container").removeClass(allMenuClassNames);
              $("#app-container").addClass(
                "menu-hidden main-hidden sub-hidden"
              );
              menuClickCount = 0;
            } else {
              $("#app-container").removeClass(allMenuClassNames);
              $("#app-container").addClass("menu-hidden main-show-temporary");
              menuClickCount = 3;
            }
            resizeCarousel();
            return;
          }
        }
      }

      if (clickIndex % 4 == 0) {
        if (isClassIncludedApp("menu-main-hidden")) {
          that.nextClasses = "menu-main-hidden";
        } else if (
          isClassIncludedApp("menu-default") &&
          isClassIncludedApp("menu-sub-hidden")
        ) {
          that.nextClasses = "menu-default menu-sub-hidden";
        } else if (isClassIncludedApp("menu-default")) {
          that.nextClasses = "menu-default";
        } else if (isClassIncludedApp("menu-sub-hidden")) {
          that.nextClasses = "menu-sub-hidden";
        } else if (isClassIncludedApp("menu-hidden")) {
          that.nextClasses = "menu-hidden";
        }
        menuClickCount = 0;
      } else if (clickIndex % 4 == 1) {
        if (
          isClassIncludedApp("menu-default") &&
          isClassIncludedApp("menu-sub-hidden")
        ) {
          that.nextClasses =
            "menu-default menu-sub-hidden main-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-default")) {
          that.nextClasses = "menu-default sub-hidden";
        } else if (isClassIncludedApp("menu-main-hidden")) {
          that.nextClasses = "menu-main-hidden menu-hidden";
        } else if (isClassIncludedApp("menu-sub-hidden")) {
          that.nextClasses = "menu-sub-hidden main-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-hidden")) {
          that.nextClasses = "menu-hidden main-show-temporary";
        }
      } else if (clickIndex % 4 == 2) {
        if (
          isClassIncludedApp("menu-main-hidden") &&
          isClassIncludedApp("menu-hidden")
        ) {
          that.nextClasses = "menu-main-hidden";
        } else if (
          isClassIncludedApp("menu-default") &&
          isClassIncludedApp("menu-sub-hidden")
        ) {
          that.nextClasses = "menu-default menu-sub-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-default")) {
          that.nextClasses = "menu-default main-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-sub-hidden")) {
          that.nextClasses = "menu-sub-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-hidden")) {
          that.nextClasses =
            "menu-hidden main-show-temporary sub-show-temporary";
        }
      } else if (clickIndex % 4 == 3) {
        if (isClassIncludedApp("menu-main-hidden")) {
          that.nextClasses = "menu-main-hidden menu-hidden";
        } else if (
          isClassIncludedApp("menu-default") &&
          isClassIncludedApp("menu-sub-hidden")
        ) {
          that.nextClasses = "menu-default menu-sub-hidden sub-show-temporary";
        } else if (isClassIncludedApp("menu-default")) {
          that.nextClasses = "menu-default sub-hidden";
        } else if (isClassIncludedApp("menu-sub-hidden")) {
          that.nextClasses = "menu-sub-hidden sub-show-temporary";
        } else if (isClassIncludedApp("menu-hidden")) {
          that.nextClasses = "menu-hidden main-show-temporary";
        }
      }
      if (isClassIncludedApp("menu-mobile")) {
        that.nextClasses += " menu-mobile";
      }
      container.removeClass(allMenuClassNames);
      container.addClass(that.nextClasses);
      resizeCarousel();
    };
    $(".menu-button").on("click", function (event) {
      event.preventDefault();
      setMenuClassNames(++menuClickCount, false, false);
    });

    $(".menu-button-mobile").on("click", function (event) {
      event.preventDefault();
      $("#app-container")
        .removeClass("sub-show-temporary")
        .toggleClass("main-show-temporary");
      return false;
    });

    $(".main-menu").on("click", "a", function (event) {
      event.preventDefault();
      let link = $(this).attr("link").replace("#", "");
      if ($(".sub-menu ul[data-link='" + link + "']").length == 0) {
        let target = $(this).attr("target");
        if ($(this).attr("target") == null) {
          window.open(link, "_self");
        } else {
          window.open(link, target);
        }
        return;
      }

      showSubMenu($(this).attr("link"));
      let container = $("#app-container");
      if (!$("#app-container").hasClass("menu-mobile")) {
        if (
          $("#app-container").hasClass("menu-sub-hidden") &&
          (menuClickCount == 2 || menuClickCount == 0)
        ) {
          setMenuClassNames(3, false, link);
        } else if (
          $("#app-container").hasClass("menu-hidden") &&
          (menuClickCount == 1 || menuClickCount == 3)
        ) {
          setMenuClassNames(2, false, link);
        } else if (
          $("#app-container").hasClass("menu-default") &&
          !$("#app-container").hasClass("menu-sub-hidden") &&
          (menuClickCount == 1 || menuClickCount == 3)
        ) {
          setMenuClassNames(0, false, link);
        }
      } else {
        $("#app-container").addClass("sub-show-temporary");
      }
      return false;
    });

    $(document).on("click", function (event) {
      if (
        !(
          $(event.target).parents().hasClass("menu-button") ||
          $(event.target).hasClass("menu-button") ||
          $(event.target).parents().hasClass("sidebar") ||
          $(event.target).hasClass("sidebar")
        )
      ) {
        // Prevent sub menu closing on collapse click
        if (
          $(event.target).parents("a[data-toggle='collapse']").length > 0 ||
          $(event.target).attr("data-toggle") == "collapse"
        ) {
          return;
        }
        if (
          $("#app-container").hasClass("menu-sub-hidden") &&
          menuClickCount == 3
        ) {
          let link = getActiveMainMenuLink();
          if (link == lastActiveSubmenu) {
            setMenuClassNames(2, false, false);
          } else {
            setMenuClassNames(0, false, false);
          }
        } else if (
          $("#app-container").hasClass("menu-main-hidden") &&
          $("#app-container").hasClass("menu-mobile")
        ) {
          setMenuClassNames(0, false, false);
        } else if (
          $("#app-container").hasClass("menu-hidden") ||
          $("#app-container").hasClass("menu-mobile")
        ) {
          setMenuClassNames(0, false, false);
        }
      }
    });

    let getActiveMainMenuLink = function () {
      let dataLink = $(".main-menu ul li.active a").attr("href");
      return dataLink ? dataLink.replace("#", "") : "";
    };

    let isClassIncludedApp = function (className) {
      let container = $("#app-container");
      let currentClasses = container
        .attr("class")
        .split(" ")
        .filter(function (x) {
          return x != "";
        });
      return currentClasses.includes(className);
    };

    let lastActiveSubmenu = "";
    let showSubMenu = function (dataLink) {
      if ($(".main-menu").length == 0) {
        return;
      }

      let link = dataLink ? dataLink.replace("#", "") : "";
      if ($(".sub-menu ul[data-link='" + link + "']").length == 0) {
        $("#app-container").removeClass("sub-show-temporary");

        if ($("#app-container").length == 0) {
          return;
        }

        if (
          isClassIncludedApp("menu-sub-hidden") ||
          isClassIncludedApp("menu-hidden")
        ) {
          menuClickCount = 0;
        } else {
          menuClickCount = 1;
        }
        $("#app-container").addClass("sub-hidden");
        noTransition();
        return;
      }
      if (link == lastActiveSubmenu) {
        return;
      }
      $(".sub-menu ul").fadeOut(0);
      $(".sub-menu ul[data-link='" + link + "']").slideDown(100);

      $(".sub-menu .scroll").scrollTop(0);
      lastActiveSubmenu = link;
    };

    let noTransition = function () {
      $(".sub-menu").addClass("no-transition");
      $("main").addClass("no-transition");
      setTimeout(function () {
        $(".sub-menu").removeClass("no-transition");
        $("main").removeClass("no-transition");
      }, 350);
    };

    showSubMenu($(".main-menu ul li.active a").attr("href"));

    let resizeCarousel = function () {
      setTimeout(function () {
        let event = document.createEvent("HTMLEvents");
        event.initEvent("resize", false, false);
        window.dispatchEvent(event);
      }, 350);
    };
  }
  activateNav() {
    let currentState = this.$state.$current.name;
    this.navigationMenu.forEach((nav) => {
      if (nav.sub && nav.sub.length) {
        nav.sub.forEach((n) => {
          console.log("Route ::" , n.route , currentState );
          if (n.route == currentState) {
            console.log("currently active state and passed state", nav);
            $(".main-menu-link").removeClass("active");
            $("#" + nav.title).addClass("active");
          }
        });
      }
    });
  }
  applyFilter(type, evt) {
    console.log("Apply clicked ", evt, $);
    $(evt.target).toggleClass("bolder-search-icon");
  }
}
