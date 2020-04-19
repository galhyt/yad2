import React from 'react';
import './App.css';
import FilterForm from './FilterForm'

const getDistinctValues = async fieldName => {
  let result
  
  await new Promise((resolve, reject) => {
    fetch('/api/fieldvalues/'+fieldName).then(res=> {
      resolve(res.json())
    })
  }).then(res => result = res)

  return result
}

class App extends React.Component {
  initializeState = {
    neighborhood: ["- All -"],
    city: ["- All -"],
    result: []
  }

  state = this.initializeState

  async componentDidMount() {
    var promises = []
    var newstate = this.initializeState
    const fieldsNames = ['city']

    fieldsNames.forEach(fieldname => {
      promises.push(new Promise((resolve,reject) => {
        var key = fieldname
        getDistinctValues(fieldname).then(vals => {
          resolve({key: key, vals: vals})
        })}).then(args => newstate[args.key] = newstate[args.key].concat(args.vals))
      )
    })

    await Promise.all(promises)
    this.setState(newstate)
  }

  submitForm() {
    var newState = this.state
    newstate.result = [{}]
  }

  render() {
    const {neighborhood} = this.state
    const {city} = this.state
    return <FilterForm neighborhoodValues={neighborhood} cityValues={city} submitForm={this.submitForm} />
  }
}

export default App;
