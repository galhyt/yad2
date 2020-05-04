import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import FilterForm from './FilterForm'
import Table from "./Table"
import 'bootstrap/dist/css/bootstrap.min.css';

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
    if (id === 'city') {
      newState.neighborhood = this.initializeState.neighborhood.concat(await getDistinctValues('neighborhood', 'city=$eq:"'+value+'"'))
      newState.neighborhoodValue = null
    }

    this.setState(newState)
  }

  getFilter() {
    const {cityValue,neighborhoodValue,fromRoomsValue,toRoomsValue} = this.state
    var query = 'sqMr=$ne:0&room=$ne:0'
    if (cityValue != null && cityValue != '- All -') {
      query += '&city=$eq:"'+cityValue +'"'
    }
    if (neighborhoodValue != null && neighborhoodValue != '- All -') {
      query += '&neighborhood=$eq:"' + neighborhoodValue + '"'
    }
    if (fromRoomsValue != null || toRoomsValue) {
      var roomClause = ''
      if (fromRoomsValue != null)
        roomClause += '$gte:' + fromRoomsValue
      if (toRoomsValue != null) {
        if (roomClause != '') roomClause += ','
        roomClause += '$lte:' + toRoomsValue
      }

      if (query.indexOf('room=') != -1) {
        query = query.replace(/(?<=room\=.+)(?=&|$)/, ','+roomClause)
      }
      else {
        query += '&room=' + roomClause
      }
    }

    return query
  }

  async submitForm() {
    var newState = this.state
    var query = this.getFilter()

    newState.result = await this.getResult('city', query)
    this.setState(newState)
  }

  async drillDown(parentType, parentName, childType, resultTableId) {
    var newState = this.state
    var query = this.getFilter()
    if (query.indexOf('&'+parentType+'=') != -1)
      query = query.replace(new RegExp('(?<=&'+parentType+'=)'), '$eq:"'+parentName+'",')
    else
      query += '&'+parentType+'=$eq:"'+parentName+'"'
    
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
