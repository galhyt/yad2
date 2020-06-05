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
    componentDidMount() {
        document.onclick = event => {
            const self = event.target
            if ([...self.classList].indexOf('tooltip_ext') != -1) {
                self.previousSibling.classList.toggle('show')
            }
        }
    }

    onDrillClick(event) {
        const el = event.target
        const toOpen = el.className.indexOf('drillopen') !=-1
        var className = (toOpen ? "drillclose" : "drillopen")
        el.className = "drillDown " + className

        const {drillDown} = this.props
        const {type, typeid, child} = el.attributes
        const {idattrib, parentType, parentName, avgSqmr, avgPerRoom} = el.attributes
        const id = (typeof(idattrib) != 'undefined' ? idattrib.nodeValue : null)
        const parentTypeAttrib = (typeof(parentType) != 'undefined' ? parentType.nodeValue : null)
        const parentNameAttrib = (typeof(parentName) != 'undefined' ? parentName.nodeValue : null)
        const avgSqmrAttrib = (typeof(avgSqmr) != 'undefined' ? avgSqmr.nodeValue : null)
        const avgPerRoomAttrib = (typeof(avgPerRoom) != 'undefined' ? avgPerRoom.nodeValue : null)
        const drillElem = document.getElementById(id)
        if (toOpen) {
            if (drillElem.innerHTML == '')
                drillDown(type.nodeValue, typeid.nodeValue, child.nodeValue, id, parentTypeAttrib, parentNameAttrib, avgPerRoomAttrib, avgSqmrAttrib)
            else
                drillElem.style.display = 'block'
        }
        else
            drillElem.style.display = 'none'
    }

    getDiverseCls(el, diverseType) {
        return (el.diverse[diverseType] < 0 ? 'down_arrow' : 'up_arrow')
    }

    getDiverseTooltip(el, diverseType) {
        if (el.diverse == null) return null

        const parentAvg = (diverseType == 'avgSqmr' ? el.diverse.parentAvgSqmr : el.diverse.parentAvgPerRoom)
        const diverseVal = (diverseType == 'avgSqmr' ? el.diverse.avgSqmr : el.diverse.avgPerRoom)
        const perc = (diverseVal / parentAvg) * 100
        return (perc > 0 ? '+' : '') + perc.toFixed(2) + '%'
    }

    getAvgContent(el, diverseType) {
        const avg = el[diverseType]
        var content = <span>{avg.toFixed(2)}</span>
        if (el.diverse != null) {
            const tooltipTxt = this.getDiverseTooltip(el, diverseType)
            content = [content, <span className="tooltiptext">{tooltipTxt}</span>,
            <span className={this.getDiverseCls(el, diverseType) + ' tooltip_ext'}></span>]
        }

        return content
    }

    render() {
        const {data} = this.props
        const {drillDown, parentType, parentName} = this.props
        const {type} = this.props
        let child = drillDic[type]
        const rows = data.map((el, indx) => {
            const id = type + "_" + el._id + "_" + child + "_" + indx
            var content = (<tr key={"row_"+id}>
                            <td onClick={this.onDrillClick.bind(this)} type={type} typeid={el._id} child={child} idattrib={id} parentType={parentType} parentName={parentName} avgPerRoom={el.avgPerRoom} avgSqmr={el.avgSqmr} className={(child != null ? "drillDown drillopen" : '')}></td>
                            <td>{el._id}</td>
                            <td>{this.getAvgContent(el, 'avgSqmr')}</td>
                            <td>{this.getAvgContent(el, 'avgPerRoom')}</td>
                            <td>{el.count}</td>
                        </tr>)
            if (child != null) {
                content = [content,
                    <tr key={"drill_"+id}>
                        <td></td>
                        <td colSpan="4">
                            <div id={id}></div>
                        </td>
                    </tr>
                ]
            }

            return content
        })
        return <tbody>{rows}</tbody>
    }
}

class Table extends Component {
    render() {
        const {data} = this.props
        const {type} = this.props
        const {drillDown, parentType, parentName} = this.props
        return (
            <BootstrapTable className={type} striped bordered hover size="sm">
                <TableHeader type={type} />
                <TableBody type={type} data={data} drillDown={drillDown} parentType={parentType} parentName={parentName} />
            </BootstrapTable>
        )
    }
}

export default Table;