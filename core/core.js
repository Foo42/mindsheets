
var Sheet = (function (){
	var items = [];

	var constructor = function(){
		var self = this;

		self.addItem = function(item){
			items.push(item);
			self.trigger('itemAdded', item);
		}
	}

	MicroEvent.mixin(constructor);
	return constructor;
})();


var SingleValueSource = (function(){
	var value = null;

	var constructor = function (){
		var self = this;

		self.Value = function (newValue){
			if(typeof(newValue) === 'undefined'){
				return value;
			}

			value = newValue;
			self.trigger('valueChanged', newValue);
		}
	}

	MicroEvent.mixin(constructor);
	return constructor;
})();