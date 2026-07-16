import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from '@/utils/dayjs';

type RangePickerValue = RangePickerProps['value'];

export function getTimeDistance(
  type: 'today' | 'week' | 'month' | 'year',
): RangePickerValue {
  const now = dayjs();

  if (type === 'today') {
    return [now.startOf('day'), now.endOf('day')];
  }

  if (type === 'week') {
    const daysSinceMonday = (now.day() + 6) % 7;
    const startOfWeek = now.startOf('day').subtract(daysSinceMonday, 'day');
    return [startOfWeek, startOfWeek.add(6, 'day').endOf('day')];
  }

  if (type === 'month') {
    return [now.startOf('month'), now.endOf('month')];
  }

  return [now.startOf('year'), now.endOf('year')];
}
