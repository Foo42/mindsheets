test( "hello test", function() {
  ok( 1 == "1", "Passed!" );
});

test("can create SimpleValueSource", function() {
	var svs = new SimpleValueSource();
	ok( svs != null);
})

test("SimpleValueSource has default value of null", function(){
	var svs = new SimpleValueSource();
	strictEqual(svs.Value(), null);
})

test("Can set and retrieve value on a SimpleValueSource", function(){
	var svs = new SimpleValueSource();
	svs.Value(4);
	strictEqual(svs.Value(), 4);
})

test("setting a value on a SimpleValueSource raises value change event with the new value", function(){
	var svs = new SimpleValueSource();
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

test("Adding an item to the sheet raises an itemAdded event on the sheet with the new item as an event argument", function(){
	var svs = new SimpleValueSource();
	var sheet = new Sheet();

	var eventFired = false;
	var itemInEvent = null;
	sheet.bind("itemAdded", function(item){
		eventFired = true;
		itemInEvent = item;
	});

	sheet.addItem(svs);
	
	ok(eventFired);
	strictEqual(itemInEvent, svs);
})

