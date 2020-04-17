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
const testMsg = () => {
  let result
  
  fetch('localhost:3001/api').then(res=> {
    result = res
  }
    )

  return result
}
class App extends React.Component {
  state = {
    msg: ""
  }

  constructor(props) {
    super(props)
    this.state.msg = testMsg()
  }

  render() {
    const {msg} = this.state
    return msg
  }
}

export default App;
