import { Token, Rules } from "./parser/types";
import { reBuilder } from "./parser/utils";

export const rules: Rules = {
    negative: {
        type: Token.UNARY_OP,
        key: reBuilder("!"),
        precedence: 6,
        calc: op => !op
    },

    conjunction: {
        type: Token.BINARY_OP,
        key: reBuilder("*", "&"),
        precedence: 5,
        calc: (op1, op2) => op1 && op2
    },

    disjunction: {
        type: Token.BINARY_OP,
        key: reBuilder("+", "|"),
        precedence: 4,
        calc: (op1, op2) => op1 || op2
    },

    xor: {
        type: Token.BINARY_OP,
        key: reBuilder("^"),
        precedence: 3,
        calc: (op1, op2) => op1 !== op2 && (op1 || op2)
    },

    implication: {
        type: Token.BINARY_OP,
        key: reBuilder("-->", "->"),
        precedence: 2,
        calc: (op1, op2) => !op1 || op2
    },

    equivalent: {
        type: Token.BINARY_OP,
        key: reBuilder("~"),
        precedence: 1,
        calc: (op1, op2) => op1 === op2
    },

    variable: {
        key: /^[a-zA-Z]/,
        type: Token.VARIABLE,
        precedence: -1
    },

    leftParenthesis: {
        type: Token.PARENTHESIS_LEFT,
        key: reBuilder("("),
        precedence: -1
    },
    rightParenthesis: {
        type: Token.PARENTHESIS_RIGHT,
        key: reBuilder(")"),
        precedence: -1
    },
    true: {
        type: Token.CONSTANT,
        key: reBuilder("1"),
        precedence: -1
    },
    false: {
        type: Token.CONSTANT,
        key: reBuilder("0"),
        precedence: -1
    }
};
