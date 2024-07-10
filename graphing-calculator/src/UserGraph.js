// src/UserGraph.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GraphComponent from './GraphComponent';

const UserGraph = ({ onLogout }) => {
  const [graphs, setGraphs] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [equations, setEquations] = useState([]);
  const [newEquation, setNewEquation] = useState('');
  const [color, setColor] = useState('#000000');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGraphs = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:5000/graphs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGraphs(response.data.graphs);
      } catch (err) {
        setError('Error fetching graphs');
        console.error(err);
      }
    };

    fetchGraphs();
  }, []);

  const fetchGraphDetails = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/graphs/${id}`, {
        headers: { Authorization: `Bearer ${token}`}
      });
      setSelectedGraph(response.data.graph);
      setEquations(response.data.graph.equations || []);
    } catch (err) {
      setError('Error fetching graph details');
      console.error(err);
    }
  };

  const handleAddEquation = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/graphs/equations', {
        equation: newEquation,
        color
      }, {
        headers: { Authorization: `Bearer ${token}`}
      });
      setEquations([...equations, response.data.equation]);
    } catch (err) {
      setError('Error adding equation');
      console.error(err);
    }
  }

  return (
    <div className="p-8 bg-green-100 min-h-screen">
      <h2 className="text-2xl font-bold text-green-700 mb-4">User Graphs</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <button onClick={onLogout} className="bg-green-700 text-white py-2 px-4 rounded">Logout</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {graphs.map((graph) => (
          <div key={graph.id} className="bg-white p-4 rounded shadow" onClick={() => fetchGraphDetails(graph.id)}>
            <h3 className="text-xl font-semibold text-green-600">{graph.name}</h3>
            <p>{graph.description}</p>
          </div>
        ))}
      </div>
      {selectedGraph && (
          <div className="mt-8 p-4 bg-white rounded shadow">
            <h3 className="text-xl font-bold text-green-700">Graph Details</h3>
            <p>ID: {selectedGraph.id}</p>
            <p>Name: {selectedGraph.name}</p>
            <p>Description: {selectedGraph.description}</p>
            <p>Created At: {selectedGraph.created_at}</p>
            {/* Render the GraphComponent */}
            <GraphComponent equations={equations} />
            <div className="mt-4">
              <input
                type="text"
                value={newEquation}
                onChange={(e) => setNewEquation(e.target.value)}
                placeholder="Enter equation"
                className="border p-2 rounded mb-2 w-full"
               />
               <input
                 type="color"
                 value={color}
                 onChange={(e) => setColor(e.target.value)}
                 className="border p-2 rounded mb-2 w-full"
               />
               <button onClick={handleAddEquation} className="bg-green-700 text-white py-2 px-4 rounded">Add Equation</button>
             </div>
          </div>
      )}
    </div>
  );
};

export default UserGraph;
