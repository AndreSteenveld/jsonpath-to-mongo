import { Find, Aggregation } from "./transform";

export function to_find( options = { }, path = this ){ 

    return Find.from_path( path, options );

}

export function to_aggregation( options = { }, path = this ){ 

    return Aggregation.from_path( path, options );

}

