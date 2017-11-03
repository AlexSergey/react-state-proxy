import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class StateManager extends Component {
    componentWillMount() {
        this.data = this.props.data || {};
        this.proxify({props: this, val: 'data'});
    }

    proxify = ({props, val}) => {
        Object.keys(props[val])
            .filter(prop => typeof props[val][prop] === 'object' || Array.isArray(props[val][prop]))
            .map(prop => ({props: props[val], val: prop}))
            .forEach(item => this.proxify(item));

        props[val] = this._makeProxy(props[val]);
    };

    _makeProxy = props => {
        return new Proxy(props, {
            set: (target, key, args) => {
                if (typeof args  === 'object' || Array.isArray(args)) {
                    target[key] = args;
                    this.proxify({props: target, val: key});
                }
                else {
                    target[key] = args;
                }

                setTimeout(this.forceUpdate.bind(this));
                return true;
            },

            deleteProperty: (oTarget, key) => {
                setTimeout(this.forceUpdate.bind(this));
                return true;
            }
        });
    };

    render() {
        return this.props.children(this.data);
    }
}
StateManager.propTypes = {
    data: PropTypes.object.isRequired
};

class App extends Component {
    render() {
        return <StateManager
            data={{
                state: {}
            }}>
            {store => <div>
                <button onClick={() => store.state = {
                    todo: {
                        items: [
                            {name: 'Get data', state: 'in-progress'},
                            {name: 'Bind proxy to all', state: 'in-progress'},
                            {name: 'Force update root component', state: 'in-progress'},
                            {name: 'Update data in children', state: 'in-progress'}
                        ],
                        filter: ''
                    }}
                }>Load todolist</button>

                <hr/>

                <div>
                    {
                        store.state.todo &&
                        store.state.todo.items &&
                        [
                            <ul key="todolist">
                                {
                                    store.state.todo.items
                                        .map((item, index) =>
                                            <li
                                                hidden={!(store.state.todo.filter === '' || item.state === store.state.todo.filter)}
                                                style={item.state === 'done' ? {
                                                    textDecoration: 'line-through'
                                                } : {}}
                                                key={index}>
                                                {item.name}
                                                {item.state === 'done' ?
                                                    <button onClick={() => {console.log(index);store.state.todo.items[index].state = 'in-progress'}}>Set to in progress</button> :
                                                    <button onClick={() => store.state.todo.items[index].state = 'done'}>Set to done</button>}
                                                <button onClick={() => store.state.todo.items.splice(index, 1)}>Remove</button>
                                            </li>
                                        )
                                }
                            </ul>,
                            <div key="add-new">
                                <input type="text" ref={c => this.input = c} />
                                <button onClick={() => {
                                    if (this.input && !!this.input.value) {
                                        store.state.todo.items.push({name: this.input.value, state: 'in-progress'});
                                        this.input.value = '';
                                    }
                                }}>Add new item</button>
                            </div>,
                            <select key="filter" onChange={e => store.state.todo.filter = e.target.value}>
                                <option key="all" value="">All</option>
                                <option key="in-progress" value="in-progress">In progress</option>
                                <option key="done" value="done">Done</option>
                            </select>
                        ]
                    }
                </div>

                <br/>
                <br/>
                <br/>
                <hr/>
                <h3>State:</h3>
                <pre>{JSON.stringify(store, true , 2)}</pre>
            </div>
            }
        </StateManager>
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));