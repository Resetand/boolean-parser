import { Token, ASTNode, Operand, Lexem } from "../parser/types";
import parserToAST, { convertToRnp } from "../parser/syntax";
import tokenizing from "../parser/tokenizing";
import { deepLog } from "../../services/logger";
import { readFileSync, writeFileSync } from "fs";
import ParsingError from "../errors/ParsingError";

const toBool = (value: string) => {
    if (typeof value === "string") {
        return Boolean(Number(value));
    }
    throw new Error(
        "Value must be string instead got + " + typeof value + `(${value})`
    );
};

const isASTNode = (x: any) => x instanceof ASTNode;

const execute = (node: ASTNode): boolean => {
    const { operands, operator, calc } = node;

    const reCalc = (node: ASTNode) => (execute(node) ? "1" : "0");

    if (operator.type === Token.UNARY_OP) {
        const [op] = operands;
        const val = isASTNode(op)
            ? reCalc(op as ASTNode)
            : (op as Operand).value;
        const { value, type } = op as Operand;

        return calc(toBool(val));
    }

    let [right, left] = operands;

    const leftValue = isASTNode(left)
        ? reCalc(left as ASTNode)
        : (left as Operand).value;

    const rightValue = isASTNode(right)
        ? reCalc(right as ASTNode)
        : (right as Operand).value;

    return calc(toBool(leftValue), toBool(rightValue));
};

const PATH = __dirname + "/../../../execute.playground";

const getInput = () => {
    const file = readFileSync(PATH);
    const [content, exp] = /{#(.*)#}/gs.exec(file.toString()) || [];

    if (exp) return [content, exp];

    throw new ParsingError("Expression", "null");
};

const toInput = (list: Lexem[]) => list.map(x => x.value).join(" ");

const buildOutput = (
    input: string,
    result: boolean | string,
    root: ASTNode,
    lexems: Lexem[]
) => `${input}\n
Expression:  ${toInput(lexems)} 
RNP:         ${toInput(convertToRnp(lexems))}\n
==========================\n
result:     ${result}\n
==========================\n
AST: \n${JSON.stringify(root, null, 4)}`;

const process = () => {
    const [content, exp] = getInput();

    try {
        const lexems = tokenizing(exp);
        const root = parserToAST(lexems);
        return buildOutput(content, execute(parserToAST(lexems)), root, lexems);
    } catch (error) {
        return `${content}\n ERROR:\n${JSON.stringify(error, null, 4)}`;
    }
};

writeFileSync(PATH, process());
