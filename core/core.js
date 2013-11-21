define(['lib/microevent/microevent', 'expressionEvaluators/simpleEvaluator', 'lodash'],function(MicroEvent, SimpleEvaluator, _){
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
                return _.find(names, function(nameRecord){return nameRecord.item == item});
            }

            var notifyDependentsOfValueChange = function(nameValuePair){
                var nameOfChangedValue = nameValuePair.name;
                
                var itemsWhichDependOnChangedValue = items.filter(function(item){
                    return _.contains(item.valueSource.getDependencies(), nameValuePair.name)
                });

                itemsWhichDependOnChangedValue.forEach(function(item){
                    item.valueSource.dependencyValueChanged(nameValuePair);    
                });
            }
    
    		self.trySetName = function(item, newName){                
                var nameRecord = tryFindNameRecordOfItem(item);
                if(nameRecord){
                    nameRecord.name = newName;
                }
                else{
                    nameRecord = {item:item, name:newName};
                    names.push(nameRecord);   
                }
                self.trigger('nameAssigned', nameRecord);
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
                var dependencyLookup = function(name){
                    var item = self.getItemByName(name);
                    if(!item){
                        return undefined;
                    }
                    return item.valueSource.Value();
                }
                var svs = new module.SingleValueSource(new SimpleEvaluator.SimpleEvaluator(dependencyLookup));
                var item = new module.SheetElement(svs, coordinates);
                self.addItem(item);
            }

            self.getItemByName = function(name){
                var matchingNameRecords = names.filter(function(nameRecord){return nameRecord.name == name});
                if(matchingNameRecords.length === 0){
                    return undefined;
                }
                return matchingNameRecords[0].item;
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

            self.dependencyValueChanged = function(){
                self.Value(evaluate(self.Definition()));   
            };
    	}
    
    	MicroEvent.mixin(constructor);
    	return constructor;
    })();
    
    
    return module;
});