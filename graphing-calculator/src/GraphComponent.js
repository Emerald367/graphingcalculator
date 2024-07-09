import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import {evaluate} from 'mathjs'

const GraphComponent = ({ equations }) => {
    const [data, setData] = useState([]);

    const parseEquations = () => {
        const newData = equations.map((equation, index) => {
            try {
                const xValues = [];
                const yValues = [];
                for (let x = -10; x <= 10; x += 0.1) {
                    xValues.push(x);
                    yValues.push(evaluate(equation.equation.replace('y =', ''), { x }));
                }
                return {
                    x: xValues,
                    y: yValues,
                    type: 'scatter',
                    mode: 'lines',
                    marker: { color: equation.color },
                    name: `Equation ${index + 1}`
                };
            } catch (error) {
                console.error('Error evaluating equation:', equation, error);
                return null;
            }
        }).filter(Boolean);
        setData(newData);
    };

    useEffect(() => {
        parseEquations();
    }, [equations]);

    return (
        <Plot 
            data={data}
            layout={{ title: 'Graphing Calculator', xaxis: { title: 'X'}, yaxis: { title: 'Y'} }}
        />
    )
}

export default GraphComponent;