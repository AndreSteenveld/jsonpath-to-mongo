import test from "ava";
import { to_aggregation } from "../src";

function mongo_aggregation( assert, path, expection ){

    const pipeline = path :: to_aggregation( );

    assert.deepEqual( pipeline, expection );

}

const path_pipeline = {

    "$[?( @.property === 37 )]": [{ $match: { "property" : { $eq : 37 } } }],
    "$[?( @.property.is.nested.deeply === 37 )]": [{ $match: { "property.is.nested.deeply" : { $eq : 37 } } }],
    "$.property[?( @.is.nested === 37 )]": [{ $match: { "property.is.nested" : { $eq : 37 } } }],
    
    "$.property[?( @ === 37 )]": [{ $match: { "property" : { $eq : 37 } } }],
    "$.property[?( @ !== 37 )]": [{ $match: { "property" : { $neq : 37 } } }],

    "$.property[?( @ < 37 )]": [{ $match: { "property" : { $lt : 37 } } }],
    "$.property[?( @ <= 37 )]": [{ $match: { "property" : { $lte : 37 } } }],
    
    "$[?( @.have == 'cake' && @.eat == 'it' )]": [

        { $match: {

            $and: [
                { "have" : { $eq : "cake" } },
                { "eat" : { $eq : "it" } }
            ]

        }}

    ],

    "$[?( @.the == 'one' || @.the == 'other' )]": [

        { $match: {

            $or: [
                { "the" : { $eq : "one" } },
                { "the" : { $eq : "other" } }
            ]

        }}

    ]
};

for( const [ path, pipeline ] of Object.entries( path_pipeline ) )
    test( `path :: ${ path }`, mongo_aggregation, path, pipeline ); 
