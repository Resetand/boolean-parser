import { makeStack } from "../core/parser/utils";

interface Operator {
    precedence: number;
    [key: string]: any;
}

type OperatorMapFilter<L> = (lexem: L) => Operator | false | undefined;

interface Conditions<T> {
    parenthesis: {
        isLeft: (lexem: T) => boolean;
        isRight: (lexem: T) => boolean;
    };
}

type RnpConverter = <L>(
    lexems: L[]
) => (
    operatorMapFilter: OperatorMapFilter<L>
) => (conditions: Conditions<L>) => L[];

//////////////////////////////////

const toRnp: RnpConverter = lexems => {
    type L = typeof lexems[0];

    return operatorFilter => {
        const operands: L[] = [];
        const map = (lexem: L) =>
            operatorFilter(lexem) || (operands.push(lexem) && null);

        const operators = lexems.map(map).filter(Boolean) as (Operator & L)[];

        return ({ parenthesis }) => {
            const output = makeStack<L>();
            const ops = makeStack<L>();

            const isOperand = (x: L) => operands.includes(x);
            const isLeftP = parenthesis.isLeft;
            const isRightP = parenthesis.isRight;
            const isOperator = (x: any) =>
                !isOperand(x) && !isLeftP(x) && !isRightP(x);

            lexems.forEach(lexem => {
                // Если токен — операнд, то добавить его в очередь вывода
                if (isOperand(lexem)) {
                    output.push(lexem);
                }

                // Если токен — открывающая скобка, то положить его в стек
                if (isLeftP(lexem)) {
                    ops.push(lexem);
                }

                // Если токен — закрывающая скобка:
                // Пока токен на вершине стека не является открывающей скобкой, перекладывать операторы из стека в выходную очередь.
                // Выкинуть открывающую скобку из стека, но не добавлять в очередь вывода.
                // Если токен на вершине стека — функция, переложить её в выходную очередь.
                // Если стек закончился до того, как был встречен токен открывающая скобка, то в выражении пропущена скобка.
                if (isRightP(lexem)) {
                    const peek = () => ops.peek();
                    while (peek() && !isLeftP(peek())) {
                        output.push(ops.pop()!);
                    }
                    ops.pop();
                }

                // Если токен — оператор op1, то:
                // Пока присутствует на вершине стека токен оператор op2, чей приоритет выше или равен приоритету op1:
                // переложить op2 из стека в выходную очередь;
                // Положить op1 в стек.
                if (isOperator(lexem)) {
                    const op = (lexem as any) as Operator;
                    const peek = () => (ops.peek() as any) as Operator;

                    while (peek() && peek().precedence >= op.precedence) {
                        output.push(ops.pop()!);
                    }
                    ops.push(lexem);
                }
            });

            /**
             * Если больше не осталось токенов на входе:
             * Пока есть токены операторы в стеке:
             * Если токен оператор на вершине стека — скобка, то в выражении присутствует незакрытая скобка.
             * Переложить оператор из стека в выходную очередь.
             */
            while (!ops.isEmpty()) {
                // if (isLeftP(ops.peek()) || isRightP(ops.peek())) {

                // }
                output.push(ops.pop()!);
            }

            // const out = output
            //     .getArray()
            //     .filter(x => !isLeftP(x) && !isRightP(x));

            return output.getArray().filter(x => !isLeftP(x) && !isRightP(x));
        };
    };
};

//////////////////////////////////

export default toRnp;
