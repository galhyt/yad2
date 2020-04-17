import React from 'react';
import logo from './logo.svg';
import './App.css';
//import Yad2DL from './Yad2/dl'
import FilterForm from './FilterForm'

// const getDistinctValues = (fieldName, callback) => {
//   new Promise((resolve,reject) => {
//     Yad2DL.getDistinct(fieldName, values => {
//         resolve(values)
//     })
//   }).then(values => callback(values))
// }

// class App extends React.Component {
//   state = {
//     neighborhoodValues: []
//   }

//   componentDidMount() {
//     getDistinctValues("neighborhood", values => {
//       this.state.neighborhoodValues = values
//     })
//   }

//   render() {
//     const {neighborhoodValues} = this.state
//     return <FilterForm neighborhoodValues={neighborhoodValues} />
//   }
// }
const testMsg = async () => {
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
    msg: ""
  }

  async componentDidMount() {
    const msg = await testMsg()
    this.setState({msg : msg})
  }

  render() {
    const {msg} = this.state
    return (JSON.stringify(msg))
  }
}

export default App;
