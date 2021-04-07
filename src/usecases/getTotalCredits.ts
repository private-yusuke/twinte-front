import { RegisteredCourse } from "~/api/@types";

/**
 * 登録している科目の合計単位数を集計する。
 */
export const getTotalCredits = (
  registeredCourses: RegisteredCourse[]
): number => {
  // 単位数が設定されていない科目の単位数は 0 として扱う
  const totalCredits = registeredCourses.reduce(
    (acc, { course }) => acc + (course?.credit ?? 0),
    0
  );

  return totalCredits;
};
