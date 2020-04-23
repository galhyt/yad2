import React, { Component } from 'react'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import "./FilterForm.css"
// const Col = BootstrapForm.Col
// const Row = BootstrapForm.Row

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
        
        return <Form.Control as="select" id={id} name={id} onChange={this.handleChange.bind(this)}>{options}</Form.Control>
    }
}

class FilterForm extends Component {
    render() {
        const {neighborhoodValues,cityValues,submitForm,onFilterFieldChange} = this.props
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
                        <Button onClick={submitForm} className="mr-1">Submit</Button>
                    </Form.Group>
                </Form.Row>
            </Form>
        )
    }
}

export default FilterForm