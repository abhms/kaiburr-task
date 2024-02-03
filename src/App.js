import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './App.css';

const App = () => {
  const [data, setData] = useState([]);
  const [skip, setSkip] = useState(0);
  const [checkedRows, setCheckedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [skip, searchTerm]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`https://dummyjson.com/products?limit=10&skip=${skip}&select=title,price,brand,category,stock,rating`);
      setData(response.data.products);

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
    const chartData = filteredData.reduce((result, row, index) => {
      if (checkedRows.includes(index)) {
        const existingBrandIndex = result.findIndex(
          (item) => item.name === row.brand
        );
  
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
    }, []);
  
    console.log(chartData, 'Datatat');
    return chartData;
  };

  const rowMatchesSearch = (row, term) => {
    return (
      Object.values(row).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(term.toLowerCase())
      ) ||
      row.price.toString().includes(term) ||
      row.brand.toLowerCase().includes(term.toLowerCase()) ||
      row.rating.toString().includes(term) ||
      row.stock.toString().includes(term)
    );
  };

  const filteredData = data.filter((row) => rowMatchesSearch(row, searchTerm));

  return (
    <div className='App'>
      <h4>Data from {skip} items-{skip + 10} items</h4>
      <div className='input-container'>
        <input
          type='text'
          placeholder='Search by title, brand, etc.'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <table>
        <thead>
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
          {filteredData &&
            filteredData.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type='checkbox'
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
      <div className='button-container'>
        <button
          onClick={() => setSkip(Math.max(0, skip - 10))}
          disabled={skip === 0}
          className='btn'
        >
          Previous
        </button>
        <button
          onClick={() => setSkip(skip + 10)}
          disabled={skip === 90}
          className='btn'
        >
          Next
        </button>
      </div>
      <Plot data={createChartData()} layout={{ width: 800, height: 400 }} />
    </div>
  );
};

export default App;
