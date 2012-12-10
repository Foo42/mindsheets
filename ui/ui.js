var SingleValueViewModel = (function(){

	return function(sheetObj){
		var self = this;

		var sheetObject = sheetObj;
		var valueObject = sheetObj.item;
		

		self.position = ko.observable(sheetObject.position);
		self.positionx = ko.observable(sheetObject.position.x);

		self.value = ko.observable(valueObject.Value());
		valueObject.bind('valueChanged', function(newValue){
			self.value(newValue);
		});


		self.definition = ko.observable(valueObject.Definition());
		self.definition.subscribe(function(newDefinitionValue){
			valueObject.Definition(newDefinitionValue);
		});


		self.isEditing = ko.observable(true);

		self.startEditing = function(data, event){
			self.isEditing(true);
		};

		self.keypressed = function(data, event){
			if(event.keyCode == 13)
			{
				event.stopPropagation();
				self.isEditing(false);
			}
			return true;
		};

	};
})();


var SheetVM = (function(){

	return function(){
		var self = this;

		var sheet;
		
		self.items = ko.observableArray();

		sheet = new Sheet();
		sheet.bind('itemAdded', function(newItem){
			self.items.push(new SingleValueViewModel(newItem));
		});


		self.addItemAtPosition = function(position){
			var svs = new SingleValueSource(new SimpleEvaluator()); //note: this should be done by the sheet, or something in core
			var item = new SheetObject(svs, position);
			
			sheet.addItem(item);
		};

		self.clicked = function(data, event){
			var vmForClickTarget = ko.dataFor(event.target);
			if(vmForClickTarget.sheet != self)
				return; //We are only interested in clicks directly on sheet, not events bubbling up

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



