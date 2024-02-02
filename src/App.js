import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './App.css';

const App = () => {
  const [data, setData] = useState([]);
  const [skip, setSkip] = useState(0);
  const [checkedRows, setCheckedRows] = useState([]);

  useEffect(() => {
    fetchData();
  }, [skip]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`https://dummyjson.com/products?limit=10&skip=${skip}&select=title,price,brand,category,stock,rating`);
      setData(response.data.products);

      // Initialize checkedRows with the first 5 indices
      setCheckedRows(Array.from({ length: Math.min(5, response.data.products.length) }, (_, index) => index));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCheckboxChange = (id) => {
    const updatedCheckedRows = checkedRows.includes(id)
      ? checkedRows.filter((rowId) => rowId !== id)
      : [...checkedRows, id];

    setCheckedRows(updatedCheckedRows);
  };

  const createChartData = () => {
    const chartData = data.reduce((result, row, index) => {
      if (checkedRows.includes(index)) {
        const existingBrandIndex = result.findIndex((item) => item.name === row.brand);

        if (existingBrandIndex !== -1) {
          result[existingBrandIndex].x.push(row.title);
          result[existingBrandIndex].y.push(row.price);
        } else {
          result.push({
            name: row.brand,
            x: [row.title],
            y: [row.price],
            type: 'bar',
          });
        }
      }

      return result;
    }, [data]);

    console.log(chartData, "Datatat");
    return chartData;
  };

  return (
    <div className='App'>
      <table>
        <thead>
          <h4>Data from {skip} items-{skip + 10} items</h4>
          <tr>
            <th>Checkbox</th>
            <th>Title</th>
            <th>Price</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={checkedRows.includes(index)}
                    onChange={() => handleCheckboxChange(index)}
                  />
                </td>
                <td>{row.title}</td>
                <td>{row.price}</td>
                <td>{row.brand}</td>
                <td>{row.category}</td>
                <td>{row.stock}</td>
                <td>{row.rating}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="button-container">
        <button onClick={() => setSkip(Math.max(0, skip - 10))} disabled={skip === 0} className="btn">
          Previous
        </button>
        <button onClick={() => setSkip(skip + 10)} disabled={skip === 90} className="btn">
          Next
        </button>
      </div>
      <Plot data={createChartData()} layout={{ width: 800, height: 400 }} />
    </div>
  );
};

export default App;
