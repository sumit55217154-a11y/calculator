/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AngleMode = 'DEG' | 'RAD';

export interface EvaluationResult {
  success: boolean;
  value: number | null;
  formatted: string;
  error?: string;
}

// Precision tolerance for trig floating point inaccuracies
const EPSILON = 1e-12;

/**
 * Gamma function approximation for factorial of non-integers,
 * or standard iterative factorial for non-negative integers.
 */
export function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial of negative number undefined');
  if (n > 170) return Infinity; // Overflow in 64-bit IEEE 754 float
  if (Math.floor(n) === n) {
    let res = 1;
    for (let i = 2; i <= n; i++) {
      res *= i;
    }
    return res;
  }
  // Stirling / Lanczos approximation for gamma(n + 1) if fractional
  return gamma(n + 1);
}

function gamma(z: number): number {
  const g = 7;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.138571095836524,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

export function toRadians(angle: number, mode: AngleMode): number {
  return mode === 'DEG' ? (angle * Math.PI) / 180 : angle;
}

export function fromRadians(rad: number, mode: AngleMode): number {
  return mode === 'DEG' ? (rad * 180) / Math.PI : rad;
}

/**
 * Cleanly format numbers, eliminating IEEE 754 precision noise like 0.30000000000000004
 */
export function formatResult(num: number): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Check if it's very close to zero
  if (Math.abs(num) < EPSILON && num !== 0) {
    // If exceedingly small, check if it should be exact 0 (e.g. cos(90 deg))
    if (Math.abs(num) < 1e-15) return '0';
  }

  // Integer check with precision rounding
  const roundedInt = Math.round(num);
  if (Math.abs(num - roundedInt) < 1e-11) {
    return roundedInt.toString();
  }

  // Large or small number in scientific notation
  const abs = Math.abs(num);
  if ((abs >= 1e14 || (abs < 1e-6 && abs > 0)) && abs !== 0) {
    const expStr = num.toExponential(8);
    // Remove unnecessary trailing zeroes in exponent mantissa
    const [mantissa, exponent] = expStr.split('e');
    const cleanedMantissa = parseFloat(mantissa).toString();
    return `${cleanedMantissa}e${exponent}`;
  }

  // Standard decimal representation: round to max 10 decimal digits
  const fixed = Number(num.toPrecision(12));
  return fixed.toString();
}

/**
 * Token types for expression parsing
 */
type TokenType = 'NUMBER' | 'OP' | 'FUNC' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'POSTFIX';

interface Token {
  type: TokenType;
  value: string;
}

/**
 * Tokenizer with implicit multiplication & support for scientific functions and constants
 */
export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.trim();

  // Known function identifiers
  const funcs = new Set([
    'sin', 'cos', 'tan',
    'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh',
    'asinh', 'acosh', 'atanh',
    'ln', 'log', 'log2', 'log10',
    'sqrt', 'cbrt', 'abs', 'exp',
    'floor', 'ceil', 'round'
  ]);

  while (i < s.length) {
    const ch = s[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including decimals and scientific notation like 1.2e+5)
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      let hasDot = false;
      while (i < s.length) {
        const c = s[i];
        if (/[0-9]/.test(c)) {
          numStr += c;
          i++;
        } else if (c === '.' && !hasDot) {
          hasDot = true;
          numStr += c;
          i++;
        } else if ((c === 'e' || c === 'E') && numStr.length > 0 && i + 1 < s.length) {
          const next = s[i + 1];
          if (/[0-9+-]/.test(next)) {
            numStr += c;
            i++;
            if (next === '+' || next === '-') {
              numStr += next;
              i++;
            }
          } else {
            break;
          }
        } else {
          break;
        }
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Constants
    if (ch === 'π' || ch === 'pi') {
      tokens.push({ type: 'NUMBER', value: Math.PI.toString() });
      i++;
      continue;
    }
    if (ch === 'e' && (i + 1 >= s.length || !/[a-zA-Z0-9]/.test(s[i + 1]))) {
      // Standalone e constant
      tokens.push({ type: 'NUMBER', value: Math.E.toString() });
      i++;
      continue;
    }
    if (ch === 'φ' || ch === 'phi') {
      tokens.push({ type: 'NUMBER', value: ((1 + Math.sqrt(5)) / 2).toString() });
      i++;
      continue;
    }

    // Postfix factorial
    if (ch === '!') {
      tokens.push({ type: 'POSTFIX', value: '!' });
      i++;
      continue;
    }

    // Parentheses
    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Comma
    if (ch === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    // Word identifiers (functions like sin, cos, sqrt, etc.)
    if (/[a-zA-Z]/.test(ch)) {
      let word = '';
      while (i < s.length && /[a-zA-Z0-9]/.test(s[i])) {
        word += s[i];
        i++;
      }
      const lower = word.toLowerCase();
      if (lower === 'pi') {
        tokens.push({ type: 'NUMBER', value: Math.PI.toString() });
      } else if (funcs.has(lower)) {
        tokens.push({ type: 'FUNC', value: lower });
      } else {
        throw new Error(`Unknown identifier: "${word}"`);
      }
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '×', '÷', '^', '%'].includes(ch)) {
      const opMap: Record<string, string> = {
        '×': '*',
        '÷': '/',
      };
      tokens.push({ type: 'OP', value: opMap[ch] || ch });
      i++;
      continue;
    }

    // Unrecognized character
    throw new Error(`Unrecognized symbol: "${ch}"`);
  }

  // Insert implicit multiplication: e.g. 2(3) -> 2 * (3), (2)(3) -> (2) * (3), 3sin(x) -> 3 * sin(x), 5! 2 -> 5! * 2
  const enriched: Token[] = [];
  for (let k = 0; k < tokens.length; k++) {
    const current = tokens[k];
    const prev = enriched[enriched.length - 1];

    if (prev) {
      const isPrevVal =
        prev.type === 'NUMBER' || prev.type === 'RPAREN' || prev.type === 'POSTFIX';
      const isCurrValOrFunc =
        current.type === 'NUMBER' || current.type === 'LPAREN' || current.type === 'FUNC';

      if (isPrevVal && isCurrValOrFunc) {
        enriched.push({ type: 'OP', value: '*' });
      }
    }

    enriched.push(current);
  }

  return enriched;
}

/**
 * Evaluates an expression using the Shunting-Yard algorithm and RPN stack
 */
export function evaluateExpression(expr: string, angleMode: AngleMode = 'DEG'): EvaluationResult {
  if (!expr || expr.trim() === '') {
    return { success: true, value: 0, formatted: '0' };
  }

  // Pre-process display glyphs
  let cleanExpr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/mod/g, '%');

  // Auto-balance unclosed parentheses for live preview
  let openParenCount = 0;
  for (const char of cleanExpr) {
    if (char === '(') openParenCount++;
    if (char === ')') openParenCount--;
  }
  if (openParenCount > 0) {
    cleanExpr += ')'.repeat(openParenCount);
  }

  try {
    const tokens = tokenize(cleanExpr);
    if (tokens.length === 0) {
      return { success: true, value: 0, formatted: '0' };
    }

    // Operator precedence & associativity
    const precedence: Record<string, number> = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      '%': 2,
      '^': 3,
      'unary-': 4,
      'unary+': 4,
    };

    const isRightAssociative: Record<string, boolean> = {
      '^': true,
      'unary-': true,
      'unary+': true,
    };

    // Shunting-yard: tokens to RPN
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'NUMBER') {
        outputQueue.push(token);
      } else if (token.type === 'FUNC') {
        operatorStack.push(token);
      } else if (token.type === 'POSTFIX') {
        outputQueue.push(token);
      } else if (token.type === 'OP') {
        let op = token.value;

        // Check if operator is unary + or -
        const prev = tokens[i - 1];
        const isUnary = !prev || prev.type === 'OP' || prev.type === 'LPAREN' || prev.type === 'COMMA';
        if (isUnary) {
          if (op === '-') op = 'unary-';
          else if (op === '+') op = 'unary+';
        }

        const currPrec = precedence[op] || 0;
        const currRightAssoc = isRightAssociative[op] || false;

        while (operatorStack.length > 0) {
          const top = operatorStack[operatorStack.length - 1];
          if (top.type === 'FUNC') {
            outputQueue.push(operatorStack.pop()!);
            continue;
          }
          if (top.type === 'OP') {
            const topPrec = precedence[top.value] || 0;
            if ((!currRightAssoc && currPrec <= topPrec) || (currRightAssoc && currPrec < topPrec)) {
              outputQueue.push(operatorStack.pop()!);
              continue;
            }
          }
          break;
        }

        operatorStack.push({ type: 'OP', value: op });
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let matched = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop()!;
          if (top.type === 'LPAREN') {
            matched = true;
            break;
          }
          outputQueue.push(top);
        }
        if (!matched) {
          throw new Error('Mismatched parentheses');
        }
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNC') {
          outputQueue.push(operatorStack.pop()!);
        }
      }
    }

    while (operatorStack.length > 0) {
      const top = operatorStack.pop()!;
      if (top.type === 'LPAREN' || top.type === 'RPAREN') {
        throw new Error('Mismatched parentheses');
      }
      outputQueue.push(top);
    }

    // Evaluate RPN
    const evalStack: number[] = [];

    for (const token of outputQueue) {
      if (token.type === 'NUMBER') {
        const val = parseFloat(token.value);
        if (isNaN(val)) throw new Error(`Invalid number: ${token.value}`);
        evalStack.push(val);
      } else if (token.type === 'POSTFIX' && token.value === '!') {
        if (evalStack.length < 1) throw new Error('Invalid syntax with "!"');
        const val = evalStack.pop()!;
        evalStack.push(factorial(val));
      } else if (token.type === 'OP') {
        if (token.value === 'unary-') {
          if (evalStack.length < 1) throw new Error('Missing operand for "-"');
          const a = evalStack.pop()!;
          evalStack.push(-a);
        } else if (token.value === 'unary+') {
          if (evalStack.length < 1) throw new Error('Missing operand for "+"');
          // No-op unary plus
        } else {
          if (evalStack.length < 2) throw new Error(`Missing operand for "${token.value}"`);
          const b = evalStack.pop()!;
          const a = evalStack.pop()!;
          switch (token.value) {
            case '+':
              evalStack.push(a + b);
              break;
            case '-':
              evalStack.push(a - b);
              break;
            case '*':
              evalStack.push(a * b);
              break;
            case '/':
              if (b === 0) throw new Error('Cannot divide by zero');
              evalStack.push(a / b);
              break;
            case '%':
              evalStack.push(a % b);
              break;
            case '^':
              evalStack.push(Math.pow(a, b));
              break;
            default:
              throw new Error(`Unknown operator: ${token.value}`);
          }
        }
      } else if (token.type === 'FUNC') {
        if (evalStack.length < 1) throw new Error(`Missing argument for function "${token.value}"`);
        const arg = evalStack.pop()!;
        evalStack.push(evaluateFunction(token.value, arg, angleMode));
      }
    }

    if (evalStack.length !== 1) {
      throw new Error('Invalid expression format');
    }

    const finalVal = evalStack[0];
    return {
      success: true,
      value: finalVal,
      formatted: formatResult(finalVal),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Calculation error';
    return {
      success: false,
      value: null,
      formatted: 'Error',
      error: msg,
    };
  }
}

/**
 * Mathematical function dispatcher with angle mode support and clean trigonometry rounding
 */
function evaluateFunction(funcName: string, arg: number, angleMode: AngleMode): number {
  switch (funcName) {
    // Trig
    case 'sin': {
      if (angleMode === 'DEG') {
        const normalized = ((arg % 360) + 360) % 360;
        if (normalized === 0 || normalized === 180) return 0;
        if (normalized === 90) return 1;
        if (normalized === 270) return -1;
      }
      const rad = toRadians(arg, angleMode);
      const res = Math.sin(rad);
      return Math.abs(res) < EPSILON ? 0 : res;
    }
    case 'cos': {
      if (angleMode === 'DEG') {
        const normalized = ((arg % 360) + 360) % 360;
        if (normalized === 90 || normalized === 270) return 0;
        if (normalized === 0) return 1;
        if (normalized === 180) return -1;
      }
      const rad = toRadians(arg, angleMode);
      const res = Math.cos(rad);
      return Math.abs(res) < EPSILON ? 0 : res;
    }
    case 'tan': {
      if (angleMode === 'DEG') {
        const normalized = ((arg % 360) + 360) % 360;
        if (normalized === 90 || normalized === 270) {
          throw new Error('Tangent undefined at 90°/270°');
        }
        if (normalized === 0 || normalized === 180) return 0;
        if (normalized === 45 || normalized === 225) return 1;
        if (normalized === 135 || normalized === 315) return -1;
      }
      const rad = toRadians(arg, angleMode);
      const res = Math.tan(rad);
      return Math.abs(res) < EPSILON ? 0 : res;
    }
    case 'asin': {
      if (arg < -1 || arg > 1) throw new Error('Domain error for sin⁻¹ (must be -1 to 1)');
      const rad = Math.asin(arg);
      return fromRadians(rad, angleMode);
    }
    case 'acos': {
      if (arg < -1 || arg > 1) throw new Error('Domain error for cos⁻¹ (must be -1 to 1)');
      const rad = Math.acos(arg);
      return fromRadians(rad, angleMode);
    }
    case 'atan': {
      const rad = Math.atan(arg);
      return fromRadians(rad, angleMode);
    }

    // Hyperbolic
    case 'sinh':
      return Math.sinh(arg);
    case 'cosh':
      return Math.cosh(arg);
    case 'tanh':
      return Math.tanh(arg);
    case 'asinh':
      return Math.asinh(arg);
    case 'acosh':
      if (arg < 1) throw new Error('Domain error for cosh⁻¹ (must be ≥ 1)');
      return Math.acosh(arg);
    case 'atanh':
      if (arg <= -1 || arg >= 1) throw new Error('Domain error for tanh⁻¹ (must be -1 < x < 1)');
      return Math.atanh(arg);

    // Logs & Exponentials
    case 'ln':
      if (arg <= 0) throw new Error('Domain error for ln (must be > 0)');
      return Math.log(arg);
    case 'log':
    case 'log10':
      if (arg <= 0) throw new Error('Domain error for log10 (must be > 0)');
      return Math.log10(arg);
    case 'log2':
      if (arg <= 0) throw new Error('Domain error for log2 (must be > 0)');
      return Math.log2(arg);
    case 'exp':
      return Math.exp(arg);

    // Roots & Abs
    case 'sqrt':
      if (arg < 0) throw new Error('Cannot take square root of negative number');
      return Math.sqrt(arg);
    case 'cbrt':
      return Math.cbrt(arg);
    case 'abs':
      return Math.abs(arg);
    case 'floor':
      return Math.floor(arg);
    case 'ceil':
      return Math.ceil(arg);
    case 'round':
      return Math.round(arg);

    default:
      throw new Error(`Function "${funcName}" not supported`);
  }
}

/**
 * Standard scientific physical constants with descriptions and accurate values
 */
export interface ScientificConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  category: 'Universal' | 'Atomic' | 'Astronomy' | 'Electromagnetic';
}

export const SCIENTIFIC_CONSTANTS: ScientificConstant[] = [
  { symbol: 'π', name: 'Pi (Archimedes Constant)', value: Math.PI, unit: '', category: 'Universal' },
  { symbol: 'e', name: "Euler's Number", value: Math.E, unit: '', category: 'Universal' },
  { symbol: 'φ', name: 'Golden Ratio', value: (1 + Math.sqrt(5)) / 2, unit: '', category: 'Universal' },
  { symbol: 'c', name: 'Speed of Light in Vacuum', value: 299792458, unit: 'm/s', category: 'Universal' },
  { symbol: 'G', name: 'Newtonian Constant of Gravitation', value: 6.67430e-11, unit: 'm³·kg⁻¹·s⁻²', category: 'Universal' },
  { symbol: 'h', name: "Planck's Constant", value: 6.62607015e-34, unit: 'J·s', category: 'Atomic' },
  { symbol: 'ħ', name: 'Reduced Planck Constant (h/2π)', value: 1.054571817e-34, unit: 'J·s', category: 'Atomic' },
  { symbol: 'N_A', name: 'Avogadro Constant', value: 6.02214076e23, unit: 'mol⁻¹', category: 'Atomic' },
  { symbol: 'k_B', name: 'Boltzmann Constant', value: 1.380649e-23, unit: 'J/K', category: 'Atomic' },
  { symbol: 'R', name: 'Universal Gas Constant', value: 8.314462618, unit: 'J/(mol·K)', category: 'Universal' },
  { symbol: 'e_charge', name: 'Elementary Charge', value: 1.602176634e-19, unit: 'C', category: 'Electromagnetic' },
  { symbol: 'm_e', name: 'Electron Rest Mass', value: 9.1093837015e-31, unit: 'kg', category: 'Atomic' },
  { symbol: 'm_p', name: 'Proton Rest Mass', value: 1.67262192369e-27, unit: 'kg', category: 'Atomic' },
  { symbol: 'g_earth', name: 'Standard Gravity on Earth', value: 9.80665, unit: 'm/s²', category: 'Astronomy' },
];
