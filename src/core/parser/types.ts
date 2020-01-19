export interface Rules {
    [name: string]: {
        key: RegExp | string;
        type: Token;
        precedence: number;

        calc?: (...args: boolean[]) => boolean;
    };
}

export enum Token {
    VARIABLE = "VARIABLE",
    PARENTHESIS_LEFT = "PARENTHESIS_LEFT",
    PARENTHESIS_RIGHT = "PARENTHESIS_RIGHT",
    CONSTANT = "CONSTANT",
    BINARY_OP = "BINARY_OP",
    UNARY_OP = "UNARY_OP"
}

export interface Lexem {
    type: Token;
    value: string;
    name: string;
    precedence: number;

    calc?: (...args: boolean[]) => boolean;
}

export interface Operator {
    name: string;
    precedence: number;
    type: Token.BINARY_OP | Token.UNARY_OP;
    value: string;
}

export interface Operand {
    type: Token.VARIABLE | Token.CONSTANT;
    value: string;
}

export interface ASTNodeI {
    operator: Operator;
    operands: (Operand | ASTNodeI)[];
    calc: (...args: boolean[]) => boolean;
}

export class ASTNode implements ASTNodeI {
    constructor(
        public operator: Operator,
        public operands: (Operand | ASTNodeI)[],
        public calc: (...args: boolean[]) => boolean
    ) {}
}

export interface Stack<T> {
    peek: () => T;
    pop: () => T | undefined;
    push: (...values: T[]) => void;
    getArray: () => T[];
    isEmpty: () => boolean;
}
