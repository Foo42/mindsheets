module("SimpleEvaluatorTests");

test( "Given input which does not start with '=', returns input without modification", function() {
	var evaluator = new SimpleEvaluator();

	equal(evaluator.evaluate("hello"), "hello");
	equal(evaluator.evaluate(1), 1);
});

test("Given an addition expression with two interger terms, returns their sum", function(){
	var evaluator = new SimpleEvaluator();

	var expression = "=2+3";

	equal(evaluator.evaluate(expression), 5);
})

test("Given an addition expression with multiple interger terms, returns their sum", function(){
	var evaluator = new SimpleEvaluator();

	var expression = "=2+3+8";

	equal(evaluator.evaluate(expression), 13);
})

test("Given a subtraction expression with two interger terms, returns the correct result", function(){
	var evaluator = new SimpleEvaluator();

	var expression = "=5-3";

	equal(evaluator.evaluate(expression), 2);
})

test("Given a division expression with two interger terms, returns the correct result", function(){
	var evaluator = new SimpleEvaluator();

	var expression = "=8/4";

	equal(evaluator.evaluate(expression), 2);
})

test("Given an expression containing additions and subtractions, returns the correct result", function(){
	var evaluator = new SimpleEvaluator();

	var expression = "=5-3+33-8";

	equal(evaluator.evaluate(expression), 27);
})

test("Given an expression containing additions, subtractions and multiplications, returns the correct result", function(){
	var evaluator = new SimpleEvaluator();

	var expression = "=5*2-8*3+10";

	equal(evaluator.evaluate(expression), -4);
})

test("Check operator precedence, multiplication over addition", function(){
	var evaluator = new SimpleEvaluator();

	var expression = "=2+3*4";

	equal(evaluator.evaluate(expression), 14);
})
