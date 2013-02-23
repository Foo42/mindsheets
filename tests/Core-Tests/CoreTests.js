define(['core/core'],function(core){
    
    module("SingleValueSource Tests")
    test("can create SingleValueSource", function() {
    	var svs = new core.SingleValueSource();
    	ok( svs != null);
    })
    
    test("SingleValueSource has default value of null", function(){
    	var svs = new core.SingleValueSource();
    	strictEqual(svs.Value(), null);
    })
    
    test("Can set and retrieve value on a SingleValueSource", function(){
    	var svs = new core.SingleValueSource();
    	svs.Value(4);
    	strictEqual(svs.Value(), 4);
    })
    
    test("Setting the value of one SingleValueSource does not change the value of others", function(){
    	var a = new core.SingleValueSource();
    	var b = new core.SingleValueSource();
    
    	a.Value(3);
    	b.Value(5);
    
    	equal(a.Value(), 3);
    	equal(b.Value(), 5);
    })
    
    test("setting a value on a SingleValueSource raises value change event with the new value", function(){
    	var svs = new core.SingleValueSource();
    	var eventFired = false;
    	var valueFromEvent;
    	svs.bind("valueChanged", function(newValue){
    		eventFired = true;
    		valueFromEvent = newValue;
    	});
    
    	svs.Value(4);
    
    	ok(eventFired);
    	strictEqual(valueFromEvent, 4);
    })
    
    test("setting the definition on a SingleValueSource raises definitionChange event with the new definition", function(){
    	var svs = new core.SingleValueSource();
    	var eventFired = false;
    	var valueFromEvent;
    
    	svs.bind("definitionChanged", function(newDefinition){
    		eventFired = true;
    		valueFromEvent = newDefinition;
    	});
    
    	svs.Definition(5);
    
    	ok(eventFired);
    	equal(valueFromEvent, 5);
    })
    
    test("setting the definition on a SingleValueSource triggers a call to its evaluator", function(){
    	var evaluatorWasCalled = false;
    	var evaluator = {evaluate:function(){evaluatorWasCalled=true;}};
    	var svs = new core.SingleValueSource(evaluator);
    
    	svs.Definition(3);
    
    	ok(evaluatorWasCalled);
    })
    
    test("setting a definition on a SingleValueSource which causes iggers a valueChanged event with the new value", function(){
    	var evaluator = {evaluate:function(expression){return expression + 1;}};
    	var svs = new core.SingleValueSource(evaluator);
    
    	var eventWasFired = false;
    	var valueFromEvent;
    
    	svs.bind("valueChanged", function(newValue){
    		valueFromEvent = newValue;
    		eventWasFired = true;
    	});
    
    	svs.Definition(2);
    
    	ok(eventWasFired);
    	equal(valueFromEvent, 3);
    })
    
    test("setting the definition on a SingleValueSource causes the value to change to the result from the evaluator", function(){
    	var evaluator = {evaluate:function(expression){return expression + 1;}};
    	var svs = new core.SingleValueSource(evaluator);
    
    	svs.Definition(2);
    	equal(3, svs.Value());
    })
    
    test("setting the definition on a SingleValueSource causes it to query its evaluator for expression dependencies", function() {
       //Arrange
       var dependenciesWereQueried = false;
       var evaluator = {evaluate:function(){return 0}, getDependencies:function(){dependenciesWereQueried = true;return []}};
       var svs = new core.SingleValueSource(evaluator);
       
       //Act
       svs.Definition('=5+1');
       
       //Assert
       ok(dependenciesWereQueried, "single value source did not query for dependencies on evaluator");
    });
    
    test("SingleValueSource Dependencies property has the dependencies given by the evaluator for a given definition",function(){
        //Arrange
        var dependencies = ["foo","bar"];
        var evaluator = {evaluate:function(){return 0}, getDependencies:function(){return dependencies}};
        var svs = new core.SingleValueSource(evaluator);
       
        //Act
        svs.Definition('=something');
        
        //Assert
        equal(svs.getDependencies(), dependencies);
    })
    
    test("SingleValueSource raises 'dependenciesChanged' event if change of definition causes getDependenies function to have a different return value", function(){
        //Arrange
        var eventWasFired = false;
        var evaluator = {
            evaluate:function(){return 0},
            getDependencies:function(expression){return expression.length == 0 ? [] : ['stuff']}};
        
        var svs = new core.SingleValueSource(evaluator);
        svs.Definition("");
        svs.bind("dependenciesChanged", function(){eventWasFired=true;});
       
        //Act
        svs.Definition('=something');
        
        //Assert
        ok(eventWasFired,"event not fired");
    })
    
    test("SingleValueSource does not raise 'dependenciesChanged' event if change of definition does not causes getDependenies function to have a different return value", function(){
        //Arrange
        var eventWasFired = false;
        var evaluator = {
            evaluate:function(){return 0},
            getDependencies:function(expression){return ['stuff']}};
        
        var svs = new core.SingleValueSource(evaluator);
        svs.Definition("");
        svs.bind("dependenciesChanged", function(){eventWasFired=true;});
       
        //Act
        svs.Definition('=something');
        
        //Assert
        ok(!eventWasFired,"event fired incorrectly");
    })
    
    module("Sheet Tests")
    test("Adding an item to the sheet raises an itemAdded event on the sheet with the new item as an event argument", function(){
    	var itemToAdd = new core.SheetElement(new core.SingleValueSource(), {x:0,y:0});
    
    	var sheet = new core.Sheet();
    
    	var eventFired = false;
    	var itemInEvent = null;
    	sheet.bind("itemAdded", function(item){
    		eventFired = true;
    		itemInEvent = item;
    	});
    
    	sheet.addItem(itemToAdd);
    	
    	ok(eventFired);
    	strictEqual(itemInEvent, itemToAdd);
    });
    
    test("Requesting the sheet createItemAt and giving it a set of coordinates, causes it to raise an itemAdded event with a new item with the given coordinates", function(){
        //Arrange
        var sheet = new core.Sheet();
        var coordinatesOfItemInEvent;
        sheet.bind('itemAdded', function(item){
            coordinatesOfItemInEvent = item.position;
        });
        
        //Act
        var requestedCoordinates = {x:2, y:3};
        sheet.createItemAt(requestedCoordinates);
        
        //Assert
        equal(coordinatesOfItemInEvent, requestedCoordinates);
    });
    
    test("Sheet raises a nameAssigned event when trySetName is called for an item which was not previously named", function(){
    	var itemToAdd = new core.SheetElement(new core.SingleValueSource(), {x:0,y:0});
    	var sheet = new core.Sheet();
    	sheet.addItem(itemToAdd);
    
    	var eventFired = false;
    	var recordInEvent = null;
    	
    	sheet.bind("nameAssigned", function(record){
    		eventFired = true;
    		recordInEvent = record;
    	});
    
    	sheet.trySetName(itemToAdd, "Foo");
    	
    	ok(eventFired);
    	notStrictEqual(recordInEvent, {item:itemToAdd, name:"Foo"});	
    });
    
    test("Sheet raises a nameAssigned event with new name, when trySetName is called for an item which already had a name before", function(){
    	var itemToAdd = new core.SheetElement(new core.SingleValueSource(), {x:0,y:0});
    	var sheet = new core.Sheet();
    	sheet.addItem(itemToAdd);
    	var originalName = "Foo";
    	sheet.trySetName(itemToAdd, "Foo");
    
    	var eventFired = false;
    	var recordInEvent = null;
    	
    	sheet.bind("nameAssigned", function(record){
    		eventFired = true;
    		recordInEvent = record;
    	});
    
    	//Act
    	var newerName = "Bar";
    	sheet.trySetName(itemToAdd, newerName);
    	
    	//Assert
    	ok(eventFired);
    	notStrictEqual(recordInEvent, {item:itemToAdd, name:newerName});	
    });
});
