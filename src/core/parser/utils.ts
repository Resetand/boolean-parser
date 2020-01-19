import { Lexem, Stack, Operand, Operator, Token } from "./types";
import ParsingError from "../errors/ParsingError";

export const reBuilder = (...values: string[]) => {
    values = values.map(text => text.replace(/[-[\]{}()*+?.,\\^$|]/g, "\\$&"));
    return new RegExp(`^(${values.map(x => `(${x})`).join("|")})`);
};

export const makeReader = <T = any>(list: T[]) => {
    let position = 0;
    const error = (expect: any, got: any) => {
        throw new ParsingError(expect, got);
    };

    const move = (offset: number) => {
        position += offset;
        return position;
    };
    const next = () => list[++position];
    const prev = () => list[--position];
    const peek = (offset: number = 0) => list[position + offset];

    return {
        getPos: () => position,
        error,
        next,
        peek,
        prev,
        move
    };
};

export const makePrior = <T>(ordered: T[]) => {
    Object.freeze(ordered);
    const prior = (v: T) => ordered.indexOf(v);
    return { prior };
};

export const makeStack = <T = any>(...values: T[]): Stack<T> => {
    const peek = () => values[values.length - 1];
    const pop = () => values.pop();
    const isEmpty = () => !Boolean(values.length);
    const push = (value: T) => values.push(value);
    const getArray = () => [...values];

    return { peek, pop, push, getArray, isEmpty };
};

export const lexemToOperand = ({ value, type }: Lexem): Operand => ({
    value,
    type: type as Token.VARIABLE | Token.CONSTANT
});

export const lexemToOperator = ({
    name,
    precedence,
    type,
    value
}: Lexem): Operator => ({
    name,
    precedence,
    type: type as Token.BINARY_OP | Token.UNARY_OP,
    value
});

export const replace = <T>(
    list: T[],
    replacement: T,
    start: number,
    count = 1
) => [...list.slice(0, start), replacement, ...list.slice(start + count)];
