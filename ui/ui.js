var SingleValueViewModel = (function(){
	var valueObject;
	var sheetObject;

	return function(sheetObj){
		var self = this;

		sheetObject = sheetObj;
		valueObject = sheetObj.item;

		valueObject.bind('valueChanged', function(newValue){
			self.value(newValue);
		});

		self.position = ko.observable(sheetObject.position);
		self.positionx = ko.observable(sheetObject.position.x);

		//this is currently a one way initialisation from the model object
		self.value = ko.observable(valueObject.Value());

		self.clicked = function(data, event){
			event.stopPropagation();
		};

	};
})();


var SheetVM = (function(){
	var sheet;

	return function(){
		var self = this;

		self.items = ko.observableArray();

		sheet = new Sheet();
		sheet.bind('itemAdded', function(newItem){
			self.items.push(new SingleValueViewModel(newItem));
		});


		self.addItemAtPosition = function(position){
			var svs = new SingleValueSource();
			svs.Value(3);
			var item = new SheetObject(svs, position);
			
			sheet.addItem(item);
		};

		self.clicked = function(data, event){
			var pos = {x:event.pageX + "px", y:event.pageY + "px"};
			self.addItemAtPosition(pos);
		}
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
