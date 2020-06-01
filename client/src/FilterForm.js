import React, { Component } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import "./FilterForm.css"

class FilterElem extends Component {
    id = null

    handleChange(e) {
        this.props.onFilterFieldChange(this.id, e.target.value)
    }
}

class FilterNumber extends FilterElem {
    render() {
        const {id} = this.props
        this.id = id
        
        return <Form.Control as="input" type="number" id={id} name={id} onChange={this.handleChange.bind(this)} className="number" />
    }
}

class Dropdown extends FilterElem {
    txt(val) {
        return val
    }

    render() {
        const {values} = this.props
        const {id} = this.props
        this.id = id
        const options = values.map((val, i) => {
            return <option value={val} key={i}>{this.txt(val)}</option>
        })
        
        return <Form.Control as="select" id={id} name={id} onChange={this.handleChange.bind(this)}>{options}</Form.Control>
    }
}

class MonthDropdown extends Dropdown {
    txt(val) {
        return val.replace('-01', '')
    }
}

class FilterForm extends Component {
    render() {
        const {neighborhoodValues,cityValues,submitForm,onFilterFieldChange,monthArr,floor} = this.props
        return (
            <Form>
                <Form.Row>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>City</Form.Label>
                        <Dropdown values={cityValues} id="city" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>Neighborhood</Form.Label>
                        <Dropdown values={neighborhoodValues} id="neighborhood" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>From no. of rooms</Form.Label>
                        <FilterNumber id="fromRooms" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>To no. of rooms</Form.Label>
                        <FilterNumber id="toRooms" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>Month</Form.Label>
                        <MonthDropdown values={monthArr} id="month" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>Floor</Form.Label>
                        <Dropdown values={floor} id="floor" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Button onClick={submitForm} className="mr-1">Submit</Button>
                    </Form.Group>
                </Form.Row>
                {/* <Form.Row>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>Longitude</Form.Label>
                        <FilterNumber id="longitude" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>Latitude</Form.Label>
                        <FilterNumber id="latitude" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Form.Label>Radius</Form.Label>
                        <FilterNumber id="radius" onFilterFieldChange={onFilterFieldChange} />
                    </Form.Group>
                    <Form.Group as={Form.Col} className="FormGroup">
                        <Button onClick={submitForm} className="mr-1">Submit</Button>
                    </Form.Group>
                </Form.Row> */}
            </Form>
        )
    }
}

export default FilterForm