import { useState } from "react";
import { BAKERY_PRICE, BUY_OFFERS, CAPACITY, DELIVERY_COST, DRIVER_PRICE, GOODS, Good, ICONS, LABELS, PLACES, Place, REPAIR_PRICE, SELL_OFFERS, STOPS, cargoCount, objective, purchasePrice, salePrice } from "./economy/simulation";
import { actorPosition, canTrade, closestPlace, useBusinessStore, vehicleRuntime } from "./economy/store";

const money = (value: number) => Math.round(value).toLocaleString("uk-UA");
const button = "rounded-xl bg-[#e8d395] px-4 py-2.5 text-xs font-bold text-[#203e33] transition hover:bg-[#f3e2b5] disabled:cursor-not-allowed disabled:opacity-40";
const card = "rounded-2xl border border-[#d3d8c9] bg-[#fffdf5] p-4";

export function DistrictMap({ compact = false }: { compact?: boolean }) {
  const driving = useBusinessStore(s => s.driving);
  useBusinessStore(s => s.state.seconds);
  const p = actorPosition();
  return <svg viewBox="0 0 320 220" className="w-full rounded-2xl bg-[#e1e8d5]" aria-label="Карта району: ферма, млин, пекарня, магазин і гараж">
    <rect x="55" y="48" width="210" height="130" rx="8" fill="#c5d1b5" stroke="#8d9c8e" strokeWidth="12" />
    <rect x="55" y="48" width="210" height="130" rx="8" fill="none" stroke="#e9e2c9" strokeWidth="1.5" strokeDasharray="7 6" />
    <path d="M120 78h80v70h-80z" fill="#b2c39d" />
    <circle cx="160" cy="113" r="12" fill="#96b3ad" />
    {(Object.keys(PLACES) as Place[]).map(place => {
      const [x, z] = PLACES[place].point; const sx = 160 + x * 4, sy = 113 + z * 3.2;
      return <g key={place}>
        <circle cx={sx} cy={sy} r="9" fill={PLACES[place].color} stroke="#fffdf5" strokeWidth="3" />
        <text x={sx} y={sy + (z < 0 ? -19 : 27)} textAnchor="middle" fontSize={compact ? "10" : "11"} fill="#294537" fontFamily="sans-serif">{{ farm: "ФЕРМА", mill: "МЛИН", bakery: "ПЕКАРНЯ", shop: "МАГАЗИН", garage: "ГАРАЖ" }[place]}</text>
      </g>;
    })}
    <circle cx={160 + vehicleRuntime.position[0] * 4} cy={113 + vehicleRuntime.position[2] * 3.2} r="5" fill="#d3a444" stroke="#fff" strokeWidth="2" />
    {!driving && <circle cx={160 + p[0] * 4} cy={113 + p[2] * 3.2} r="4" fill="#244d3f" stroke="#fff" strokeWidth="2" />}
    <text x="160" y="210" textAnchor="middle" fontSize="9" fill="#546d5a">ЗЕЛЕНА ТОЧКА — ТИ · ЖОВТА — ФУРГОН</text>
  </svg>;
}
function TradeCard({ place, good, direction }: { place: Place; good: Good; direction: "buy" | "sell" }) {
  const state = useBusinessStore(s => s.state);
  const trade = useBusinessStore(s => s.trade);
  const [quantity, setQuantity] = useState(10);
  const price = direction === "buy" ? purchasePrice(state, place, good) : salePrice(state, place, good);
  const available = direction === "buy" ? state.stock[place][good] : state.demand[place][good];
  const max = Math.min(20, available, direction === "buy" ? CAPACITY - cargoCount(state) : state.cargo[good], direction === "buy" && price ? Math.floor(state.money / price) : 20);
  const amount = Math.min(quantity, Math.max(0, max));
  const locked = !canTrade(place) || amount < 1 || (place === "bakery" && state.bakeryBroken);
  const cost = state.cargo[good] ? state.cargoCost[good] / state.cargo[good] : 0;
  return <div className={card}>
    <div className="flex items-center justify-between"><strong className="text-sm">{ICONS[good]} {LABELS[good]}</strong><span className="text-sm font-bold">{price === 0 ? "Власний товар" : `${price} мон./ящ.`}</span></div>
    <p className="mt-1 text-xs text-[#71816b]">{direction === "buy" ? "На складі" : "Покупцеві потрібно"}: {available} ящ.</p>
    <div className="my-3 flex items-center gap-2">
      <label className="text-xs" htmlFor={`${direction}-${good}`}>Ящиків</label>
      <input id={`${direction}-${good}`} type="number" min="1" max="20" value={quantity} onChange={event => setQuantity(Math.max(1, Math.min(20, Math.floor(Number(event.target.value) || 1))))} className="w-16 rounded-lg border border-[#cbd3c1] bg-white px-2 py-1 text-sm" />
      <button onClick={() => setQuantity(Math.max(1, max))} className="text-[11px] underline">Макс. {max}</button>
    </div>
    {direction === "sell" && <p className="mb-3 text-[11px] leading-relaxed text-[#60725e]">Виручка {money(price * amount)} − закупівля {money(cost * amount)} − маршрут {DELIVERY_COST * amount} = <b>{money((price - cost - DELIVERY_COST) * amount)} мон. прибутку</b></p>}
    <button className={`${button} w-full`} disabled={locked} onClick={() => trade(place, direction, good, amount)}>
      {direction === "buy" ? "Завантажити" : "Доставити"} {amount} ящ. · {money(direction === "buy" ? price * amount : (price - DELIVERY_COST) * amount)} мон.
    </button>
  </div>;
}
export function CompanyPhone() {
  const store = useBusinessStore();
  const { state, phonePage: page } = store;
  const [resetConfirm, setResetConfirm] = useState(false);
  const place = closestPlace();
  const mission = objective(state);
  const setPage = (value: typeof page) => useBusinessStore.setState({ phonePage: value });
  return <div className="absolute inset-0 z-30 flex items-stretch justify-end bg-[#102a23]/35 p-2 backdrop-blur-[2px] sm:p-5">
    <section role="dialog" aria-modal="true" aria-label="Телефон компанії" className="flex w-full max-w-[440px] flex-col overflow-hidden rounded-[26px] border border-[#cdd5bf] bg-[#f0f1e6] text-[#284334] shadow-2xl">
      <header className="bg-[#1e4034] px-5 pb-5 pt-4 text-[#fbf6df]">
        <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em]"><span>◉ Мій район · день {Math.floor(state.seconds / 120) + 1}</span><button onClick={() => store.setPhone(false)} className="rounded-lg bg-white/10 px-3 py-2 text-xs tracking-normal" autoFocus>Закрити · Tab</button></div>
        <p className="text-xs text-[#b5c7ad]">Моя компанія</p>
        <div className="mt-1 flex items-end justify-between"><h2 className="text-3xl font-bold">{money(state.money)} <span className="text-sm font-normal">мон.</span></h2><span className="rounded-lg bg-white/10 px-2 py-1 text-[10px]">Час на паузі</span></div>
      </header>
      <nav aria-label="Розділи телефону" className="flex gap-1 border-b border-[#d3d8c9] px-3 py-2">
        {([['route', 'Маршрут'], ['trade', 'Торгівля'], ['company', 'Компанія'], ['ledger', 'Фінанси']] as const).map(([id, title]) => <button key={id} aria-pressed={page === id} className={`flex-1 rounded-lg px-1 py-2 text-[11px] font-semibold ${page === id ? "bg-[#284c3c] text-white" : "hover:bg-white"}`} onClick={() => setPage(id)}>{title}</button>)}
      </nav>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {state.messages[0] && <div role="status" className="rounded-xl border border-[#d4d7bc] bg-[#e7e8d2] px-3 py-3 text-xs leading-relaxed">{state.messages[0]}</div>}
        {page === "route" && <>
          <div className={card}><p className="text-[10px] font-bold uppercase tracking-widest text-[#83916f]">Наступний крок</p><h3 className="mt-1 text-lg font-bold">{mission.title}</h3><p className="mt-2 text-xs leading-relaxed">{mission.text}</p></div>
          <DistrictMap />
          <div className={card}><h3 className="text-sm font-bold">Перша доставка · яблука</h3><ol className="mt-3 list-inside list-decimal space-y-2 text-xs leading-relaxed"><li>Закрий телефон. Підійди до фургона й натисни F.</li><li>На W/A/S/D доїдь ліворуч до ферми.</li><li>Зупинись біля власниці. E → купи 20 ящиків.</li><li>Достав яблука до магазину на іншому кінці дороги.</li><li>E → продай партію. Перевір прибуток у фінансах.</li></ol><p className="mt-3 rounded-lg bg-[#f0efdf] p-3 text-[11px]">20 × 20 закупівля + 100 маршрут → 700 виручка → <b>200 мон. прибутку</b> за звичайних цін і достатнього попиту.</p></div>
          <div className={card}><h3 className="text-sm font-bold">Один район · повний ланцюжок</h3><div className="mt-3 space-y-3">{STOPS.map(id => <div key={id}><strong className="text-xs">{PLACES[id].name}</strong><p className="mt-0.5 text-[11px] text-[#76816d]">{PLACES[id].description}</p></div>)}</div></div>
        </>}
        {page === "trade" && <>
          <div className={card}><h3 className="text-lg font-bold">{place ? PLACES[place].name : "Підійди до підприємства"}</h3><p className="mt-1 text-xs text-[#71816b]">{place ? PLACES[place].owner : "Торгівля доступна на позначених майданчиках. Фургон має бути поруч і стояти."}</p>{place && !canTrade(place) && <p className="mt-2 text-xs text-[#9a633e]">Припаркуй фургон ближче до майданчика завантаження.</p>}</div>
          {place && GOODS.filter(good => SELL_OFFERS[place]?.[good] !== undefined).map(good => <TradeCard key={`buy-${place}-${good}`} place={place} good={good} direction="buy" />)}
          {place && GOODS.filter(good => BUY_OFFERS[place]?.[good] !== undefined).map(good => <TradeCard key={`sell-${place}-${good}`} place={place} good={good} direction="sell" />)}
          {place === "garage" && <div className={card}><h3 className="text-sm font-bold">Підробіток у гаражі</h3><p className="my-3 text-xs leading-relaxed">Допоможи сусідам розсортувати посилки. +150 монет, раз на хвилину ігрового часу.</p><button className={button} disabled={state.seconds - state.reliefAt < 60} onClick={() => store.dispatch({ type: "relief" })}>Сортувати посилки · +150</button></div>}
          <div className={card}><h3 className="text-sm font-bold">Вантаж · {cargoCount(state)}/{CAPACITY}</h3><div className="mt-3 space-y-2">{GOODS.map(good => <div key={good} className="flex justify-between text-xs"><span>{ICONS[good]} {LABELS[good]}</span><b>{state.cargo[good]} ящ.</b></div>)}</div></div>
          <p className="px-1 text-[11px] leading-relaxed text-[#71816b]">Маршрут коштує 5 монет за доставлений ящик: пальне й обслуговування. Списується при продажі. Низький попит зменшує ціну; нові замовлення з'являються з часом.</p>
        </>}
        {page === "company" && <>
          <div className={card}><div className="flex justify-between"><h3 className="text-base font-bold">Андрій · водій</h3><span>{state.driverHired ? "● У команді" : "○ Вільний"}</span></div><p className="my-3 text-xs leading-relaxed">Один фургон, один маршрут через усі підприємства. 30 монет за коло. Через 4 хв роботи — 30 с відпочинку. Можеш зупинити маршрут, підійти до фургона й сісти за кермо.</p>
            {!state.driverHired ? <button className={button} disabled={state.deliveries < 3 || state.money < DRIVER_PRICE} onClick={() => store.dispatch({ type: "hire" })}>Найняти · {DRIVER_PRICE} мон. · {Math.min(3, state.deliveries)}/3 доставок</button>
              : <button className={button} disabled={store.driving} onClick={() => store.dispatch({ type: "automation", enabled: !state.autoDriver })}>{state.autoDriver ? "Зупинити автомаршрут" : "Передати фургон водію"}</button>}
            {store.driving && <p className="mt-2 text-[11px]">Зупинись і вийди з фургона на F перед передачею водію.</p>}
            {state.autoDriver && <p className="mt-2 text-[11px]">Наступна зупинка: {PLACES[STOPS[state.driverStop]].name}. Маршрут продовжиться після закриття телефону.</p>}
          </div>
          <div className={card}><div className="flex items-center justify-between"><h3 className="text-base font-bold">Пекарня «Теплий хліб»</h3><span className={`h-2 w-2 rounded-full ${state.bakeryBroken ? "bg-red-500" : "bg-green-600"}`} /></div>
            <p className="mt-2 text-xs leading-relaxed">{state.bakeryOwned ? "Твоє підприємство. Борошно перетворюється на хліб, мешканці купують готову продукцію." : "Оглянь підприємство біля Софії. У ціну входять піч, приміщення й наявні запаси."}</p>
            <dl className="my-3 space-y-2 rounded-xl bg-[#f0efdf] p-3 text-xs"><div className="flex justify-between"><dt>Виробництво</dt><dd>2 ящ. / 10 с</dd></div><div className="flex justify-between"><dt>Борошно на 2 ящ.</dt><dd>60 мон. за звичайної ціни</dd></div><div className="flex justify-between"><dt>Праця й енергія</dt><dd>16 мон. / партія</dd></div><div className="flex justify-between"><dt>Виручка за 2 ящ.</dt><dd>104 мон.</dd></div><div className="flex justify-between font-bold"><dt>Прибуток за звичайних цін</dt><dd>28 мон. / партія</dd></div></dl>
            {!state.bakeryOwned ? <button className={button} disabled={!state.driverHired || state.money < BAKERY_PRICE || place !== "bakery"} onClick={() => store.dispatch({ type: "buyBakery" })}>Придбати · {BAKERY_PRICE} мон.</button>
              : state.bakeryBroken ? <button className={button} disabled={state.money < REPAIR_PRICE} onClick={() => store.dispatch({ type: "repair" })}>Викликати майстра · {REPAIR_PRICE} мон.</button> : <span className="text-xs font-bold text-[#53804e]">● Піч працює · випущено {state.bakeryBatches} партій</span>}
            {!state.bakeryOwned && place !== "bakery" && <p className="mt-2 text-[11px] text-[#71816b]">Для купівлі приїдь до пекарні та спочатку найми водія.</p>}
          </div>
          <div className={card}><h3 className="text-sm font-bold">Збереження</h3><p className="my-3 text-xs leading-relaxed">Прогрес автоматично зберігається в цьому браузері. Поки гра закрита, симуляція не рухається.</p>{store.saveError && <p className="mb-3 text-xs text-red-700">Браузер не дозволив зберегти гру. Залишай цю вкладку відкритою.</p>}<button className="text-xs text-[#997253] underline" onClick={() => setResetConfirm(!resetConfirm)}>Почати нову компанію</button>{resetConfirm && <div className="mt-3 rounded-lg bg-[#f5e2cf] p-3 text-xs"><p>Поточний прогрес у цьому браузері буде замінено новою грою.</p><div className="mt-3 flex gap-3"><button className={button} onClick={() => { store.reset(); setResetConfirm(false); }}>Почати заново</button><button onClick={() => setResetConfirm(false)}>Скасувати</button></div></div>}</div>
        </>}
        {page === "ledger" && <>
          <div className={card}><p className="text-xs text-[#7f8b74]">Прибуток завершених доставок</p><h3 className="mt-1 text-2xl font-bold">{money(state.tradeProfit)} мон.</h3><p className="mt-2 text-[11px]">Виконано доставок: {state.deliveries}. Витрати компанії та виручка пекарні враховуються окремо в балансі.</p></div>
          <h3 className="px-1 text-sm font-bold">Останні операції</h3>
          {!state.ledger.length && <p className="px-1 text-xs">Тут з'являться закупівлі, доставки й витрати компанії.</p>}
          {state.ledger.map(entry => <div key={entry.id} className={card}><div className="flex justify-between gap-2 text-xs"><strong>{entry.title}</strong><b className={`shrink-0 ${entry.amount < 0 ? "text-[#9c6244]" : "text-[#4a7a51]"}`}>{entry.amount >= 0 ? "+" : ""}{money(entry.amount)}</b></div><p className="mt-2 text-[11px] leading-relaxed text-[#71816b]">{entry.detail}</p></div>)}
        </>}
      </div>
      <footer className="border-t border-[#d3d8c9] px-4 py-3 text-center text-[10px] text-[#78836d]">{store.saveError ? "Не вдалося зберегти прогрес" : "Автозбереження у браузері"} · Прототип 0.1</footer>
    </section>
  </div>;
}
