define(['expressionEvaluators/simpleEvaluator'],function(SE){
     
    var createEvaluator = function(){
        return new SE.SimpleEvaluator();
    }
    
    module("SimpleEvaluatorTests");

    test( "Given input which does not start with '=', returns input without modification", function() {
        var evaluator = new SE.SimpleEvaluator();
    
        equal(evaluator.evaluate("hello"), "hello");
    	equal(evaluator.evaluate(1), 1);
    });
    
    test("Given an addition expression with two interger terms, returns their sum", function(){
    	var evaluator = new SE.SimpleEvaluator();
    
    	var expression = "=2+3";
    
    	equal(evaluator.evaluate(expression), 5);
    })
    
    test("Given an addition expression with multiple interger terms, returns their sum", function(){
    	var evaluator = new SE.SimpleEvaluator();
    
    	var expression = "=2+3+8";
    
    	equal(evaluator.evaluate(expression), 13);
    })
    
    test("Given a subtraction expression with two interger terms, returns the correct result", function(){
    	var evaluator = new SE.SimpleEvaluator();
    
    	var expression = "=5-3";
    
    	equal(evaluator.evaluate(expression), 2);
    })
    
    test("Given a division expression with two interger terms, returns the correct result", function(){
    	var evaluator = new SE.SimpleEvaluator();
    
    	var expression = "=8/4";
    
    	equal(evaluator.evaluate(expression), 2);
    })
    
    test("Given an expression containing additions and subtractions, returns the correct result", function(){
    	var evaluator = new SE.SimpleEvaluator();
    
    	var expression = "=5-3+33-8";
    
    	equal(evaluator.evaluate(expression), 27);
    })
    
    test("Given an expression containing additions, subtractions and multiplications, returns the correct result", function(){
    	var evaluator = new SE.SimpleEvaluator();
    
    	var expression = "=5*2-8*3+10";
    
    	equal(evaluator.evaluate(expression), -4);
    })
    
    test("Check operator precedence, multiplication over addition", function(){
    	var evaluator = new SE.SimpleEvaluator();
    
    	var expression = "=2+3*4";
    
    	equal(evaluator.evaluate(expression), 14);
    })
    
    test("Given an expressions containing a reference by name to another item, returns that name when queried for dependencies", function(){
       var evaluator = createEvaluator();
       var expression = '1 + "another cell" + 5'; //note the quotes
       
       var dependencies = evaluator.getDependencies(expression);
       
       equal(dependencies.length, 1);
       equal(dependencies[0], 'another cell');
    });

    test("Given an expressions containing a reference by name to another item, queries the value of that dependency when evaluating the expression", function(){
        var dependencyQueried;
        var valueForDependency = 777;
        var dependencyValueLookupFunction = function(dependencyName){
            dependencyQueried = dependencyName;
            return valueForDependency;
        }
        var evaluator = new SE.SimpleEvaluator(dependencyValueLookupFunction);
        var expression = '=1 + "another cell" + 5'; //note the quotes

        var value = evaluator.evaluate(expression);

        equal(dependencyQueried, 'another cell');
        equal(value, 1 + 777 + 5);
    });

    test("Given an expression in parenthesis, returns value of enclosed expression", function(){
      var evaluator = new SE.SimpleEvaluator();
    
        var expression = "=(2+3*4)";
    
        equal(evaluator.evaluate(expression), 14);  
    });

    test("Given an expression containing a subexpression in parenthesis, returns correct value", function(){
      var evaluator = new SE.SimpleEvaluator();
    
        var expression = "=4*(1+2)";
    
        equal(evaluator.evaluate(expression), 12);  
    });

    test("Interprets dependency values with number like values as numbers", function(){
        var valueForDependency = "2";
        var dependencyValueLookupFunction = function(dependencyName){
            return valueForDependency;
        }
        var evaluator = new SE.SimpleEvaluator(dependencyValueLookupFunction);
        var expression = '="another cell"+1'; //note the quotes

        var value = evaluator.evaluate(expression);

        equal(value, 3);
    });

    test("Given an expression with the first statement out of parenthesis and the second one within the expression should evaluate", function(){
        var expression = "=5+(5-1)",
            expectedResult = 9;

        var evaluator = new SE.SimpleEvaluator();

        strictEqual(evaluator.evaluate(expression), expectedResult);  
    });

    test("Close of parenthesis do not terminate expression evaluation", function(){
        var expression = "=(5)-1",
            expectedResult = 4;

        var evaluator = new SE.SimpleEvaluator();

        strictEqual(evaluator.evaluate(expression), expectedResult);  
    });

    test("Expressions beginning and ending with parenthesis are not confused with expressions wrapped in parenthesis", function(){
        var expression = "=(5-1)*(1+2)",
            expectedResult = 12;

        var evaluator = new SE.SimpleEvaluator();

        strictEqual(evaluator.evaluate(expression), expectedResult);  
    });
});
