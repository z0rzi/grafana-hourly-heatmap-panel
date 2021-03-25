import React from 'react';
import * as d3 from 'd3';
import { DateTime, dateTimeParse } from '@grafana/data';

interface XAxisProps {
  width: number;
  timeZone: string
}

const localeOptions = {
  weekday: 'long' as 'long',
  // month: '2-digit',
  // day: '2-digit',
};

const referenceText = dateTimeParse(0).toDate().toLocaleDateString(undefined, localeOptions);

export const XAxis: React.FC<XAxisProps> = React.memo(({ width, timeZone }) => {

  const someDay = dateTimeParse(0);

  const monday = someDay.startOf('isoWeek').valueOf();
  const sunday = someDay.endOf('isoWeek').valueOf();

  const x = d3.scaleTime().domain([monday, sunday]).rangeRound([0, width]);

  const xTime = d3.scaleTime().domain([monday, sunday]).range([0, width]);

  const every = calculateTickInterval(width, 7, referenceText);

  console.log('every', every)

  const xTimeAxis = d3
    .axisBottom(xTime)
    .ticks(d3.timeDay, every)
    .tickFormat((d) =>
      dateTimeParse(d as number, { timeZone })
        .toDate()
        .toLocaleDateString(undefined, localeOptions)
    );

  const xCategoryAxis = d3
    .axisBottom(x)
    .ticks(7)
    .tickFormat((d) =>
      dateTimeParse(d.valueOf(), { timeZone }).toDate().toLocaleDateString(undefined, localeOptions)
    );

  const xAxis: any = every > 1 ? xTimeAxis : xCategoryAxis;

  return (
    <g
      ref={(node) => {
        const container = d3.select(node).call(xAxis)
          .selectAll("text")
          .style("text-anchor", "middle")
          .attr("transform", "translate(" + (width / 7) / 2 + ", 0)");

        // Remove junk.
        container.select('.domain').remove();
        container.selectAll('line').remove();
      }}
    />
  );
});

const calculateTickInterval = (width: number, numDays: number, referenceText: string) => {
  const preferredTickWidth = measureText(referenceText);
  return Math.max(Math.ceil(numDays / (width / preferredTickWidth)), 1);
};

const measureText = (text: string): number => {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = '14px Arial';
    return ctx.measureText(text).width;
  }
  return 0;
};
XAxis.displayName = 'XAxis';
