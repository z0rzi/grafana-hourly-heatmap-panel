import React from 'react';

import { dateTimeParse, TimeRange, dateTime, RawTimeRange } from '@grafana/data';

import { TimeRegion } from './TimeRegionEditor';
import { BucketData } from '../bucket';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { Heatmap } from './Heatmap';

interface HeatmapWithAxesProps {
  data: BucketData;
  width: number;
  height: number;
  colorDisplay: (value: number) => string;
  timeZone: string;
  timeRange: TimeRange | { from: Date; to: Date; raw: RawTimeRange };
  dailyInterval: [number, number];
  regions: TimeRegion[];
  onHover: (value?: number) => void;
  cellBorder: boolean;
  tooltip: boolean;
}

/**
 * HeatmapWithAxes adds an X and Y axis to a Heatmap.
 */
export const HeatmapWithAxes: React.FC<HeatmapWithAxesProps> = ({
  data,
  width,
  height,
  colorDisplay,
  timeZone,
  timeRange,
  dailyInterval,
  regions,
  onHover,
  cellBorder,
  tooltip,
}) => {
  // Take the axes into account. Ideally we'd use the axis bounding boxes to
  // calculate the offsets dynamically.
  const offset = {
    top: 5,
    left: 35,
    bottom: 20,
  };

  const chartWidth = width - offset.left;
  const chartHeight = height - (offset.top + offset.bottom);

  const tzFrom = dateTimeParse(timeRange.from.valueOf(), { timeZone }).startOf('day');
  const tzTo = dateTimeParse(timeRange.to.valueOf(), { timeZone }).endOf('day');

  const numDays = tzTo.diff(tzFrom, 'days') + 1;

  // Generate time values for the Y axis. These are used to center the dates on
  // the Y axis next to each week. Only used when the panel dimensions allow a
  // tick per day.
  let values: number[] = [];
  data.points.forEach(({dayMillis}) => {
    const w = dateTimeParse(dayMillis, { timeZone }).startOf('isoWeek').valueOf();
    if (!values.includes(w))
      values.push(w);
  });

  return (
    <g transform={`translate(${offset.left}, ${offset.top})`}>
      <g transform={`translate(0, ${chartHeight})`}>
        <XAxis values={values} from={tzFrom} to={tzTo} width={chartWidth} numDays={numDays} timeZone={timeZone} />
      </g>
      <YAxis height={chartHeight} dailyInterval={dailyInterval} />
      <Heatmap
        data={data}
        numBuckets={data.numBuckets}
        values={values}
        width={chartWidth}
        height={chartHeight}
        colorDisplay={colorDisplay}
        timeZone={timeZone}
        regions={regions}
        onHover={onHover}
        cellBorder={cellBorder}
        tooltip={tooltip}
      />
    </g>
  );
};
