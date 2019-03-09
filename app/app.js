import { h, app } from 'hyperapp'
import './style.scss'
import { BaseEmitter } from 'kuker-emitters'

const kuker = BaseEmitter()

/** @jsx h */

const state = {
  count: 0
}

const view = (state, actions) => {
  return (
    <main>
      <h1>{state.count}</h1>
      <button data-cy='down' onclick={actions.down} disabled={state.count <= 0}>
        ー
      </button>
      <button data-cy='up' onclick={actions.up}>
        ＋
      </button>
    </main>
  )
}

const actions = {
  down: e => state => {
    const newState = {
      ...state,
      count: state.count - 1
    }
    kuker({
      type: 'count',
      label: 'down',
      state: newState,
      icon: 'fa-arrow-down',
      color: '#ff0000'
    })
    return newState
  },
  up: e => state => {
    const newState = {
      ...state,
      count: state.count + 1
    }
    kuker({
      type: 'count',
      label: 'up',
      state: newState,
      icon: 'fa-arrow-up',
      color: '#00ff00'
    })
    return newState
  }
}

app(state, actions, view, document.getElementById('app'))
