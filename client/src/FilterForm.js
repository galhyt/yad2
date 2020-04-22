import React, { Component } from 'react'
import './FilterForm.css';

class Dropdown extends Component {
    id = null
    
    handleChange(e) {
        this.props.onFilterFieldChange(this.id, e.target.value)
    }

    render() {
        const {values} = this.props
        const {id} = this.props
        this.id = id
        const options = values.map((val, i) => {
            return <option value={val} key={i}>{val}</option>
        })
        
        return <select id={id} name={id} onChange={this.handleChange.bind(this)}>{options}</select>
    }
}

class FilterForm extends Component {
    render() {
        const {neighborhoodValues,cityValues,submitForm,onFilterFieldChange} = this.props
        return (
            <div className="FilterForm">
                <div>City: <Dropdown values={cityValues} id="city" onFilterFieldChange={onFilterFieldChange} /></div>
                <div>Neighborhood: <Dropdown values={neighborhoodValues} id="neighborhhod" onFilterFieldChange={onFilterFieldChange} /></div>
                <button onClick={submitForm}>Submit</button>
            </div>
        )
    }
}

export default FilterForm