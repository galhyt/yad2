import React, { Component } from 'react'
import './Table.css';

const TableHeader = (props) => {
    const {type} = props
    return (
        <thead>
            <tr>
                <th>{type}</th>
                <th>Average Per Sq. Mr.</th>
                <th>Average Per Room</th>
                <th>Sample Number</th>
            </tr>
        </thead>
    )
}

const drillDic = {
    'city': 'neighborhood',
    'neighborhood': 'address'
}

const TableBody = (props) => {
    const {data} = props
    const {drillDown} = props
    const {type} = props
    let child = drillDic[type]
    const rows = data.map((el, indx) => {
        if (child != null) {
            const id = child + "_" + indx
            return (
                <tr key={indx}>
                    <td onClick={drillDown.bind(this, type, el._id, child, id)}><div className="drillDown"></div><div className="drilldownTable" id={id}></div></td>
                    <td>{el._id}</td>
                    <td>{el.avgSqmr.toFixed(2)}</td>
                    <td>{el.avgPerRoom.toFixed(2)}</td>
                    <td>{el.count}</td>
                </tr>
            )
        }
        else {
            return (
                <tr key={indx}>
                    <td>{el._id}</td>
                    <td>{el.avgSqmr.toFixed(2)}</td>
                    <td>{el.avgPerRoom.toFixed(2)}</td>
                    <td>{el.count}</td>
                </tr>
            )
        }
    })
    return <tbody>{rows}</tbody>
}

class Table extends Component {
    render() {
        const {data} = this.props
        const {type} = this.props
        const {drillDown} = this.props
        return (
            <table>
                <TableHeader type={type} />
                <TableBody type={type} data={data} drillDown={drillDown} />
            </table>
        )
    }
}

export default Table;