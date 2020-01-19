import { Token, ASTNode, Operand } from "../parser/types";
import parserToAST from "../parser/syntax";
import tokenizing from "../parser/tokenizing";
import { deepLog } from "../../services/logger";

const toBool = (value: string) => {
    if (typeof value === "string") {
        return Boolean(Number(value));
    }
    throw new Error(
        "Value must be string instead got + " + typeof value + `(${value})`
    );
};

const isASTNode = (x: any) => x instanceof ASTNode;

const execute = (node: ASTNode): boolean | ASTNode => {
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

const getArgs = () =>
    process.argv
        .slice(2)
        .join()
        .replace(/\-\-exp=/g, "");

const root = parserToAST(tokenizing(getArgs()));

deepLog({ root });

console.time();
console.log("=".repeat(170));
console.log("\nResult: ", execute(root), "\n");
console.log("=".repeat(170));
console.timeEnd();
