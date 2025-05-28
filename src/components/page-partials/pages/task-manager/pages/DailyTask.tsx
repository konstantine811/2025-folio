import DailyCalendar from "../daily-components/daily-calendar";

const DailyTask = () => {
  return (
    <div className="flex w-full">
      {/* Ліва колонка */}
      <div className="flex-1" />

      {/* Центральна колонка */}
      <div className="w-full max-w-2xl px-4">
        <main className="py-8">
          <h1 className="text-2xl font-bold">Центральний контент</h1>
          <p>Контент тут не буде сильно стискатись.</p>
        </main>
      </div>

      {/* Права колонка */}
      <div className="flex-1 pt-8">
        <DailyCalendar />
      </div>
    </div>
  );
};

export default DailyTask;
