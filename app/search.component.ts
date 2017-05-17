import { Component, OnInit, Inject } from '@angular/core';

import { HostListener } from '@angular/core';

import { SearchService } from './search.service';
import { Result } from './result';
import { Terminology } from './terminology';

import { APP_CONFIG, IAppConfig } from './app.config';

@Component({
	selector: 'search-component',
	templateUrl: './search.component.html',
})

export class SearchComponent implements OnInit {
	private searchInput: string = '';
	private selectedTerminologies: string[] = [];
	private internalOnly: boolean = this.config.DEFAULT_SEARCH_INTERNAL_ONLY;
	private firstMatch: boolean = this.config.DEFAULT_SEARCH_FIRST_MATCH;
	private matchType: boolean = this.config.DEFAULT_SEARCH_MATCH_TYPE;

	private example_term1: string = this.config.SEARCH_EXAMPLE1;
	private example_term2: string = this.config.SEARCH_EXAMPLE2;
	private example_term3: string = this.config.SEARCH_EXAMPLE3;

	private results: Result[]; //results from user search with bound narrowing options
	private fullResults: Result[]; //results from full search without any narrowing option
	private diagnostics: any; //search result diagnostics
	private error: any = null; //search result error
	private loading: boolean = false; //show search in progress loader

	private contactUrl: string = this.config.ERROR_MESSAGE_URL;  //contact url to display in error message

	private terminologies: Terminology[]; //all terminologies available in TS

	constructor(
		private searchService: SearchService,
		@Inject(APP_CONFIG)
		private config: IAppConfig) { }

	/*
	* init search component:
	* reset search default values
	* fill list of all terminologies available in TS
	* init UIs of search bar and particular terminologies for semanticUI
	*/
	ngOnInit(): void{
		this.resetSearchDefaults();

		this.searchService.getAllTerminologies().subscribe(
			terminologies => {
				// console.log('terminologies')
				// console.log(terminologies['results']);
				this.terminologies = terminologies['results'];
				this.terminologies.sort((a: Terminology, b: Terminology) => this.sortByAcronym(a, b));
			},
			err => {
				console.log(err);
				this.error = err;
			});

		$('#particularTerminologies').dropdown();
		$('#searchInput').dropdown();
	}

	/* 
	* listen to keyboard-enter if widget is focused to start search
	*/
	@HostListener('window:keydown', ['$event'])
	keyboardInput(event: KeyboardEvent) {
		if (!document.activeElement.className.startsWith('search')) {
			if (event.keyCode == 13) {
				this.performSearch();
			// } else {
			// 	$('#searchInput').focus();
			}
		}
	}

	/*
	* start search by delegating it to search.service
	* term and narrow options are bound to respective ui elements
	* sort result list by label
	*/
	performSearch(): void {
		if (this.searchInput) {
			this.loading = true;
			this.error = null;

			// console.log('narrow options:', this.matchType, this.firstMatch, this.internalOnly, this.terminologies);

			// this.searchService.performFullSearch(this.searchInput)
			// 	// .delay(1000)
			// 	.subscribe(
			// 	results => {
			// 		this.fullResults = results['results'];
			// 		console.log(this.fullResults.length + ' full result(s) for ' + this.searchInput);
			// 		// this.loading = false;
			// 	},
			// 	error => {
			// 		console.log('full search error');
			// 		console.log(error);
			// 		// this.loading = false;
			// 	},
			// 	() => {
			// 		console.log('full search completed')
			// 	}
			// 	);

			this.searchService.performSearch(this.searchInput, this.matchType, this.firstMatch, this.internalOnly, this.selectedTerminologies)
				.subscribe(
				results => {
					console.log('user request');
					console.log('query: ', results['request']['query'], "\n", 'time: ', results['request']['executionTime']);

					this.results = results['results'];
					this.loading = false;

					console.log(this.results.length + ' user search result(s) for ' + this.searchInput);
					// console.log(results['results']);

					// SORTING THE RESULT
					this.results.sort((a, b) => this.sortResultByLabel(a, b));

					if (results['diagnostics'].length > 0) {
						this.diagnostics = results['diagnostics'];
						console.log('user diagnostics');
						console.log(this.diagnostics);
					}
				},
				err => {
					console.log('user search error');
					console.log(err);
					this.loading = false;
					this.error = err;
				},
				() => {
					console.log('user search request completed')
				}
			);
		}else{
			console.log('no search term provided');
		}
	}

	/*
	* event handler for narrow-checkbox to filter search results
	*/
	onNarrowClick(event: Event): void {
		setTimeout(function() {
			// console.log(event.srcElement);
			// console.log(event.srcElement.getAttribute('ng-reflect-model'));
		}, 10);
		// this.performSearch();		
	}

	/*
	* event handler for term example to start example search
	*/
	onExampleClick(event: Event): void {
		this.searchInput = event.srcElement.getAttribute('value');
		this.resetSearchDefaults();
		this.performSearch();	
	}

	/*** HELPER FUNCTIONS ***/

	/*
	* clear multiple search dropdown field particular terminolgies
	*/
	clearParticularTerminologies(): void {
		$('#particularTerminologies').dropdown('clear');
	}

	/*
	* reset narrow options to default values
	* default values are configured in app.config
	*/
	resetSearchDefaults(): void{
		this.matchType = this.config.DEFAULT_SEARCH_MATCH_TYPE;
		this.firstMatch = this.config.DEFAULT_SEARCH_FIRST_MATCH;
		this.internalOnly = this.config.DEFAULT_SEARCH_INTERNAL_ONLY;
		this.clearParticularTerminologies();
	}

	/*
	* sort terminologies by acronym
	*/
	sortByAcronym(a: Terminology, b: Terminology) {
		if (a.acronym < b.acronym) return -1;
		if (a.acronym > b.acronym) return 1;
		return 0;
	};

	/*
	* sort terminologies by name
	*/
	sortByName(a: Terminology, b: Terminology) {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	};

	/*
	* sort results by label
	*/
	sortResultByLabel(a: Result, b: Result) {
		// console.log('sort by label');
		if (a.label < b.label) return -1;
		if (a.label > b.label) return 1;
		return 0;
	}
}