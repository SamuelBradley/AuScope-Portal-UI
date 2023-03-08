import { Component } from '@angular/core';
/**
 * Defines the overall app layout
 */
@Component({
    selector: 'app-portal',
    templateUrl: './portal.component.html',
    styleUrls: ['../../styles.scss']
})
export class PortalComponent {

  public activeShow: boolean = true;
  public featuredShow = true;
  public customShow = false;
  public searchShow = false;

  constructor() {
  }

  toggle(button: string) {
    switch (button) {
      case "activeShow":
        this.activeShow = !this.activeShow;
        break;
      case "featuredShow":
        console.log("Feature Toggle")
        this.featuredShow = !this.featuredShow;
        break;
      case "customShow":
        this.customShow = !this.customShow;
        break;
      case "searchShow":
        this.searchShow = !this.searchShow;
        break;
    }
  }

}
