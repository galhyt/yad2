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
    const neighborhoodValues = await getDistinctValues("neighborhood")
    this.setState({neighborhoodValues: neighborhoodValues})
  }

  render() {
    const {neighborhoodValues} = this.state
    return <FilterForm neighborhoodValues={neighborhoodValues} />
  }
}
// const testMsg = async () => {
//   let result
  
//   await new Promise((resolve, reject) => {
//     fetch('/api').then(res=> {
//       resolve(res.json())
//     })
//   }).then(res => result = res)

//   return result
// }

// class App extends React.Component {
//   state = {
//     msg: ""
//   }

//   async componentDidMount() {
//     const msg = await testMsg()
//     this.setState({msg : msg})
//   }

//   render() {
//     const {msg} = this.state
//     return (JSON.stringify(msg))
//   }
// }

export default App;
