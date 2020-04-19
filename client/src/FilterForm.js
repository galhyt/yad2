import React, { Component } from 'react'

const Dropdown = props => {
    const {values} = props
    const {id} = props

    const options = values.map((val, i) => {
        return <option value="{val}" key="{i}">{val}</option>
    })

    return <select id={id} name={id}>{options}</select>
}

class FilterForm extends Component {
    render() {
        const {neighborhoodValues} = this.props
        const {cityValues} = this.props
        const {submitForm} = this.props
        return (
            <div className="FilterForm">
                <div>City: <Dropdown values={cityValues} id="city" /></div>
                <div>Neighborhood: <Dropdown values={neighborhoodValues} id="neighborhhod" /></div>
                <button onClick={submitForm}>Submit</button>
            </div>
        )
    }
}

export default FilterForm