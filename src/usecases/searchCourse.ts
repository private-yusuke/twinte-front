import {
  fullModulesMap,
  fullWeekMap,
  fullPeriodMap,
} from "~/entities/schedule";
import { CourseModule, Day, SearchCourseTimetableQuery } from "~/api/@types";
import { fullDays } from "~/entities/day";
import { fullModules } from "~/entities/module";
import { getYear } from "./getYear";
import { isSchedulesDuplicated } from "./getDuplicatedCourses";
import { isValidStatus } from "~/usecases/api";
import { NetworkAccessError, NetworkError } from "~/usecases/error";
import { periods } from "~/entities/period";
import { Ports } from "~/adapter";
import { Schedule } from "~/entities/schedule";

type ParsedSchedule = {
  modules: string[];
  days: string[];
  periods: string[];
};

/**
 * ex) module: "その他" -> modules: ["SummerVacation", "SpringVacation"]
 */
const parseSchedules = (schedule: Schedule): ParsedSchedule => ({
  modules: Object.keys(fullModulesMap).filter((k) =>
    fullModulesMap[k].includes(schedule.module)
  ),
  days: Object.keys(fullWeekMap).filter((k) =>
    fullWeekMap[k].includes(schedule.day)
  ),
  periods: Object.keys(fullPeriodMap).filter((k) =>
    fullPeriodMap[k].includes(schedule.period)
  ),
});

/**
 * 与えられた module day period が schedules の指す範囲に当てはまるか確認する
 */
const isWishinSchedules = (
  schedules: ParsedSchedule[],
  module: CourseModule,
  day: Day,
  period: number // TODO: 適切な型を作成
): boolean => {
  return schedules.some(
    (schedule) =>
      schedule.modules.includes(module) &&
      schedule.days.includes(day) &&
      schedule.periods.includes(String(period))
  );
};

/**
 * scheduels から timetable形式 のデータを生成する。
 */
const schedulesToTimetable = (
  schedules: ParsedSchedule[],
  onlyBlank: boolean,
  ports: Ports
): SearchCourseTimetableQuery | undefined => {
  let allTrue = true;
  const timetable: Partial<SearchCourseTimetableQuery> = {};
  for (const module of fullModules) {
    timetable[module] = {};
    for (const day of fullDays) {
      timetable[module][day] = {};
      for (const period of [0, ...periods]) {
        // とりあえず空白検索とドロップダウン検索は or で実装
        // HACK: backend の要望により timetable が全て true の場合 undedined を返す。
        const ret = onlyBlank
          ? !isSchedulesDuplicated(ports)([{ module, day, period, room: "" }])
          : isWishinSchedules(schedules, module, day, period);
        timetable[module][day][period] = ret;
        if (ret === false) allTrue = false;
      }
    }
  }
  return allTrue === true
    ? undefined
    : (timetable as SearchCourseTimetableQuery);
};

export const searchCourse = (ports: Ports) => async (
  schedules: Schedule[],
  searchWords: string[],
  offset: number,
  limit: number,
  onlyBlank: boolean
) => {
  const { api } = ports;
  const year = await getYear(ports);
  const { body, status, originalResponse } = await api.courses.search
    .post({
      body: {
        year,
        searchMode: "Cover", // TODO: ユーザが選択できるようにする
        keywords: searchWords,
        timetable: schedulesToTimetable(
          schedules.map(parseSchedules),
          onlyBlank,
          ports
        ),
        offset,
        limit,
      },
    })
    .catch(() => {
      throw new NetworkError();
    });
  if (isValidStatus(status)) {
    return body;
  } else {
    console.error(body);
    throw new NetworkAccessError(originalResponse);
  }
};
