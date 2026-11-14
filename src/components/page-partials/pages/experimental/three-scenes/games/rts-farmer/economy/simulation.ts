export const GOODS = ["apples", "wheat", "flour", "bread"] as const;
export type Good = typeof GOODS[number];
export type Place = "farm" | "mill" | "bakery" | "shop" | "garage";
export type Inventory = Record<Good, number>;
export const LABELS: Record<Good, string> = { apples: "Яблука", wheat: "Пшениця", flour: "Борошно", bread: "Хліб" };
export const ICONS: Record<Good, string> = { apples: "🍎", wheat: "🌾", flour: "🥣", bread: "🍞" };
export const CAPACITY = 20;
export const DELIVERY_COST = 5;
export const DRIVER_PRICE = 400;
export const BAKERY_PRICE = 1800;
export const REPAIR_PRICE = 180;
export const STOPS: Place[] = ["farm", "mill", "bakery", "shop"];
export const PLACES: Record<Place, { name: string; owner: string; point: [number, number]; building: [number, number]; color: string; description: string }> = {
  farm: { name: "Ферма «Колос»", owner: "Олена · фермерка", point: [-26, -20], building: [-37, -30], color: "#7c9659", description: "Яблука й пшениця просто з господарства." },
  mill: { name: "Старий млин", owner: "Микола · мірошник", point: [26, -20], building: [37, -30], color: "#bcaa86", description: "Купуємо зерно, виробляємо борошно." },
  bakery: { name: "Пекарня «Теплий хліб»", owner: "Софія · пекарка", point: [26, 20], building: [37, 30], color: "#c18562", description: "Борошно стає хлібом для всього району." },
  shop: { name: "Магазин «Поруч»", owner: "Марко · продавець", point: [-26, 20], building: [-37, 30], color: "#6e9694", description: "Мешканцям потрібні свіжі яблука та хліб." },
  garage: { name: "Твій гараж", owner: "База компанії", point: [0, -20], building: [0, -32], color: "#667e87", description: "Почни з першої доставки. Побудуй свою компанію." },
};
export const SELL_OFFERS: Partial<Record<Place, Partial<Record<Good, number>>>> = { farm: { apples: 20, wheat: 12 }, mill: { flour: 30 }, bakery: { bread: 52 } };
export const BUY_OFFERS: Partial<Record<Place, Partial<Record<Good, number>>>> = { mill: { wheat: 22 }, bakery: { flour: 42 }, shop: { apples: 35, bread: 72 } };
const empty = (): Inventory => ({ apples: 0, wheat: 0, flour: 0, bread: 0 });
export type Entry = { id: number; title: string; amount: number; detail: string };
export type EconomyState = {
  version: 1;
  seconds: number;
  money: number;
  cargo: Inventory;
  cargoCost: Inventory;
  stock: Record<Place, Inventory>;
  demand: Record<Place, Inventory>;
  deliveries: number;
  tradeProfit: number;
  driverHired: boolean;
  autoDriver: boolean;
  driverStop: number;
  bakeryOwned: boolean;
  bakeryBroken: boolean;
  bakeryBatches: number;
  breakdownSeen: boolean;
  repaired: boolean;
  reliefAt: number;
  ledger: Entry[];
  messages: string[];
  nextId: number;
};
export function initialEconomy(): EconomyState {
  return {
    version: 1, seconds: 0, money: 1000, cargo: empty(), cargoCost: empty(),
    stock: { farm: { ...empty(), apples: 60, wheat: 60 }, mill: { ...empty(), wheat: 16, flour: 40 }, bakery: { ...empty(), flour: 16, bread: 40 }, shop: empty(), garage: empty() },
    demand: { farm: empty(), mill: { ...empty(), wheat: 40 }, bakery: { ...empty(), flour: 40 }, shop: { ...empty(), apples: 40, bread: 40 }, garage: empty() },
    deliveries: 0, tradeProfit: 0, driverHired: false, autoDriver: false, driverStop: 0,
    bakeryOwned: false, bakeryBroken: false, bakeryBatches: 0, breakdownSeen: false, repaired: false,
    reliefAt: -60, ledger: [], messages: ["Марко з магазину чекає на яблука. Купи 20 ящиків на фермі й достав їх до магазину."], nextId: 1,
  };
}
export const cargoCount = (state: EconomyState) => GOODS.reduce((sum, good) => sum + state.cargo[good], 0);
export function purchasePrice(state: EconomyState, place: Place, good: Good) {
  const base = SELL_OFFERS[place]?.[good];
  if (base === undefined) return 0;
  if (place === "bakery" && state.bakeryOwned) return 0;
  const stock = state.stock[place][good];
  const harvest = place === "farm" && state.seconds >= 120 && state.seconds % 120 < 30;
  return Math.max(1, Math.round(base * (harvest ? 0.85 : stock < 10 ? 1.15 : 1)));
}
export function salePrice(state: EconomyState, place: Place, good: Good) {
  if (place === "bakery" && state.bakeryOwned) return 0;
  const base = BUY_OFFERS[place]?.[good] ?? 0;
  return Math.round(base * (state.demand[place][good] < 10 ? 0.8 : 1));
}
function note(state: EconomyState, message: string) { state.messages = [message, ...state.messages].slice(0, 6); }
function book(state: EconomyState, title: string, amount: number, detail: string) {
  state.money = Math.round((state.money + amount) * 100) / 100;
  state.ledger = [{ id: state.nextId++, title, amount, detail }, ...state.ledger].slice(0, 30);
}
function trade(state: EconomyState, direction: "buy" | "sell", place: Place, good: Good, requested: number, silent = false) {
  const quantity = Math.floor(requested);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > CAPACITY) return;
  const fail = (message: string) => { if (!silent) note(state, message); };
  if (direction === "buy") {
    if (SELL_OFFERS[place]?.[good] === undefined) return fail("Тут не продають цей товар.");
    if (place === "bakery" && state.bakeryBroken) return fail("Піч зламана. Відремонтуй її або зміни маршрут.");
    const price = purchasePrice(state, place, good);
    if (quantity > CAPACITY - cargoCount(state)) return fail("У фургоні немає стільки місця. Місткість — 20 ящиків.");
    if (quantity > state.stock[place][good]) return fail("На складі недостатньо товару. Зачекай на нову партію.");
    if (price * quantity > state.money) return fail("Недостатньо монет. Купи меншу партію або виконай підробіток у гаражі.");
    state.stock[place][good] -= quantity;
    state.cargo[good] += quantity;
    state.cargoCost[good] += price * quantity;
    book(state, `Закупівля: ${LABELS[good]}`, -price * quantity, `${quantity} ящ. × ${price} мон.`);
    if (!silent) note(state, `Завантажено: ${LABELS[good].toLowerCase()}, ${quantity} ящ. Товар уже у фургоні.`);
  } else {
    if (BUY_OFFERS[place]?.[good] === undefined) return fail("Це підприємство не купує цей товар.");
    if (place === "bakery" && state.bakeryBroken) return fail("Пекарня тимчасово не приймає борошно: піч потребує ремонту.");
    if (state.cargo[good] < quantity) return fail("У фургоні недостатньо цього товару.");
    if (state.demand[place][good] < quantity) return fail("Покупцеві зараз не потрібна така кількість. Продай меншу партію.");
    const revenue = salePrice(state, place, good) * quantity;
    const cost = state.cargoCost[good] * quantity / state.cargo[good];
    const delivery = quantity * DELIVERY_COST;
    const internalTransfer = place === "bakery" && state.bakeryOwned;
    if (internalTransfer && state.money < delivery) return fail("Потрібен резерв на витрати маршруту до власної пекарні.");
    const profit = revenue - cost - delivery;
    state.cargo[good] -= quantity;
    state.cargoCost[good] = state.cargo[good] === 0 ? 0 : state.cargoCost[good] - cost;
    state.demand[place][good] -= quantity;
    if (place !== "shop") state.stock[place][good] += quantity;
    state.deliveries++;
    if (!internalTransfer) state.tradeProfit += profit;
    book(state, `${internalTransfer ? "Власне постачання" : "Доставка"}: ${LABELS[good]}`, revenue - delivery,
      internalTransfer ? `Передано ${quantity} ящ. у власне виробництво. Закупівлю вже оплачено; витрати маршруту ${delivery} мон.`
        : `Виручка ${revenue} − закупівля ${Math.round(cost)} − маршрут ${delivery} = ${Math.round(profit)} мон. прибутку`);
    if (!silent) note(state, internalTransfer ? "Борошно доставлено у власну пекарню. Внутрішня передача не приносить виручки — прибуток з'явиться після продажу хліба." : `Доставку завершено! Прибуток: ${Math.round(profit)} мон. Виручка та прибуток — різні речі.`);
  }
}
export type EconomyAction =
  | { type: "tick" }
  | { type: "trade"; direction: "buy" | "sell"; place: Place; good: Good; quantity: number }
  | { type: "hire" } | { type: "buyBakery" } | { type: "repair" }
  | { type: "automation"; enabled: boolean } | { type: "arrive" }
  | { type: "relief" } | { type: "message"; text: string };

export function reduceEconomy(previous: EconomyState, action: EconomyAction): EconomyState {
  const state: EconomyState = structuredClone(previous);
  switch (action.type) {
    case "message": note(state, action.text); break;
    case "trade": trade(state, action.direction, action.place, action.good, action.quantity); break;
    case "hire":
      if (state.driverHired) break;
      if (state.deliveries < 3) { note(state, "Спочатку заверши три доставки, щоб навчити водія маршруту."); break; }
      if (state.money < DRIVER_PRICE) { note(state, "Для найму потрібно 400 монет."); break; }
      book(state, "Найм водія Андрія", -DRIVER_PRICE, "Підготовка й навчання. Зміна: до 4 хвилин, потім 30 с відпочинку.");
      state.driverHired = true;
      note(state, "Андрій готовий. Передай йому фургон: він об'їжджатиме підприємства й виконуватиме доставки. Оплата — 30 мон. за коло."); break;
    case "automation":
      state.autoDriver = action.enabled && state.driverHired;
      note(state, state.autoDriver ? "Водій прийняв маршрут: ферма → млин → пекарня → магазин." : "Автомаршрут призупинено. Фургон доступний для тебе."); break;
    case "arrive": {
      if (!state.autoDriver || !state.driverHired) break;
      const place = STOPS[state.driverStop];
      for (const good of GOODS) {
        if (BUY_OFFERS[place]?.[good] === undefined || (place === "bakery" && state.bakeryBroken)) continue;
        const amount = Math.min(state.cargo[good], state.demand[place][good]);
        if (amount) trade(state, "sell", place, good, amount, true);
      }
      for (const good of GOODS) {
        if (SELL_OFFERS[place]?.[good] === undefined || (place === "bakery" && state.bakeryBroken)) continue;
        const price = purchasePrice(state, place, good);
        const amount = Math.min(10, CAPACITY - cargoCount(state), state.stock[place][good], price ? Math.floor(Math.max(0, state.money - 30) / price) : 10);
        if (amount) trade(state, "buy", place, good, amount, true);
      }
      if (place === "shop") {
        if (state.money >= 30) book(state, "Оплата водію", -30, "Один повний маршрут");
        else { state.autoDriver = false; note(state, "Маршрут зупинено: залиш резерв 30 монет на оплату водієві."); }
      }
      state.driverStop = (state.driverStop + 1) % STOPS.length;
      break;
    }
    case "buyBakery":
      if (state.bakeryOwned) break;
      if (!state.driverHired) { note(state, "Спочатку найми водія — він забезпечить постачання твоєї пекарні."); break; }
      if (state.money < BAKERY_PRICE) { note(state, "Для купівлі пекарні потрібно 1800 монет. Збережи ще й резерв на роботу."); break; }
      book(state, "Купівля пекарні", -BAKERY_PRICE, "Обладнання, склад і команда. Запас борошна та хліба включено.");
      state.bakeryOwned = true;
      note(state, "Пекарня твоя! Кожні 10 с виробляється хліб. Сировина й робота коштують грошей; власний хліб забирай без повторної оплати."); break;
    case "repair":
      if (!state.bakeryOwned || !state.bakeryBroken) break;
      if (state.money < REPAIR_PRICE) { note(state, "Ремонт коштує 180 монет. Зароби на іншому маршруті або візьми підробіток у гаражі."); break; }
      book(state, "Ремонт печі", -REPAIR_PRICE, "Майстер відновив виробництво"); state.bakeryBroken = false; state.repaired = true;
      note(state, "Піч знову працює. Перший рубіж пройдено: доставки, команда, власна пекарня й подолана поломка!"); break;
    case "relief":
      if (state.seconds - state.reliefAt < 60) { note(state, "Наступний підробіток з'явиться через хвилину після попереднього."); break; }
      state.reliefAt = state.seconds;
      book(state, "Підробіток: сортування посилок", 150, "Допомога сусідам у гаражі"); note(state, "Посилки відсортовано. +150 монет. Це допоможе відновити справи після невдачі."); break;
    case "tick": {
      state.seconds++;
      if (state.seconds % 120 === 0) note(state, "Гарний урожай! Протягом 30 секунд яблука та пшениця на фермі дешевші на 15%.");
      if (state.seconds % 10 !== 0) break;
      state.stock.farm.apples = Math.min(80, state.stock.farm.apples + 6);
      state.stock.farm.wheat = Math.min(80, state.stock.farm.wheat + 6);
      for (const place of STOPS) for (const good of GOODS) {
        const max = BUY_OFFERS[place]?.[good] === undefined ? 0 : 40;
        state.demand[place][good] = Math.min(max, state.demand[place][good] + 4);
      }
      // NPCs keep the district supplied even before the player owns a business.
      if (state.stock.mill.wheat < 4 && state.stock.farm.wheat >= 4) {
        state.stock.farm.wheat -= 4; state.stock.mill.wheat += 4;
      }
      if (state.stock.mill.wheat >= 2 && state.stock.mill.flour <= 78) {
        state.stock.mill.wheat -= 2; state.stock.mill.flour += 2;
      }
      if (state.bakeryBroken) break;
      if (state.stock.bakery.flour < 2 && state.stock.mill.flour >= 2) {
        const cost = 2 * purchasePrice(state, "mill", "flour");
        if (!state.bakeryOwned || state.money >= cost + 16) {
          state.stock.mill.flour -= 2; state.stock.bakery.flour += 2;
          if (state.bakeryOwned) book(state, "Сировина для пекарні", -cost, "2 ящики борошна");
        }
      }
      if (state.stock.bakery.flour >= 2 && state.stock.bakery.bread <= 78 && (!state.bakeryOwned || state.money >= 16)) {
        state.stock.bakery.flour -= 2; state.stock.bakery.bread += 2;
        if (state.bakeryOwned) {
          book(state, "Робота пекарні", -16, "Випечено 2 ящики хліба: праця та енергія");
          state.bakeryBatches++;
          if (state.bakeryBatches >= 5 && !state.breakdownSeen) {
            state.bakeryBroken = true; state.breakdownSeen = true;
            note(state, "Піч зламалась. Виробництво призупинене, люди в безпеці. Ремонт — 180 монет. Інші маршрути продовжують працювати.");
          }
        }
      }
      if (state.stock.bakery.bread >= 2 && state.demand.shop.bread >= 2) {
        state.stock.bakery.bread -= 2; state.demand.shop.bread -= 2;
        if (state.bakeryOwned) book(state, "Продажі пекарні мешканцям", 104, "2 ящики × 52 мон. Це виручка; витрати записано окремо.");
      }
      break;
    }
  }
  return state;
}
export function objective(state: EconomyState) {
  if (state.deliveries < 3) return { title: "Твоя перша справа", text: `Достав яблука з ферми до магазину. Виконано ${state.deliveries}/3 доставок.` };
  if (!state.driverHired) return { title: "Збери команду", text: "Найми водія в телефоні за 400 монет. Передай йому фургон." };
  if (!state.bakeryOwned) return { title: "Від перевезень до виробництва", text: "Накопич 1800 монет і придбай пекарню. Водій може заробляти, поки ти досліджуєш район." };
  if (!state.repaired) return { title: "Подбай про свій бізнес", text: state.bakeryBroken ? "Піч потребує ремонту. Віднови виробництво за 180 монет." : "Пекарня працює. Тримай резерв 180 монет на ремонт обладнання." };
  return { title: "Компанія працює!", text: "Перший рубіж завершено. Продовжуй доставки й розвивай власне виробництво." };
}
