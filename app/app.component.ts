import { Component, OnInit} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'gfbio-ts-search-widget',
  template: `
  <search-component></search-component>
  `,
})

export class AppComponent implements OnInit 
{
	ngOnInit(): void{
		console.log('init gfbio ts search widget');
	}
}
