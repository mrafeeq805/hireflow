import { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';

interface InterviewCalendarProps {
  interviews: any[];
  onSelectInterview: (interview: any) => void;
}

export function InterviewCalendar({
  interviews,
  onSelectInterview,
}: InterviewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getDayInterviews = (day: Date) => {
    return interviews.filter((i) => isSameDay(new Date(i.scheduledAt), day));
  };

  return (
    <Card className="p-5 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
            Today
          </Button>
          <div className="flex items-center border border-slate-200 rounded-md dark:border-slate-800">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-px border-b border-slate-200 pb-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-2 mt-2">
        {days.map((day, idx) => {
          const dayInterviews = getDayInterviews(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={idx}
              className={`min-h-[110px] rounded-lg border p-1.5 flex flex-col transition-colors ${
                isCurrentMonth
                  ? 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#142B3B]/40'
                  : 'border-transparent bg-slate-50/50 text-slate-400 dark:bg-[#0B1822]/20 dark:text-slate-600'
              } ${isToday ? 'ring-2 ring-[#0F9D78]' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold px-1 rounded ${
                    isToday ? 'bg-[#0F9D78] text-white' : ''
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {dayInterviews.length > 0 && (
                  <span className="text-[10px] font-bold text-[#0F9D78]">
                    {dayInterviews.length}
                  </span>
                )}
              </div>

              {/* Day scheduled interviews chips */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px]">
                {dayInterviews.map((interview) => (
                  <button
                    key={interview.id}
                    onClick={() => onSelectInterview(interview)}
                    className="w-full text-left truncate rounded bg-[#D9F5EA] px-1.5 py-1 text-[10px] font-medium text-[#0A6D53] hover:bg-[#B6EAD5] transition-colors dark:bg-[#0F9D78]/20 dark:text-[#A7F3D0] block"
                  >
                    <div className="truncate font-semibold">
                      {interview.application?.candidate?.fullName || 'Candidate'}
                    </div>
                    <div className="text-[9px] text-[#0A6D53]/80 dark:text-[#A7F3D0]/80">
                      {format(new Date(interview.scheduledAt), 'h:mm a')} • {interview.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

