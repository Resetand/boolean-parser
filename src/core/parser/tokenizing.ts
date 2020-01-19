import { Lexem, Token } from "./types";
import { rules } from "../rules";

const tokenizing = (exp: string): Lexem[] => {
    const lexems: Lexem[] = [];
    for (let i = 0; i < exp.length; i++) {
        const def = exp.slice(i);

        for (const [name, data] of Object.entries(rules)) {
            const { type, key, precedence, calc } = data;
            const match = def.match(key);

            if (match) {
                const [value] = match;
                i += value.length - 1;
                lexems.push({ type, value, name, precedence, calc });
            }
        }
    }

    return lexems;
};

export default tokenizing;
