define(['lib/microevent/microevent', 'expressionEvaluators/simpleEvaluator'],function(MicroEvent, SimpleEvaluator){
    var module = {};
    
    module.SheetElement = (function(){
    	return function(valueSource, position){
    		var self = this;
    		self.valueSource = valueSource;
    		self.position = position;
    	}
    })();
    
    module.Sheet = (function (){
    	var constructor = function(){
    		var self = this;
    
    		var items = [];
    		var names = [];

            var tryFindNameRecordOfItem = function(item){
                var matchingRecords = names.filter(function(nameRecord){return nameRecord.item == item});
                if(matchingRecords.length > 0)
                {
                    return matchingRecords[0];
                }
                return undefined;
            }

            var arrayContainsString = function(collection, s){
                for(i = 0; i < collection.length; i++){
                    if(collection[i] === s){
                        return true;
                    }
                }
                return false;
            }

            var notifyDependentsOfValueChange = function(nameValuePair){
                //Very simplistic implementation which informs ALL items when a value changes, without regard to their stated dependencies.
                items.forEach(function(item){
                    var itemDependsOnChangedValue = arrayContainsString(item.valueSource.getDependencies(), nameValuePair.name);
                    if(itemDependsOnChangedValue){
                        item.valueSource.dependencyValueChanged(nameValuePair);    
                    }
                    
                })
            }
    
    		self.trySetName = function(item, newName){
                //todo, refactor to use above once green
                var matchingRecords = names.filter(function(nameRecord){return nameRecord.item == item});
    			if(matchingRecords.length > 0)
    			{
    				matchingRecords[0].name = newName;
    				self.trigger('nameAssigned', matchingRecords[0]);
    			}
    			else
    			{
    				var newNameRecord = {item:item, name:newName};
    				names.push(newNameRecord);
    				self.trigger('nameAssigned', newNameRecord);
    			}
    
    		}
    
    		self.addItem = function(item){
    			items.push(item);
                item.valueSource.bind('valueChanged', function(newValue){
                    var name = (tryFindNameRecordOfItem(item) || {}).name;
                    if(name){
                        notifyDependentsOfValueChange({name:name, value:newValue});
                    } 
                });
    			self.trigger('itemAdded', item);
    		}
            
            self.createItemAt = function(coordinates){
                var svs = new module.SingleValueSource(new SimpleEvaluator.SimpleEvaluator());
                var item = new module.SheetElement(svs, coordinates);
                self.addItem(item);
            }
    	}
    
    	MicroEvent.mixin(constructor);
    	return constructor;
    })();
    
    
    module.SingleValueSource = (function(){
    	var constructor = function (definitionEvaluator){
    		var self = this;
    
    		var value = null;
    		var definition = null;
    		var evaluator = null;
            var dependencies = [];
    		//pass-through evaluator
    		var evaluate = function(expression){
    			return expression;
    		}
            //default dependency analysis without an evaluator
            var getDependencies = function(expression){
                return [];
            }
    
    
    		if(typeof(definitionEvaluator) !== 'undefined')
    		{
    			evaluator = definitionEvaluator;
    			evaluate = evaluator.evaluate;
                if(typeof(evaluator.getDependencies) !== 'undefined'){
                    getDependencies = evaluator.getDependencies;
                }
    		}
    
    		self.Value = function (newValue){
    			if(typeof(newValue) === 'undefined'){
    				return value;
    			}
    
    			value = newValue;
    			self.trigger('valueChanged', newValue);
    		}
            
            self.getDependencies = function(){
                return dependencies;
            }

    		self.Definition = function(newDefinition){
    			if(typeof(newDefinition) === 'undefined'){
    				return definition;
    			}
    
    			definition = newDefinition;
    			self.trigger('definitionChanged', newDefinition);
                var newDependencies = getDependencies(newDefinition);
                //Not a pretty way to force a value comparison :(
                if(JSON.stringify(newDependencies) != JSON.stringify(dependencies)){
                    dependencies = newDependencies;
                    self.trigger('dependenciesChanged');
                }
    			self.Value(evaluate(definition));
    		}
    	}
    
    	MicroEvent.mixin(constructor);
    	return constructor;
    })();
    
    
    return module;
});