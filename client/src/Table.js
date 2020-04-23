import React, { Component } from 'react'
import BootstrapTable from 'react-bootstrap/Table'
import './Table.css';

const hebrew = {
    'city': 'עיר',
    'neighborhood': 'שכונה'
}

const TableHeader = (props) => {
    const {type} = props
    return (
        <thead>
            <tr>
                <th></th>
                <th>{hebrew[type]}</th>
                <th>ממוצע למ"ר</th>
                <th>ממוצע לחדר</th>
                <th>גודל מדגם</th>
            </tr>
        </thead>
    )
}

const drillDic = {
    'city': 'neighborhood',
    'neighborhood': 'address'
}

class TableBody extends Component {
    onDrillClick(event) {
        const el = event.target
        const toOpen = el.className.indexOf('drillopen') !=-1
        var className = (toOpen ? "drillclose" : "drillopen")
        el.className = "drillDown " + className

        const {drillDown} = this.props
        const {type, typeid, child} = el.attributes
        const {idattrib} = el.attributes
        const id = idattrib.nodeValue
        const drillElem = document.getElementById(id)
        if (toOpen) {
            if (drillElem.innerHTML == '')
                drillDown(type.nodeValue, typeid.nodeValue, child.nodeValue, id)
            else
                drillElem.style.display = 'block'
        }
        else
            drillElem.style.display = 'none'
    }

    render() {
        const {data} = this.props
        const {drillDown} = this.props
        const {type} = this.props
        let child = drillDic[type]
        const rows = data.map((el, indx) => {
            const id = type + "_" + el._id + "_" + child + "_" + indx
            if (child != null) {
                return (
                    <><tr key={"row_"+id}>
                        <td onClick={this.onDrillClick.bind(this)} type={type} typeid={el._id} child={child} idattrib={id} className="drillDown drillopen"></td>
                        <td>{el._id}</td>
                        <td>{el.avgSqmr.toFixed(2)}</td>
                        <td>{el.avgPerRoom.toFixed(2)}</td>
                        <td>{el.count}</td>
                    </tr>
                    <tr key={"drill_"+id}>
                        <td></td>
                        <td colSpan="4">
                            <div id={id}></div>
                        </td>
                    </tr></>
                )
            }
            else {
                return (
                    <tr key={"row_"+id}>
                        <td></td>
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
}

class Table extends Component {
    render() {
        const {data} = this.props
        const {type} = this.props
        const {drillDown} = this.props
        return (
            <BootstrapTable className={type} striped bordered hover size="sm">
                <TableHeader type={type} />
                <TableBody type={type} data={data} drillDown={drillDown} />
            </BootstrapTable>
        )
    }
}

export default Table;