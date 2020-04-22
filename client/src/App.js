import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import FilterForm from './FilterForm'
import Table from "./Table"

const getDistinctValues = async (fieldName, query) => {
  let result
  
  await new Promise((resolve, reject) => {
    var url = '/api/fieldvalues/'+fieldName
    if (query != null) url += '?' + query
    fetch(url).then(res=> {
      resolve(res.json())
    })
  }).then(res => result = res)

  return result
}

class App extends React.Component {
  initializeState = {
    neighborhood: ["- All -"],
    city: ["- All -"],
    neighborhoodValue: null,
    cityValue: null,
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

  async getResult(groupBy, query) {
    let result
    await new Promise((resolve, reject) => {
      fetch('/api/filter/'+groupBy+'?'+query).then(res=> {
        resolve(res.json())
      })
    }).then(res => result = res)
  
    return result
  }
  
  async onFilterFieldChange(id, value) {
    var newState = this.state
    newState[id+'Value'] = value
    if (id === 'city')
      newState.neighborhoodValues = await getDistinctValues('neighborhood', 'city=$eq:"'+value+'"')

    this.setState(newState)
  }

  async submitForm() {
    var newState = this.state
    var query = 'sqMr=$ne:0&room=$ne:0'
    if (this.state.cityValue != null && this.state.cityValue != '- All -') {
      query += '&city=$eq:"'+this.state.cityValue +'"'
    }
    if (this.state.neighborhoodValue != null && this.state.neighborhoodValue != '- All -') {
      query += '&neighborhood=$eq:"' + this.state.neighborhoodValue + '"'
    }
    newState.result = await this.getResult('city', query)
    this.setState(newState)
  }

  async drillDown(parentType, parentName, childType, resultTableId) {
    var newState = this.state
    var query = 'sqMr=$ne:0&room=$ne:0&'+parentType+'=$eq:"'+parentName+'"'
    const data = await this.getResult(childType, query)

    ReactDOM.render(
      <React.StrictMode>
        <Table type={childType} data={data} drillDown={this.drillDown.bind(this)}  />
      </React.StrictMode>,
      document.getElementById(resultTableId)
    );

    this.setState(newState)
  }

  render() {
    const {neighborhood} = this.state
    const {city} = this.state
    const {result} = this.state
    try {
      return (
        <div>
        <FilterForm neighborhoodValues={neighborhood} cityValues={city} submitForm={this.submitForm.bind(this)} onFilterFieldChange={this.onFilterFieldChange.bind(this)} />
        <Table type="city" data={result} drillDown={this.drillDown.bind(this)} />
        </div>
      )
    }
    catch(e) {

    }
  }
}

export default App;
