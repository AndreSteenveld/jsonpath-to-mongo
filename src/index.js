import jsonpath from "jsonpath";
import walk from "./walker/jsonpath";


export function to_find( options = { }, path = this ){ 

}

export function to_aggregation( options = { }, path = this ){ 

    const 
        ast    = jsonpath.parse( path ).map( ({ expression }) => expression ),
        $match = ast :: walk( );

    return {

        $match,

        [ Symbol.iterator ] : function * ( ){ yield * [{ $match }] }

    };
}

