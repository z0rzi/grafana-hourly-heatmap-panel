import React from 'react';
import * as d3 from 'd3';
import { dateTimeParse } from '@grafana/data';
import { TimeRegion } from './TimeRegionEditor';
import { useTheme } from '@grafana/ui';

import { BucketData } from '../bucket';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import { Tooltip } from './Tooltip';
const MINUTES_PER_DAY = 24 * 60;
interface HeatmapProps {
  values: number[];
  data: BucketData;
  colorDisplay: (value: number) => string;
  width: number;
  height: number;
  numBuckets: number;
  timeZone: string;
  regions: TimeRegion[];
  onHover: (value?: number) => void;
  cellBorder: boolean;
  tooltip: boolean;
}

/**
 * A two-dimensional grid of colored cells.
 */
export const Heatmap: React.FC<HeatmapProps> = ({
  values, // timeMillis ; 1/day
  data,
  colorDisplay,
  width,
  height,
  numBuckets,
  timeZone,
  regions,
  onHover,
  cellBorder,
  tooltip,
}) => {
  const theme = useTheme();

  const x = d3.scaleLinear([0, width]).domain([0, MINUTES_PER_DAY * 7]);
  const y = d3.scaleBand<number>([0, height]).domain(values);

  const cellWidth = width / 7 / numBuckets;
  const cellHeight = height / values.length;

  const intervalMinutes = 1440;
  const pixelsPerMinute = height / intervalMinutes;

  return (
    <>
      <g>
        {data.points.map((d, i) => {
          const date = dateTimeParse(d.dayMillis, { timeZone });
          const startOfWeek = date.startOf('isoWeek').valueOf();
          const bucketStart = dateTimeParse(d.bucketStartMillis, { timeZone });
          const minsSinceStartOfWeek = (d.dayMillis - startOfWeek) / 1000 / 60;
          const displayValue = data.valueField.display!(d.value);

          const content = (
            <rect
              x={x(minsSinceStartOfWeek.valueOf())}
              y={y(startOfWeek)}
              fill={colorDisplay(d.value)}
              width={cellWidth}
              height={cellHeight}
              onMouseLeave={() => onHover(undefined)}
              onMouseEnter={() => onHover(d.value)}
              stroke={cellBorder ? theme.colors.panelBg : undefined}
            />
          );

          if (tooltip) {
            return (
              <Tippy
                key={i}
                content={
                  <div>
                    <Tooltip
                      bucketStartTime={bucketStart}
                      displayValue={displayValue}
                      numBuckets={numBuckets}
                      tz={timeZone}
                    />
                  </div>
                }
                placement="bottom"
                animation={false}
              >
                {content}
              </Tippy>
            );
          } else {
            return content;
          }
        })}
      </g>
      <g>
        {regions
          .filter((region) => {
            const yPos = Math.ceil(y(region.start.hour * 60 + region.start.minute) ?? 0);
            return 0 <= yPos && yPos < height;
          })
          .map((region, key) => {
            const regionDuration =
              region.end.hour * 60 + region.end.minute - (region.start.hour * 60 + region.start.minute);
            const yPos = Math.ceil(y(region.start.hour * 60 + region.start.minute) ?? 0);
            const regionHeight = Math.ceil(regionDuration * pixelsPerMinute);
            return (
              <rect
                key={key}
                x={0}
                y={yPos}
                width={width}
                height={yPos + regionHeight >= height ? height - yPos : regionHeight}
                stroke={region.color}
                fill={region.color}
                pointerEvents="none"
                strokeWidth={2}
              />
            );
          })}
      </g>
    </>
  );
};
