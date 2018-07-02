import test from "ava";
import { to_aggregation } from "../src";

function mongo_aggregation( assert, path, expection ){

    const pipeline = [ ...path :: to_aggregation( ) ];

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

    ],

    "$[?( @.the == 'good' && @.the == 'bad' && @.the == 'ugly' )]": [

        { $match: {

            $and: [
                
                { 
                    $and: [
                        { "the" : { $eq : "good" } },
                        { "the" : { $eq : "bad" } },
                    ]
                },

                { "the" : { $eq : "ugly" } }
            
            ]

        }}

    ],

    "$[?( @.touch == 'head' || @.touch == 'shoulders' || @.touch == 'knees' || @.touch == 'toes' )]": [
        
        { $match: {
            $or: [
                { 
                    $or : [
                        {
                            $or : [
                            
                                { "touch" : { $eq : "head" } },
                                { "touch" : { $eq : "shoulders" } },
                            
                            ]
                        },
                        { "touch" : { $eq : "knees" } }
                    ]
                },
                { "touch" : { $eq : "toes" } }
            ]
        }}

    ],

    "$[?( @geo.distance({ type : 'Point', coordinates : [ 0.0, 0.0 ] }) < 10000 )]":  
        
        Object.assign( [ { $match : { } } ], {

            [ Symbol.for( "$geoNear" ) ] : [
                { $geoNear : {
    
                    spherical : true,
                    limit     : 0xFFFFFFFF,
    
                    minDistance : 0,
                    maxDistance : 10000,
    
                    distanceField : "@distance",
    
                    near : {
                        type : "Point",
                        coordinates : [ 0.0, 0.0 ]
                    }
    
                }},
    
                { $project: {
    
                    "_id"       : "$_id",
                    "@distance" : "$@distance",
    
                }}
            ]

        })
    
};

for( const [ path, pipeline ] of Object.entries( path_pipeline ) )
    test( `path :: ${ path }`, mongo_aggregation, path, pipeline ); 
