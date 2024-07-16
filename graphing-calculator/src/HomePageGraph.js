import React, { useState } from 'react';
import axios from 'axios';
import GraphComponent from './GraphComponent'

const HomePageGraph = () => {
    const [equations, setEquations] = useState([]);
    const [newEquation, setNewEquation] = useState('');
    const [color, setColor] = useState('#ff0000');
    const [thickness, setThickness] = useState(1);
    const [selectedEquation, setSelectedEquation] = useState(null);
    const [error, setError] = useState('');

    const handleAddEquation = async () => {
        try {
            const response = await axios.post('http://localhost:5000/public/graphs/equations', {
                equation: newEquation,
                color,
                thickness
            });
            setEquations([...equations, response.data.equation]);
            setNewEquation('');
            setColor('#ff0000');
            setThickness(1);
            setError('');
        } catch (err) {
            setError('Error adding equation');
            console.error(err.response || err.message);
        }
    }

    const handleUpdateEquation = async (id) => {
        try {
            const response = await axios.put(`http://localhost:5000/public/graphs/equations/${id}`, {
                equation: selectedEquation.equation,
                color: selectedEquation.color,
                thickness: selectedEquation.thickness
            });
            setEquations(equations.map(eq => eq.id === id ? response.data.equation : eq));
            setSelectedEquation(null);
        } catch (err) {
            setError('Error updating equation');
            console.error(err.response || err.message);
        }
    }

    const handleDeleteEquation = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/public/graphs/equations/${id}`);
            setEquations(equations.filter(eq => eq.id !== id));
        } catch (err) {
            setError('Error deleting equation');
            console.error(err.response || err.message);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 p-8 space-y-8">
            <div className="bg-white p-6 rounded shadow-md w-full">
                <h2 className="text-2xl font-bold text-center mb-4 text-green-600">Graphing Calculator</h2>
                <GraphComponent equations={equations} />
                <div className="mt-4 flex flex-col space-y-2">
                    <input 
                        type="text"
                        value={newEquation}
                        onChange={(e) => setNewEquation(e.target.value)}
                        placeholder="Enter equation"
                        className="border p-2 w-full rounded"
                    />
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="border p-2 w-full rounded"
                    />
                    <input
                        type="number"
                        value={thickness}
                        onChange={(e) => setThickness(parseInt(e.target.value))}
                        placeholder="Thickness"
                        className="border p-2 w-full rounded"
                    />
                    <button onClick={handleAddEquation} className="mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                        Add Equation
                    </button>
                    {error && <div className="mb-4 text-red-500">{error}</div>}
                </div>
                <div className="mt-4">
                    {equations.map(eq => (
                        <div key={eq.id} className="flex items-center justify-between p-2 border-b">
                            <span>{eq.equation}</span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setSelectedEquation(eq)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteEquation(eq.id)}
                                    className="text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedEquation && (
                    <div className="mt-4">
                        <h3 className="text-lg font-bold text-green-600">Update Equation</h3>
                        <input
                            type="text"
                            value={selectedEquation.equation}
                            onChange={(e) => setSelectedEquation({ ...selectedEquation, equation: e.target.value })}
                            placeholder="Enter equation"
                            className="border p-2 w-full rounded mt-2"
                        />
                        <input
                            type="color"
                            value={selectedEquation.color}
                            onChange={(e) => setSelectedEquation({ ...selectedEquation, color: e.target.value })}
                            className="border p-2 w-full rounded mt-2"
                        />
                        <input
                            type="number"
                            value={selectedEquation.thickness}
                            onChange={(e) => setSelectedEquation({ ...selectedEquation, thickness: parseInt(e.target.value) })}
                            placeholder="Thickness"
                            className="border p-2 w-full rounded mt-2"
                        />
                        <button
                            onClick={() => handleUpdateEquation(selectedEquation.id)}
                            className="mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                        >
                            Update Equation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}














































































































































































export default HomePageGraph;