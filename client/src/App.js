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
  state = {
    neighborhood: [],
    city: []
  }

  async componentDidMount() {
    var promises = []
    var newstate = { "neighborhood" : null, "city" : null }

    for (var fieldname in newstate) {
      promises.push(new Promise((resolve,reject) => {
        var key = fieldname
        getDistinctValues(fieldname).then(vals => {
          resolve({key: key, vals: vals})
        })}).then(args => newstate[args.key] = ["- All -"].concat(args.vals))
      )
    }

    await Promise.all(promises)
    this.setState(newstate)
  }

  render() {
    const {neighborhood} = this.state
    const {city} = this.state
    return <FilterForm neighborhoodValues={neighborhood} cityValues={city} />
  }
}

export default App;
