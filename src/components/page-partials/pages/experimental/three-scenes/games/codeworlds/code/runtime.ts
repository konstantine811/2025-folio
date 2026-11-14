import { parse, Node } from "acorn";
import { ZodError } from "zod";
import { CodeWorld, emptyWorld, entitySchema, SOURCE_LIMIT, worldSchema } from "./world-model";

// Interpret an explicit syntax subset. Never evaluate JavaScript in the host.
// No globals, prototype access, imports, callbacks, or arbitrary function calls.
type Ast = Node & { [key: string]: unknown };
type Value = null | boolean | number | string | Value[] | { [key: string]: Value };
type Binding = { value: Value; constant: boolean };
class Scope {
  values = new Map<string, Binding>();
  constructor(readonly parent?: Scope) {}
  get(name: string): Binding {
    const binding = this.values.get(name) ?? this.parent?.get(name);
    if (!binding) throw new Error(`Невідома змінна: ${name}`);
    return binding;
  }
}
const node = (value: unknown) => value as Ast;
const nodes = (value: unknown) => value as Ast[];
const forbidden = new Set(["__proto__", "prototype", "constructor"]);

export function runWorldCode(source: string): { world: CodeWorld; logs: string[] } {
  if (source.length > SOURCE_LIMIT) throw new Error("Код перевищує ліміт 20 000 символів");
  const tree = parse(source, { ecmaVersion: 2020, locations: true }) as unknown as Ast;
  const world = emptyWorld();
  const logs: string[] = [];
  let budget = 30000;
  let current: Ast = tree;
  const tick = (n: Ast) => { current = n; if (--budget < 0) throw new Error("Ліміт обчислень: перевір цикл"); };
  const number = (v: Value) => { if (typeof v !== "number" || !Number.isFinite(v)) throw new Error("Очікується скінченне число"); return v; };
  const text = (v: Value) => { if (typeof v !== "string") throw new Error("Очікується текст"); return v; };
  const object = (v: Value) => { if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("Очікується об’єкт параметрів"); return v; };

  function describe(value: Value, depth = 0): string {
    if (value === null || typeof value !== "object") return String(value).slice(0, 1000);
    if (depth >= 3) return "…";
    if (Array.isArray(value)) return "[" + value.slice(0, 10).map(v => describe(v, depth + 1)).join(", ").slice(0, 1000) + "]";
    return "{" + Object.entries(value).slice(0, 10).map(([k,v]) => k + ": " + describe(v, depth + 1)).join(", ").slice(0, 1000) + "}";
  }
  function api(method: string, args: Value[]): Value {
    const [a, b] = args;
    if (method === "name") { world.name = text(a); return null; }
    if (method === "ground") { world.ground = text(a); return null; }
    if (method === "spawn") { world.spawn = [number(a), number(b), number(args[2])]; return null; }
    if (method === "create") {
      if (world.entities.length >= 200) throw new Error("Ліміт: 200 об’єктів на світ");
      const prefab = text(a);
      const options = b === undefined ? {} : object(b);
      const size = prefab === "tree" ? [2, 4, 2] : prefab === "crystal" ? [1, 2, 1] : prefab === "platform" ? [4, 0.5, 4] : [2, 2, 2];
      const entity = entitySchema.parse({ id: `object-${world.entities.length + 1}`, prefab, position: [0, 0, 0], size, color: "#8eb6ad", ...options });
      world.entities.push(entity);
      return entity.id;
    }
    throw new Error(`Невідома команда world.${method}`);
  }

  function expression(n: Ast, scope: Scope): Value {
    tick(n);
    switch (n.type) {
      case "Literal": {
        if (n.regex || n.bigint) throw new Error("RegExp та BigInt поки не підтримуються");
        return n.value as Value;
      }
      case "Identifier": return scope.get(String(n.name)).value;
      case "ArrayExpression": return nodes(n.elements).map(v => expression(v, scope));
      case "ObjectExpression": {
        const value: Record<string, Value> = Object.create(null);
        for (const p of nodes(n.properties)) {
          if (p.type !== "Property" || p.kind !== "init" || p.method || p.computed) throw new Error("Підтримуються лише звичайні поля об’єкта");
          const key = String(node(p.key).name ?? node(p.key).value);
          if (forbidden.has(key)) throw new Error("Недоступне поле");
          value[key] = expression(node(p.value), scope);
        }
        return value;
      }
      case "MemberExpression": {
        const value = expression(node(n.object), scope);
        const key = n.computed ? expression(node(n.property), scope) : String(node(n.property).name);
        if (key === "length" && (Array.isArray(value) || typeof value === "string")) return value.length;
        if (Array.isArray(value) && typeof key === "number" && Number.isInteger(key) && key >= 0 && key < value.length) return value[key];
        throw new Error("Доступні лише індекси масивів і length");
      }
      case "UnaryExpression": {
        const v = expression(node(n.argument), scope);
        if (n.operator === "!") return !v;
        if (n.operator === "-") return -number(v);
        if (n.operator === "+") return number(v);
        throw new Error("Цей унарний оператор не підтримується");
      }
      case "LogicalExpression": {
        const a = expression(node(n.left), scope);
        if (n.operator === "&&") return a ? expression(node(n.right), scope) : a;
        if (n.operator === "||") return a || expression(node(n.right), scope);
        if (n.operator === "??") return a ?? expression(node(n.right), scope);
        throw new Error("Непідтримуваний оператор");
      }
      case "ConditionalExpression": return expression(node(expression(node(n.test), scope) ? n.consequent : n.alternate), scope);
      case "BinaryExpression": {
        const a = expression(node(n.left), scope), b = expression(node(n.right), scope);
        switch (n.operator) {
          case "+": { if ((a !== null && typeof a === "object") || (b !== null && typeof b === "object")) throw new Error("Додавати можна лише числа або текст"); const v = typeof a === "string" || typeof b === "string" ? String(a) + String(b) : number(a) + number(b); if (typeof v === "string" && v.length > 2000) throw new Error("Текст надто довгий"); return v; }
          case "-": return number(a) - number(b);
          case "*": return number(a) * number(b);
          case "/": return number(a) / number(b);
          case "%": return number(a) % number(b);
          case "<": return number(a) < number(b);
          case "<=": return number(a) <= number(b);
          case ">": return number(a) > number(b);
          case ">=": return number(a) >= number(b);
          case "===": return a === b;
          case "!==": return a !== b;
          default: throw new Error(`Оператор ${n.operator} поки не підтримується`);
        }
      }
      case "UpdateExpression": {
        if (node(n.argument).type !== "Identifier") throw new Error("Змінювати можна лише змінні");
        const binding = scope.get(String(node(n.argument).name));
        if (binding.constant) throw new Error("Не можна змінювати const");
        const previous = number(binding.value);
        binding.value = previous + (n.operator === "++" ? 1 : -1);
        return n.prefix ? binding.value : previous;
      }
      case "AssignmentExpression": {
        if (node(n.left).type !== "Identifier" || n.operator !== "=") throw new Error("Підтримується присвоєння змінній через =");
        const binding = scope.get(String(node(n.left).name));
        if (binding.constant) throw new Error("Не можна змінювати const");
        return binding.value = expression(node(n.right), scope);
      }
      case "CallExpression": {
        const callee = node(n.callee);
        if (callee.type !== "MemberExpression" || callee.computed || node(callee.object).type !== "Identifier") throw new Error("Використовуй команди world або console.log");
        const owner = String(node(callee.object).name), method = String(node(callee.property).name);
        const args = nodes(n.arguments).map(arg => expression(arg, scope));
        current = n;
        if (owner === "world") return api(method, args);
        if (owner === "console" && method === "log") {
          if (logs.length >= 50) throw new Error("Ліміт: 50 повідомлень консолі");
          logs.push(args.map(v => describe(v)).join(" ").slice(0, 1000));
          return null;
        }
        throw new Error("Доступні лише world.* та console.log");
      }
      default: throw new Error(`Синтаксис ${n.type} поки не підтримується`);
    }
  }
  function statement(n: Ast, scope: Scope): void {
    tick(n);
    switch (n.type) {
      case "Program": for (const child of nodes(n.body)) statement(child, scope); return;
      case "BlockStatement": { const inner = new Scope(scope); for (const child of nodes(n.body)) statement(child, inner); return; }
      case "EmptyStatement": return;
      case "ExpressionStatement": expression(node(n.expression), scope); return;
      case "VariableDeclaration":
        if (n.kind === "var") throw new Error("Використовуй let або const");
        for (const d of nodes(n.declarations)) {
          if (node(d.id).type !== "Identifier") throw new Error("Деструктуризація поки не підтримується");
          const name = String(node(d.id).name);
          if (scope.values.has(name) || ["world", "console"].includes(name)) throw new Error(`Ім’я ${name} вже зайняте`);
          scope.values.set(name, { value: d.init ? expression(node(d.init), scope) : null, constant: n.kind === "const" });
        }
        return;
      case "ForStatement": {
        const inner = new Scope(scope);
        if (n.init) { if (node(n.init).type === "VariableDeclaration") statement(node(n.init), inner); else expression(node(n.init), inner); }
        while (!n.test || expression(node(n.test), inner)) {
          tick(n); statement(node(n.body), inner);
          if (n.update) expression(node(n.update), inner);
        }
        return;
      }
      case "IfStatement":
        if (expression(node(n.test), scope)) statement(node(n.consequent), scope);
        else if (n.alternate) statement(node(n.alternate), scope);
        return;
      default: throw new Error(`Синтаксис ${n.type} поки не підтримується`);
    }
  }
  try {
    statement(tree, new Scope());
    return { world: worldSchema.parse(world), logs };
  } catch (error) {
    const message = error instanceof ZodError ? error.issues.map(issue => issue.message).join("; ") : error instanceof Error ? error.message : "Помилка виконання";
    throw new Error(`Рядок ${current.loc?.start.line ?? 1}: ${message}`);
  }
}
