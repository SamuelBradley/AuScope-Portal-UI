import { Component } from '@angular/core';
import { CsClipboardService, CsMapService } from '@auscope/portal-core-ui';


@Component({
  selector: '[appFilterClipboard]',
  templateUrl: './clipboard.component.html'
})

export class ClipboardComponent {

  public isClipboardShown;

  constructor(private CsClipboardService: CsClipboardService, private csMapService: CsMapService) {
    this.isClipboardShown = false;
    this.CsClipboardService.clipboardBS.subscribe(clipboardStatus => {
      this.isClipboardShown = clipboardStatus;
    });
  }

  public toggleClipboard () {
    this.CsClipboardService.toggleClipboard();
  }

  public getActiveLayerCount(): number {
    return Object.keys(this.csMapService.getLayerModelList()).length;
  }

}
