import React, { Component } from 'react'

const Dropdown = props => {
    const {values} = this.props
    const {id} = this.props

    const options = values.map((val, i) => {
        return <option value="{val}">{val}</option>
    })

    return <select id={id} name={id}>{options}</select>
}

class FilterForm extends Component {
    render() {
        const {neighborhoodValues} = this.props
        return <Dropdown values={neighborhoodValues} id="neighborhhod" />
    }
}

export default FilterForm