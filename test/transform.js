import test from "ava";
import { to_aggregation, to_find } from "../src";

test( "to_aggregation is a function", ( assert ) => assert.true( "function" === typeof to_aggregation ) );
test( "to_find is a function", ( assert ) => assert.true( "function" === typeof to_find ) );



