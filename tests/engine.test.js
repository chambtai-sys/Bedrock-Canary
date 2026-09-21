const assert = require('assert');
const { test } = require('node:test');
const { Lexer, Parser, transpileBDC } = require('../src/index.js');

test('Lexer tokenizes Bedrock Canary source correctly', () => {
  const code = `
    App "TestApp" { theme: "dark" }
    State count = 0
    Action increment { set count = count + 1 }
    Screen Home("Home Screen") {
      Stack {
        Text("Count: {count}")
        Button("Increment") on click => increment
      }
    }
  `;
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  assert.ok(tokens.length > 0);
  assert.strictEqual(tokens[0].value, 'App');
});

test('Parser constructs AST correctly from .bdc tokens', () => {
  const code = `
    App TestApp { theme: dark }
    State count = 0
    Action increment { set count = count + 1 }
    Screen Home("Home Screen") {
      Stack {
        Text("Count: {count}")
        Button("Increment") on click => increment
      }
    }
  `;
  const lexer = new Lexer(code);
  const parser = new Parser(lexer.tokenize());
  const ast = parser.parse();

  assert.strictEqual(ast.appName, 'TestApp');
  assert.strictEqual(ast.states.length, 1);
  assert.strictEqual(ast.states[0].name, 'count');
  assert.strictEqual(ast.states[0].initialValue, 0);
  assert.strictEqual(ast.actions.length, 1);
  assert.strictEqual(ast.actions[0].name, 'increment');
  assert.strictEqual(ast.screens.length, 1);
  assert.strictEqual(ast.screens[0].name, 'Home');
  assert.strictEqual(ast.screens[0].title, 'Home Screen');
});

test('transpileBDC generates compiled HTML output', () => {
  const code = `
    App CanaryDemo { theme: dark }
    State score = 10
    Screen Main("Main Screen") {
      Card {
        Text("Score: {score}")
      }
    }
  `;
  const { ast, html } = transpileBDC(code);
  assert.strictEqual(ast.appName, 'CanaryDemo');
  assert.ok(html.includes('CanaryDemo - Bedrock Canary Application'));
  assert.ok(html.includes('bdc-phone-frame'));
});
