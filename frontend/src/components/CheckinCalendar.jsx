import React from 'react';

export default function CheckinCalendar({ checkinData, onDayClick, currentMonth, setCurrentMonth }) {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startWeekday; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const todayStr = formatDate(today);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <span className="calendar-month">{year}年{month + 1}月</span>
        <div className="calendar-nav">
          <button onClick={prevMonth}>‹</button>
          <button onClick={nextMonth}>›</button>
        </div>
      </div>
      <div className="calendar-weekdays">
        {weekdays.map(w => <div key={w}>{w}</div>)}
      </div>
      <div className="calendar-days">
        {days.map((d, idx) => {
          if (d === null) return <div key={idx} className="calendar-day empty"></div>;
          const dateObj = new Date(year, month, d);
          const dateStr = formatDate(dateObj);
          const checkins = checkinData[dateStr] || [];
          const isToday = dateStr === todayStr;
          const hasCheckin = checkins.length > 0;
          return (
            <div
              key={idx}
              className={`calendar-day ${isToday ? 'today' : ''} ${hasCheckin ? 'has-checkin' : ''}`}
              onClick={() => onDayClick && onDayClick(dateStr, checkins)}
              title={hasCheckin ? `${checkins.length}人打卡` : '暂无打卡'}
            >
              {d}
              {hasCheckin && <span className="calendar-day-count">{checkins.length}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
