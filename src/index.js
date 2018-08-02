import jsonpath from "jsonpath";
import walk from "./walker/jsonpath";
import { empty } from "./utilities";

export const $MATCH    = Symbol.for( "$match" );
export const $GEO_NEAR = Symbol.for( "$geoNear" ); 

function result_proxy( target ){

    return new Proxy(

        target,
    
        { 
        
            set( target, key, value, receiver ){ 
    
                if( $GEO_NEAR === key ){
    
                    target[ $GEO_NEAR ][ value.distanceField ] = value;
    
                } else if( $MATCH === key ){

                    target[ $MATCH ] = value;

                } else {
    
                    target[ $MATCH ][ key ] = value;
    
                }
    
                return true;
    
            },
        
            get( target, key, receiver ){ 
    
                return ( 
                
                      $GEO_NEAR === key ? target[ $GEO_NEAR ]
                    : $MATCH    === key ? target[ $MATCH ]
                    :                     target[ $MATCH ][ key ] 
                
                );

            }
    
        }
    );

}

export function to_aggregation( options = { }, path = this ){ 

    const 
        ast    = jsonpath.parse( path ).map( ({ expression }) => expression ),
        result = Object.assign( empty( ), {

            [ $MATCH    ] : empty( ),
            [ $GEO_NEAR ] : empty( ),
    
            [ Symbol.iterator ] : function * ( ){ yield * [ ... this[ Symbol.for( "$match" ) ] ]; }
    
        });
        
    ast :: walk( result_proxy( result ) );

    return result;
    
}








