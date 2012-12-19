var SingleValueViewModel = (function(){

	var constructor = function(sheetObj){
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

		self.name = ko.observable();

		self.isEditing = ko.observable(true);

		self.startEditing = function(data, event){
			self.isEditing(true);
			self.trigger('beganEdit',self);
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

	MicroEvent.mixin(constructor);
	return constructor;
})();


var SheetVM = (function(){

	return function(){
		var self = this;

		var sheet;
		
		self.items = ko.observableArray();

		self.onActiveItemChanged = function(newActiveItem){
			var itemsToDeactivate = self.items().filter(function(item){return item !== newActiveItem});
			for (var i = 0; i < itemsToDeactivate.length; i++) {
				itemsToDeactivate[i].isEditing(false);
			};
		};

		sheet = new Sheet();
		sheet.bind('itemAdded', function(newItem){
			var itemVM = new SingleValueViewModel(newItem);
			itemVM.bind('beganEdit', self.onActiveItemChanged);
			self.items.push(itemVM);
			self.onActiveItemChanged(itemVM);
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



