import React, { Component } from 'react'

const TableHeader = (props) => {
    const {type} = props
    switch (type) {
        case "city":
            return <TableHeaderCity />
            break
        default:
            return null
            break
    }

    return null
}

const TableHeaderCity = () => {
    return (
        <thead>
            <tr>
                <th>City</th>
                <th>Average Per Sq. Mr.</th>
                <th>Average Per Room</th>
                <th>Sample Number</th>
            </tr>
        </thead>
    )
}

const TableBody = props => {
    const {type} = props
    const {data} = props
    switch (type) {
        case "city":
            return <TableBodyCity data={data} />
            break
    }

    return null
}

const TableBodyCity = (props) => {
    const {data} = props
    const rows = data.map((el, indx) => {
        return (
            <tr>
                <td>{el._id}</td>
                <td>{el.avgSqmr.toFixed(2)}</td>
                <td>{el.avgPerRoom.toFixed(2)}</td>
                <td>{el.count}</td>
            </tr>
        )
    })
    return <tbody>{rows}</tbody>
}

class Table extends Component {
    render() {
        const {data} = this.props
        const {type} = this.props
        return (
            <table>
                <TableHeader type={type} />
                <TableBody type={type} data={data} />
            </table>
        )
    }
}

export default Table;