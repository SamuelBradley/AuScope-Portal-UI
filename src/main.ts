
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Ion } from 'cesium';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

if (environment.googleAnalyticsKey) {
  const gtagscript = document.createElement('script');
  gtagscript.src = 'https://www.googletagmanager.com/gtag/js?id=' + environment.googleAnalyticsKey;
  gtagscript.async = true;
  document.head.appendChild(gtagscript);
  const gtaginitscript = document.createElement('script');
  gtaginitscript.innerHTML = 'window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag(\'js\', new Date());gtag(\'config\', \'' +
  environment.googleAnalyticsKey + '\');';
  document.head.appendChild(gtaginitscript);
}

declare var require;

// This access token is taken from the "angular-cesium" website - you can replace it with your own one
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2YTY1NDYzYS01YzgxLTQ2MGUtODBiYy0zODRmY2MwOGY4MDIiLCJpZCI6MjA1LCJpYXQiOjE1MDQ3MjQ1Njh9.rKgXUKAfFiiSAm_b9T8bpsDVdj0YyZeqGxNpzLlhxpk';
window['CESIUM_BASE_URL'] = '/assets/cesium/';
platformBrowserDynamic().bootstrapModule(AppModule);
