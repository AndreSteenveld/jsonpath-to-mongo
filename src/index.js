import jsonpath from "jsonpath";
import walk from "./walker/jsonpath";
import { empty } from "./utilities";


export function to_find( options = { }, path = this ){ 

}

export function to_aggregation( options = { }, path = this ){ 

    const 
        ast    = jsonpath.parse( path ).map( ({ expression }) => expression ),
        $match = ast :: walk( );

    return {

        $match,
        
        $geoNear : empty( ),

        [ Symbol.iterator ] : function * ( ){ yield * [{ $match }] }

    };
}

