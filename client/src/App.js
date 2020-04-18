import React from 'react';
import './App.css';
import FilterForm from './FilterForm'

const getDistinctValues = async fieldName => {
  let result
  
  await new Promise((resolve, reject) => {
    fetch('/api').then(res=> {
      resolve(res.json())
    })
  }).then(res => result = res)

  return result
}

class App extends React.Component {
  state = {
    neighborhoodValues: []
  }

  async componentDidMount() {
    await getDistinctValues("neighborhood").then(neighborhoodValues => {
      this.setState({neighborhoodValues: neighborhoodValues})
    })
  }

  render() {
    const {neighborhoodValues} = this.state
    return <FilterForm neighborhoodValues={neighborhoodValues} />
  }
}

export default App;
