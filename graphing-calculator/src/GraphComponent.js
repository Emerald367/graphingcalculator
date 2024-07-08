import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const GraphComponent = ({ equations }) => {
    const [data, setData] = useState([]);

    const parseEquations = () => {
        const newData = equations.map((equation, index) => {
            const func = new Function('x', `return ${equation.equation.replace('y =', '')}`);
            const xValues = [];
            const yValues = [];
            for (let x = -10; x <= 10; x += 0.1) {
                xValues.push(x);
                yValues.push(func(x));
            }

            return {
                x: xValues,
                y: yValues,
                type: 'scatter',
                mode: 'lines',
                marker: { color: equation.color },
                name: `Equation ${index + 1}`
            };
        });
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