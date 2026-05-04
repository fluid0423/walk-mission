import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface DayRecord {
  date: string; // YYYY-MM-DD
  steps: number;
}

interface Props {
  records: DayRecord[];
  dailyGoal: number;
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

function dotColor(steps: number, goal: number): string {
  if (steps === 0) return "transparent";
  const r = steps / goal;
  if (r >= 1.0) return "#16A34A";
  if (r >= 0.5) return "#22C55E";
  if (r >= 0.3) return "#86EFAC";
  return "#BBF7D0";
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function StepCalendar({ records, dailyGoal, onSelectDate, selectedDate }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const recordMap: Record<string, number> = {};
  records.forEach((r) => { recordMap[r.date] = r.steps; });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long",
  });

  const todayStr = today.toISOString().split("T")[0];

  return (
    <View className="bg-white rounded-3xl p-5" style={{ elevation: 2 }}>
      {/* 헤더 */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={prevMonth} className="p-2">
          <Text className="text-slate-500 text-lg font-bold">‹</Text>
        </TouchableOpacity>
        <Text className="text-slate-900 font-bold text-base">{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} className="p-2">
          <Text className="text-slate-500 text-lg font-bold">›</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View className="flex-row mb-2">
        {WEEKDAYS.map((d, i) => (
          <View key={d} className="flex-1 items-center">
            <Text className={`text-xs font-semibold ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"}`}>
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View className="flex-row flex-wrap">
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} className="flex-1" style={{ minWidth: "14.28%" }} />;
          }

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const steps = recordMap[dateStr] ?? 0;
          const color = dotColor(steps, dailyGoal);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const isSun = (idx % 7) === 0;
          const isSat = (idx % 7) === 6;

          return (
            <TouchableOpacity
              key={dateStr}
              onPress={() => onSelectDate(dateStr)}
              className="items-center py-1"
              style={{ width: "14.28%" }}
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${isSelected ? "bg-emerald-500" : isToday ? "bg-emerald-100" : ""}`}
              >
                <Text className={`text-sm font-medium ${
                  isSelected ? "text-white" :
                  isToday ? "text-emerald-600" :
                  isSun ? "text-red-400" :
                  isSat ? "text-blue-400" :
                  "text-slate-700"
                }`}>
                  {day}
                </Text>
              </View>
              {/* 걸음 dot */}
              <View
                className="w-1.5 h-1.5 rounded-full mt-0.5"
                style={{ backgroundColor: color }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
