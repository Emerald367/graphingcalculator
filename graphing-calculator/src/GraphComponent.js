import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { evaluate, parse } from 'mathjs';

ChartJS.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)


const GraphComponent = ({ equations }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const parseEquations = (equations) => {
        return equations.map(eq => {
          const parsedEquation = parse(eq.equation.split('=')[1]);
          return {
            ...eq,
            parsedEquation
          };
        });
      };

      const generateData = (parsedEquation) => {
        const data = [];
        for (let x = -50; x <= 50; x += 1) {
            const scope = { x };
            const y = parsedEquation.evaluate(scope);
            data.push(y);
        }
        return data;
      }
    
      useEffect(() => {
          const parsedEquations = parseEquations(equations);

          if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
          }

          const labels = Array.from({ length: 101}, (_, i) => i - 50);
    
          chartInstanceRef.current = new ChartJS(chartRef.current, {
            type: 'line',
            data: {
              labels: labels,
              datasets: parsedEquations.map(eq => ({
                label: eq.equation,
                data: generateData(eq.parsedEquation),
                borderColor: eq.color,
                borderWidth: eq.thickness
              }))
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  type: 'linear',
                  position: 'bottom'
                }
              }
            }
          });
      }, [equations]);

    return (
        <div>
            <canvas ref={chartRef} width="400" height="400"></canvas>
        </div>
    );
};

export default GraphComponent;