import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import FilterForm from './FilterForm'
import Table from "./Table"
import 'bootstrap/dist/css/bootstrap.min.css';
import { stringify } from 'querystring';

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
    floor: ["- All -"],
    neighborhoodValue: null,
    cityValue: null,
    monthArr: ["- All -"],
    result: []
  }

  state = this.initializeState

  async componentDidMount() {
    var promises = []
    var newstate = this.initializeState
    newstate.monthArr = await (await this.getMonthArr()).concat(newstate.monthArr)
    const fieldsNames = ['city','floor']

    fieldsNames.forEach(fieldname => {
      promises.push(new Promise((resolve,reject) => {
        var key = fieldname
        getDistinctValues(fieldname).then(vals => {
          resolve({key: key, vals: vals})
        })}).then(args => newstate[args.key] = newstate[args.key].concat(args.vals))
      )
    })

    await Promise.all(promises)
    newstate.floor.sort((a,b) => {
      if (a === b) return 0
      if (a == "- All -") return -1
      if (b == "- All -") return 1
      return (Number(a) < Number(b) ? -1 : 1)
    })
    newstate.monthArr.sort((a,b) => {
      if (a === b) return 0
      if (a == "- All -") return -1
      if (b == "- All -") return 1
      return (new Date(a) < new Date(b) ? -1 : 1)
    })
    newstate.city.sort()
    this.setState(newstate)
  }

  async getMonthArr() {
    var monthArr = []
    await getDistinctValues("updated_at").then(vals => {
      monthArr = vals.map(v=> {
        const d = new Date(v)
        return d.getFullYear() + '-' + (d.getMonth()+1) + '-01'
      })
    })

    return monthArr.filter((v,i)=> {return monthArr.indexOf(v) === i})
  }

  async getResult(groupBy, query) {
    let result
    await new Promise((resolve, reject) => {
      fetch('/api/filter/'+groupBy+'?'+query).then(res=> {
        resolve(res.json())
      })
    }).then(res => result = res)
  
    result.sort((a,b)=> (a._id < b._id ? -1 : (a._id > b._id ? 1 : 0)))
    return result
  }
  
  async onFilterFieldChange(id, value) {
    var newState = this.state
    newState[id+'Value'] = value
    if (id === 'city') {
      newState.neighborhood = this.initializeState.neighborhood.concat(await getDistinctValues('neighborhood', 'city=$eq:"'+value+'"'))
      newState.neighborhood.sort()
      newState.neighborhoodValue = null
    }

    this.setState(newState)
  }

  getFilter() {
    const {cityValue,neighborhoodValue,fromRoomsValue,toRoomsValue,monthValue,floorValue,addressValue} = this.state
    var query = 'sqMr=$ne:0&room=$ne:0'
    if (cityValue != null && cityValue != '- All -') {
      query += '&city=$eq:"'+cityValue +'"'
    }
    if (neighborhoodValue != null && neighborhoodValue != '- All -') {
      query += '&neighborhood=$eq:"' + neighborhoodValue + '"'
    }
    if (floorValue != null && floorValue != '- All -') {
      query += '&floor=$eq:' + floorValue
    }
    if (monthValue != null && monthValue != '- All -') {
      var d = new Date(monthValue)
      d.setMonth(d.getMonth()+1)
      query += '&price.date=$gte:"'+monthValue +'",$lte:"'+d.toISOString()+'"'
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

    if (addressValue != null) {
      query += '&address=$regex:"' + addressValue + '"'
    }

    const {longitudeValue, latitudeValue, radiusValue} = this.state
    if ([longitudeValue, latitudeValue, radiusValue].every(el=> el != null && el != '')) {
      query += '&distance=$lt:'+radiusValue
      query += '&distanceCalc="lon":'+longitudeValue+',"lat":'+latitudeValue
    }

    return query
  }

  async submitForm() {
    var newState = this.state
    var query = this.getFilter()

    newState.result = []
    this.setState(newState)

    newState.result = await this.getResult('city', query)
    this.setState(newState)
  }

  async drillDown(parentType, parentName, childType, resultTableId, grandParentType, grandParentName) {
    var newState = this.state
    var query = this.getFilter()
    var arr = [{type: parentType, name:parentName},{type:grandParentType, name:grandParentName}]
    arr.forEach(el => {
      if (el.type == null) return true
      if (query.indexOf('&'+el.type+'=') != -1)
        query = query.replace(new RegExp('(?<=&'+el.type+'=)'), '$eq:"'+el.name+'",')
      else
        query += '&'+el.type+'=$eq:"'+el.name+'"'
    })
    const data = await this.getResult(childType, query)

    ReactDOM.render(
      <React.StrictMode>
        <Table type={childType} data={data} drillDown={this.drillDown.bind(this)} parentType={parentType} parentName={parentName} />
      </React.StrictMode>,
      document.getElementById(resultTableId)
    );

    this.setState(newState)
  }

  render() {
    const {neighborhood,city,result,monthArr,floor} = this.state
    try {
      return (
        <div>
        <FilterForm neighborhoodValues={neighborhood} cityValues={city} submitForm={this.submitForm.bind(this)} onFilterFieldChange={this.onFilterFieldChange.bind(this)} monthArr={monthArr} floor={floor} />
        <Table type="city" data={result} drillDown={this.drillDown.bind(this)} />
        </div>
      )
    }
    catch(e) {

    }
  }
}

export default App;
