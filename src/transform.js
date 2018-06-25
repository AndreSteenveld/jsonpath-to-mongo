import jsonpath from "jsonpath";

import walk from "./walker/jsonpath";

class Parser { 

    static from_path( path, options ){

        return ( new this( options ) )
            .to_query( path );

    }

}

export class Find extends Parser {

    to_query( path ){

        return { };

    }

}

export class Aggregation extends Parser { 

    to_query( path ){

        const 
            ast    = jsonpath.parse( path ).map( ({ expression }) => expression ),
            $match = ast :: walk( );

        return [{ $match }];

    }

}