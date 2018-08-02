import test from "ava";
import { to_aggregation, $MATCH, $GEO_NEAR } from "../src";


function mongo_spatial_aggregation( assert, path, expection ){

    const pipeline = ( path :: to_aggregation( ) )[ $GEO_NEAR ];

    assert.deepEqual( pipeline, expection );

}

function mongo_match_aggregation( assert, path, expection ){

    const $match = ( path :: to_aggregation( ) )[ $MATCH ];

    assert.deepEqual( [{ $match }], expection );

}

const matches = {

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

};

for( const [ path, pipeline ] of Object.entries( matches ) )
    test( `path :: ${ path }`, mongo_match_aggregation, path, pipeline ); 

const spatial = {
    
    "$[?( @geo.distance({ type : 'Point', coordinates : [ 0.0, 0.0 ] }) < 10000 )]": {

        "@distance": [ 

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
        
        ]

    }

};

for( const [ path, pipelines ] of Object.entries( spatial ) )
    test( `path :: ${ path }`, mongo_spatial_aggregation, path, pipelines );