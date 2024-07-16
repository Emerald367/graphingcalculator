import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { parse } from 'mathjs';

ChartJS.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GraphComponent = ({ equations }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const generateCircleData = (h, k, r) => {
        const data = [];
        for (let theta = 0; theta < 2 * Math.PI; theta += 0.01) {
            const x = h + r * Math.cos(theta);
            const y = k + r * Math.sin(theta);
            data.push({ x, y });
        }
        return data;
    };

    const generateData = (equation) => {
        const data = [];
        try {
            const circleRegex = /^\(\s*x\s*[+-]\s*\d+\s*\)\s*\^\s*2\s*\+\s*\(\s*y\s*[+-]\s*\d+\s*\)\s*\^\s*2\s*=\s*\d+$/;

            if (circleRegex.test(equation)) {
                // Handle circle equations
                const [left, right] = equation.split('=');
                const radius = Math.sqrt(parseFloat(right.trim()));
                const h = 0; // Assuming h and k are 0 for simplicity, you may need to extract them from the equation
                const k = 0;
                return generateCircleData(h, k, radius);
            } else {
                // Handle other equations
                const node = parse(equation);
                const compiled = node.compile();
                for (let x = -10; x <= 10; x += 0.1) {
                    const scope = { x };
                    const y = compiled.evaluate(scope);
                    data.push({ x, y });
                }
            }
        } catch (error) {
            console.error('Invalid equation:', error);
        }
        return data;
    };

    const parseEquations = (equations) => {
        // This function needs to parse and prepare equations correctly for ChartJS
        // Assuming each equation is an object with properties: equation, color, thickness, etc.
        return equations.map(eq => ({
            ...eq,
            parsedEquation: eq.equation // Or however you parse your equations
        }));
    };

    useEffect(() => {
        const parsedEquations = parseEquations(equations);

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const labels = Array.from({ length: 201 }, (_, i) => i - 100);

        chartInstanceRef.current = new ChartJS(chartRef.current, {
            type: 'line',
            data: {
                labels: labels,
                datasets: parsedEquations.map(eq => ({
                    label: eq.equation,
                    data: generateData(eq.parsedEquation),
                    borderColor: eq.color,
                    borderWidth: eq.thickness,
                    fill: false,
                    showLine: true,
                    pointRadius: 0
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: -10,
                        max: 10,
                        grid: {
                            display: true
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        min: -10,
                        max: 10,
                        grid: {
                            display: true
                        }
                    },
                }
            }
        });
    }, [equations]);

    return (
        <div className="relative w-full h-96">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default GraphComponent;