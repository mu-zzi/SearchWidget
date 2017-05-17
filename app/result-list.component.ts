import { Component, Input, OnChanges, Inject} from '@angular/core';

import { Result } from './result';
import { MOCKRESULTS } from './mock.results';
import { APP_CONFIG, IAppConfig } from './app.config';


@Component({
	selector: 'result-list',
	templateUrl: './result-list.component.html',
})

export class ResultListComponent implements OnChanges {
	@Input()
	results: Result[];

	private resultCount: number = 0;

	ngOnChanges(): void {
		/* show mock results in dev version instead of search results */
		// if (this.config.IS_DEV) {
		// 	this.results = MOCKRESULTS;
		// }

		if (this.results) {
			this.resultCount = this.results.length;
		}
	}

	/*
	* add event handler for URIs/URLs
	*/
	onUriClick(event: Event): void {
		event.preventDefault();
		console.log('open new window with url ' + event.srcElement.getAttribute('href'));
		window.open(event.srcElement.getAttribute('href'), '_blank', '', false);
	}

	constructor(
		@Inject(APP_CONFIG)
		private config: IAppConfig) { }
}
