/**
 * Bedrock Canary (.bdc) Lexer, Parser, and Transpiler/Compiler Engine
 * Designed for making Web and Mobile Apps with clean, intuitive syntax.
 */

const TokenType = {
  APP: 'APP',
  SCREEN: 'SCREEN',
  COMPONENT: 'COMPONENT',
  STATE: 'STATE',
  ACTION: 'ACTION',
  ON: 'ON',
  TEXT: 'TEXT',
  BUTTON: 'BUTTON',
  INPUT: 'INPUT',
  IMAGE: 'IMAGE',
  STACK: 'STACK',
  ROW: 'ROW',
  CARD: 'CARD',
  NAVIGATE: 'NAVIGATE',
  SET: 'SET',
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  EQUALS: 'EQUALS',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  ARROW: 'ARROW',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  COLON: 'COLON',
  EOF: 'EOF'
};

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

  tokenize() {
    const tokens = [];
    while (this.pos < this.input.length) {
      const char = this.input[this.pos];

      // Ignore whitespace
      if (/\s/.test(char)) {
        if (char === '\n') {
          this.line++;
          this.col = 1;
        } else {
          this.col++;
        }
        this.pos++;
        continue;
      }

      // Comments (# or //)
      if (char === '#' || (char === '/' && this.input[this.pos + 1] === '/')) {
        while (this.pos < this.input.length && this.input[this.pos] !== '\n') {
          this.pos++;
        }
        continue;
      }

      // Symbols
      if (char === '{') { tokens.push(this.makeToken(TokenType.LBRACE, '{')); this.pos++; continue; }
      if (char === '}') { tokens.push(this.makeToken(TokenType.RBRACE, '}')); this.pos++; continue; }
      if (char === '(') { tokens.push(this.makeToken(TokenType.LPAREN, '(')); this.pos++; continue; }
      if (char === ')') { tokens.push(this.makeToken(TokenType.RPAREN, ')')); this.pos++; continue; }
      if (char === '=') {
        if (this.input[this.pos + 1] === '>') {
          tokens.push(this.makeToken(TokenType.ARROW, '=>'));
          this.pos += 2;
          continue;
        }
        tokens.push(this.makeToken(TokenType.EQUALS, '='));
        this.pos++;
        continue;
      }
      if (char === ':') { tokens.push(this.makeToken(TokenType.COLON, ':')); this.pos++; continue; }
      if (char === '+') { tokens.push(this.makeToken(TokenType.PLUS, '+')); this.pos++; continue; }
      if (char === '-') { tokens.push(this.makeToken(TokenType.MINUS, '-')); this.pos++; continue; }

      // Strings
      if (char === '"' || char === "'") {
        const quote = char;
        let strVal = '';
        this.pos++;
        while (this.pos < this.input.length && this.input[this.pos] !== quote) {
          if (this.input[this.pos] === '\\') {
            this.pos++;
          }
          strVal += this.input[this.pos];
          this.pos++;
        }
        this.pos++; // skip closing quote
        tokens.push(this.makeToken(TokenType.STRING, strVal));
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let numStr = '';
        while (this.pos < this.input.length && /[0-9.]/.test(this.input[this.pos])) {
          numStr += this.input[this.pos];
          this.pos++;
        }
        tokens.push(this.makeToken(TokenType.NUMBER, parseFloat(numStr)));
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_]/.test(char)) {
        let idStr = '';
        while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
          idStr += this.input[this.pos];
          this.pos++;
        }

        const upper = idStr.toUpperCase();
        if (TokenType[upper]) {
          tokens.push(this.makeToken(TokenType[upper], idStr));
        } else {
          tokens.push(this.makeToken(TokenType.IDENTIFIER, idStr));
        }
        continue;
      }

      // Unknown token handling
      this.pos++;
    }

    tokens.push(this.makeToken(TokenType.EOF, ''));
    return tokens;
  }

  makeToken(type, value) {
    return { type, value, line: this.line, col: this.col };
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos] || { type: TokenType.EOF, value: '' };
  }

  consume(type) {
    const token = this.peek();
    if (type && token.type !== type) {
      throw new Error(`[Bedrock Canary Syntax Error] Expected token '${type}' but found '${token.type}' (${token.value}) at line ${token.line}`);
    }
    this.pos++;
    return token;
  }

  parse() {
    const ast = {
      type: 'Program',
      appName: 'BedrockApp',
      theme: 'auto',
      states: [],
      actions: [],
      screens: [],
      components: []
    };

    while (this.peek().type !== TokenType.EOF) {
      const token = this.peek();
      if (token.type === TokenType.APP) {
        this.consume(TokenType.APP);
        ast.appName = this.consume().value;
        if (this.peek().type === TokenType.LBRACE) {
          this.consume(TokenType.LBRACE);
          while (this.peek().type !== TokenType.RBRACE && this.peek().type !== TokenType.EOF) {
            const propKey = this.consume().value;
            this.consume(TokenType.COLON);
            const propVal = this.consume().value;
            if (propKey === 'theme') ast.theme = propVal;
          }
          this.consume(TokenType.RBRACE);
        }
      } else if (token.type === TokenType.STATE) {
        this.consume(TokenType.STATE);
        const name = this.consume(TokenType.IDENTIFIER).value;
        this.consume(TokenType.EQUALS);
        const valToken = this.consume();
        ast.states.push({ name, initialValue: valToken.value });
      } else if (token.type === TokenType.ACTION) {
        ast.actions.push(this.parseAction());
      } else if (token.type === TokenType.SCREEN) {
        ast.screens.push(this.parseScreen());
      } else if (token.type === TokenType.COMPONENT) {
        ast.components.push(this.parseComponent());
      } else {
        this.pos++;
      }
    }

    return ast;
  }

  parseAction() {
    this.consume(TokenType.ACTION);
    const name = this.consume(TokenType.IDENTIFIER).value;
    let params = [];
    if (this.peek().type === TokenType.LPAREN) {
      this.consume(TokenType.LPAREN);
      while (this.peek().type !== TokenType.RPAREN && this.peek().type !== TokenType.EOF) {
        params.push(this.consume(TokenType.IDENTIFIER).value);
      }
      this.consume(TokenType.RPAREN);
    }

    this.consume(TokenType.LBRACE);
    const steps = [];
    while (this.peek().type !== TokenType.RBRACE && this.peek().type !== TokenType.EOF) {
      const token = this.peek();
      if (token.type === TokenType.SET) {
        this.consume(TokenType.SET);
        const targetState = this.consume(TokenType.IDENTIFIER).value;
        this.consume(TokenType.EQUALS);
        const expr = this.parseExpression();
        steps.push({ type: 'SET_STATE', targetState, expr });
      } else if (token.type === TokenType.NAVIGATE) {
        this.consume(TokenType.NAVIGATE);
        const targetToken = this.consume();
        steps.push({ type: 'NAVIGATE', targetScreen: targetToken.value });
      } else {
        this.pos++;
      }
    }
    this.consume(TokenType.RBRACE);

    return { name, params, steps };
  }

  parseExpression() {
    let leftToken = this.consume();
    let left = leftToken.value;
    if (this.peek().type === TokenType.PLUS || this.peek().type === TokenType.MINUS) {
      const op = this.consume().value;
      const rightToken = this.consume();
      return { left, op, right: rightToken.value };
    }
    return { left };
  }

  parseScreen() {
    this.consume(TokenType.SCREEN);
    const nameToken = this.consume();
    const name = nameToken.value;
    let title = name;

    if (this.peek().type === TokenType.LPAREN) {
      this.consume(TokenType.LPAREN);
      title = this.consume(TokenType.STRING).value;
      this.consume(TokenType.RPAREN);
    }

    this.consume(TokenType.LBRACE);
    const elements = [];
    while (this.peek().type !== TokenType.RBRACE && this.peek().type !== TokenType.EOF) {
      elements.push(this.parseUIElement());
    }
    this.consume(TokenType.RBRACE);

    return { name, title, elements };
  }

  parseComponent() {
    this.consume(TokenType.COMPONENT);
    const name = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.LBRACE);
    const elements = [];
    while (this.peek().type !== TokenType.RBRACE && this.peek().type !== TokenType.EOF) {
      elements.push(this.parseUIElement());
    }
    this.consume(TokenType.RBRACE);
    return { name, elements };
  }

  parseUIElement() {
    const token = this.peek();
    const elementType = token.value.toLowerCase();
    this.consume();

    let content = '';
    let props = {};
    let children = [];

    if (this.peek().type === TokenType.LPAREN) {
      this.consume(TokenType.LPAREN);
      if (this.peek().type === TokenType.STRING || this.peek().type === TokenType.IDENTIFIER || this.peek().type === TokenType.NUMBER) {
        content = String(this.consume().value);
      }
      this.consume(TokenType.RPAREN);
    }

    if (this.peek().type === TokenType.ON) {
      this.consume(TokenType.ON);
      const eventName = this.consume().value; // e.g. click
      this.consume(TokenType.ARROW);
      const actionName = this.consume().value;
      props.onClick = actionName;
    }

    if (this.peek().type === TokenType.LBRACE) {
      this.consume(TokenType.LBRACE);
      while (this.peek().type !== TokenType.RBRACE && this.peek().type !== TokenType.EOF) {
        children.push(this.parseUIElement());
      }
      this.consume(TokenType.RBRACE);
    }

    return { type: elementType, content, props, children };
  }
}

class Compiler {
  static compileToHTML(ast) {
    const initialStateJSON = JSON.stringify(
      ast.states.reduce((acc, s) => ({ ...acc, [s.name]: s.initialValue }), {})
    );

    const actionsJSON = JSON.stringify(ast.actions);
    const screensJSON = JSON.stringify(ast.screens);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ast.appName} - Bedrock Canary Application</title>
  <style>
    :root {
      --primary: #f59e0b;
      --primary-dark: #d97706;
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --accent: #38bdf8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background-color: var(--bg); color: var(--text); display: flex; flex-direction: column; min-height: 100vh; align-items: center; justify-content: center; padding: 20px; }
    .bdc-phone-frame { width: 100%; max-width: 420px; background: var(--card-bg); border-radius: 28px; border: 4px solid #334155; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; min-height: 600px; position: relative; }
    .bdc-header { background: #1e293b; border-bottom: 1px solid #334155; padding: 16px; text-align: center; font-weight: bold; font-size: 1.1rem; color: var(--primary); display: flex; justify-content: space-between; align-items: center; }
    .bdc-badge { background: var(--primary); color: #000; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
    .bdc-content { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 16px; }
    .bdc-text { font-size: 1rem; color: #e2e8f0; }
    .bdc-heading { font-size: 1.5rem; font-weight: bold; color: #fff; margin-bottom: 8px; }
    .bdc-button { background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #000; font-weight: 700; padding: 12px 20px; border-radius: 12px; cursor: pointer; transition: transform 0.1s, opacity 0.2s; text-align: center; display: inline-block; }
    .bdc-button:active { transform: scale(0.97); }
    .bdc-card { background: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .bdc-stack { display: flex; flex-direction: column; gap: 12px; }
    .bdc-row { display: flex; flex-direction: row; gap: 12px; align-items: center; justify-content: space-between; }
    .bdc-input { background: #0f172a; border: 1px solid #334155; padding: 10px 14px; border-radius: 8px; color: #fff; font-size: 1rem; width: 100%; outline: none; }
    .bdc-input:focus { border-color: var(--primary); }
    .bdc-footer { font-size: 0.75rem; text-align: center; color: #64748b; padding: 12px; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="bdc-phone-frame">
    <div class="bdc-header">
      <span id="bdc-title">${ast.appName}</span>
      <span class="bdc-badge">BETA</span>
    </div>
    <div class="bdc-content" id="bdc-app-root"></div>
    <div class="bdc-footer">Powered by Bedrock Canary (.bdc)</div>
  </div>

  <script>
    const state = ${initialStateJSON};
    const actions = ${actionsJSON};
    const screens = ${screensJSON};
    let currentScreenIndex = 0;

    function evaluateExpr(expr) {
      let leftVal = state[expr.left] !== undefined ? state[expr.left] : expr.left;
      if (expr.op) {
        let rightVal = state[expr.right] !== undefined ? state[expr.right] : expr.right;
        if (expr.op === '+') return Number(leftVal) + Number(rightVal);
        if (expr.op === '-') return Number(leftVal) - Number(rightVal);
      }
      return leftVal;
    }

    function triggerAction(actionName) {
      const act = actions.find(a => a.name === actionName);
      if (!act) return;
      act.steps.forEach(step => {
        if (step.type === 'SET_STATE') {
          state[step.targetState] = evaluateExpr(step.expr);
        } else if (step.type === 'NAVIGATE') {
          const idx = screens.findIndex(s => s.name === step.targetScreen || s.title === step.targetScreen);
          if (idx !== -1) currentScreenIndex = idx;
        }
      });
      render();
    }

    function renderElement(el) {
      if (el.type === 'text') {
        const div = document.createElement('div');
        div.className = 'bdc-text';
        let txt = el.content;
        Object.keys(state).forEach(key => {
          txt = txt.replace('{' + key + '}', state[key]);
        });
        div.innerText = txt;
        return div;
      }

      if (el.type === 'button') {
        const btn = document.createElement('button');
        btn.className = 'bdc-button';
        btn.innerText = el.content;
        if (el.props && el.props.onClick) {
          btn.onclick = () => triggerAction(el.props.onClick);
        }
        return btn;
      }

      if (el.type === 'stack' || el.type === 'card' || el.type === 'row') {
        const container = document.createElement('div');
        container.className = 'bdc-' + el.type;
        (el.children || []).forEach(child => {
          container.appendChild(renderElement(child));
        });
        return container;
      }

      const fallback = document.createElement('div');
      fallback.innerText = el.content || el.type;
      return fallback;
    }

    function render() {
      const root = document.getElementById('bdc-app-root');
      root.innerHTML = '';
      const screen = screens[currentScreenIndex] || screens[0];
      if (!screen) {
        root.innerHTML = '<p>No screens defined.</p>';
        return;
      }
      document.getElementById('bdc-title').innerText = screen.title || screen.name;
      screen.elements.forEach(el => {
        root.appendChild(renderElement(el));
      });
    }

    render();
  </script>
</body>
</html>`;
  }
}

function transpileBDC(code) {
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const html = Compiler.compileToHTML(ast);
  return { ast, html };
}

module.exports = {
  TokenType,
  Lexer,
  Parser,
  Compiler,
  transpileBDC
};
