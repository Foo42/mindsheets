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
    	var constructor = function(persisted){
    		var self = this;    
    		var items = [];
    		var names = [];

            //Public Methods
            self.createItemAt = function(coordinates){
                var evaluator = new SimpleEvaluator.SimpleEvaluator(tryGetValueOfItemWithName);
                var svs = new module.SingleValueSource(evaluator);
                var item = new module.SheetElement(svs, coordinates);
                
                self.addItem(item);
            }

            self.addItem = function(item){
                items.push(item);

                item.valueSource.bind('valueChanged', function(newValue){
                    var name = self.tryGetName(item);
                    if(name){
                        notifyDependentsOfValueChange({name:name, value:newValue});
                    } 
                });
                
                self.trigger('itemAdded', item);
            }

            self.removeItem = function(itemToRemove){
                _.pull(items, itemToRemove);
                self.trigger('itemRemoved', itemToRemove);
            }

            self.trySetName = function(item, newName){                
                var nameRecord = tryFindNameRecordOfItem(item);
                var oldName;
                if(nameRecord){
                    oldName = nameRecord.name;
                    nameRecord.name = newName;
                }
                else{
                    nameRecord = {item:item, name:newName};
                    names.push(nameRecord);   
                }

                self.trigger('nameAssigned', nameRecord);
                if(oldName){
                    notifyDependentsOfValueChange({name:oldName, value:undefined});
                }
                notifyDependentsOfValueChange({name:newName, value:nameRecord.item.valueSource.value});
            }

            self.tryGetName = function(item){
                return (tryFindNameRecordOfItem(item) || {}).name;
            }

            self.forEachItem = function(func){
                items.forEach(func);
            }

            self.extractMemento = function(){
                var isNotEmptyItem = function(item){
                    return item.valueSource.defintion || self.tryGetName(item)
                };
                var persistedItems = items.filter(isNotEmptyItem).map(function(item){
                    return {
                        name:self.tryGetName(item),
                        definition:item.valueSource.definition,
                        display:item.position
                    };
                });

                return {
                    format:1,
                    data:{
                        items:persistedItems
                    }
                };
            }


            //Private Methods
            var tryFindNameRecordOfItem = function(item){
                return _.find(names, function(nameRecord){return nameRecord.item == item});
            }

            self.tryFindItemByName = function(name){
                var nameRecord = _.find(names, function(nameRecord){return nameRecord.name == name}) || {};
                return nameRecord.item;
            }

            var tryGetValueOfItemWithName = function(name){
                var item = self.tryFindItemByName(name);
                    if(_.isUndefined(item)){
                        return undefined;
                    }
                    return item.valueSource.value;
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

            var loadFromPersistedData = function(persisted){
                persisted.data.items.forEach(function(itemToAdd){
                    //do simplest thing for now

                    var evaluator = new SimpleEvaluator.SimpleEvaluator(tryGetValueOfItemWithName);
                    var svs = new module.SingleValueSource(evaluator);
                    svs.definition = itemToAdd.definition;
                    var item = new module.SheetElement(svs, {x:itemToAdd.display.x, y:itemToAdd.display.y});                    
                
                    self.addItem(item);
                    if(itemToAdd.name){
                        self.trySetName(item, itemToAdd.name);
                    }
                });
            };
            if(persisted){
                loadFromPersistedData(persisted);
            }
    	}
    
    	MicroEvent.mixin(constructor);
    	return constructor;
    })();
    
    
    module.SingleValueSource = (function(){
    	var constructor = function (definitionEvaluator){
    		var self = this;
    
    		var currentValue = null;
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
    
            //Note: it is questionable whether we should allow direct setting of value
            Object.defineProperty(this, "value", {
                get:function(){return currentValue},
                set:function(newValue){
                    currentValue = newValue;
                    self.trigger('valueChanged', newValue);
                }
            });

    		if(!_.isUndefined(definitionEvaluator))
    		{
    			evaluator = definitionEvaluator;
    			evaluate = evaluator.evaluate;
                if(!_.isUndefined(evaluator.getDependencies)){
                    getDependencies = evaluator.getDependencies;
                }
    		}
    
            self.getDependencies = function(){
                return dependencies;
            }

            Object.defineProperty(this, "definition", {
                get:function(){return self.Definition()},
                set:function(newDefinition){
                    self.Definition(newDefinition);
                }
            });

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
    			self.value = evaluate(definition);
    		}

            self.dependencyValueChanged = function(){
                self.value = evaluate(self.definition);   
            };
    	}
    
    	MicroEvent.mixin(constructor);
    	return constructor;
    })();
    
    
    return module;
});