import ParsingError from "../errors/ParsingError";
import tokenizing from "./tokenizing";
import toRnp from "../../services/rpn";
import { ASTNode, Lexem, Token } from "./types";
import { lexemToOperand, lexemToOperator, makeReader, replace } from "./utils";
import { rules } from "../rules";
type Handler = (list: (Lexem | ASTNode)[]) => (Lexem | ASTNode)[];

export const convertToRnp = (lexems: Lexem[]) => {
    const mapFilter = (lexem: Lexem) =>
        [Token.BINARY_OP, Token.UNARY_OP].includes(lexem.type) ? lexem : false;

    const conditions = {
        parenthesis: {
            isLeft: (lexem: Lexem) => lexem.type === Token.PARENTHESIS_LEFT,
            isRight: (lexem: Lexem) => lexem.type === Token.PARENTHESIS_RIGHT
        }
    };
    const res = toRnp(lexems)(mapFilter)(conditions);
    // setTimeout(() =>
    //     console.log(
    //         "\nUser :\t" + lexems.map(x => x.value).join(" "),
    //         "\nRPN: \t" + res.map(x => x.value).join(" ")
    //     )
    // );
    return res;
};

const parser = (lexems: Lexem[]) => {
    const rnp = convertToRnp(lexems);

    const handle = (list: (Lexem | ASTNode)[]): ASTNode => {
        const res = handleOnce(list);

        if (res.length > 1) {
            return handle(res);
        }
        const node = res.pop();
        if (node instanceof ASTNode) {
            return node;
        }
        throw new ParsingError("", "", node);
    };

    return handle(rnp);
};

const handleOnce: Handler = list => {
    const isOp = (token: Token) =>
        [Token.BINARY_OP, Token.UNARY_OP].includes(token);

    const { next, peek, prev, error, getPos } = makeReader(list);
    const expectPrevOperand = () => {
        const types = [Token.VARIABLE, Token.CONSTANT];
        const expected = peek(-1);
        if (
            expected &&
            (expected instanceof ASTNode || types.includes(expected.type))
        ) {
            return prev();
        }
        error(types.join(" or "), expected ? expected.value : " '' ");
    };

    while (next()) {
        const item = peek();
        if (!(item instanceof ASTNode)) {
            if (isOp(item.type)) {
                const op = item;
                const isBin = op.type === Token.BINARY_OP;

                const operands = [
                    expectPrevOperand(),
                    ...(isBin ? [expectPrevOperand()] : [])
                ].map(cur =>
                    cur instanceof ASTNode ? cur : lexemToOperand(cur as Lexem)
                );

                const node = new ASTNode(
                    lexemToOperator(op),
                    operands,
                    op.calc!
                );

                return replace(list, node, getPos(), isBin ? 3 : 2);
            }
        }
    }
    return error("expresion", "");
};

export default parser;
