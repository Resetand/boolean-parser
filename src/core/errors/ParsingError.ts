import { Lexem } from "../parser/types";

export default class ParsingError extends Error {
    name = "ParsingError";
    constructor(expect: any, got: any, public lexem?: Lexem) {
        super();
        this.message = `Parsing error: expect ${expect} instead got ${got}`;
    }
}
