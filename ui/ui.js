var SimpleValueViewModel = (function(){
	var valueObject;

	return function(simpleValue){
		var self = this;
		valueObject = simpleValue;

		valueObject.bind('valueChanged', function(newValue){
			self.value(newValue);
		});

		self.value = ko.observable(valueObject.Value());
	};
})();


var SheetVM = (function(){
	var sheet;

	return function(){
		var self = this;

		self.items = ko.observableArray();

		sheet = new Sheet();
		sheet.bind('itemAdded', function(newItem){
			self.items.push(new SimpleValueViewModel(newItem));
		});


		self.addItem = function(){
			var svs = new SimpleValueSource();
			svs.Value(3);
			sheet.addItem(svs);
		};
	}
})();

var RootViewModel = (function(){
	return function(){
		var self = this;

		self.test = "hello world";

		self.sheet = new SheetVM();

	};
})();


$(document).ready(function(){
	ko.applyBindings(new RootViewModel());	
})
