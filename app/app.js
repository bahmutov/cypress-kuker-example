import { h, app } from 'hyperapp'
import './style.scss'

/** @jsx h */

const state = {
  count: 0
}

const view = (state, actions) => {
  return (
    <main>
      <h1>{state.count}</h1>
      <button onclick={actions.down} disabled={state.count <= 0}>
        ー
      </button>
      <button onclick={actions.up}>＋</button>
    </main>
  )
}

const actions = {
  down: e => state => {
    return { count: state.count - 1 }
  },
  up: e => state => {
    return { count: state.count + 1 }
  }
}

app(state, actions, view, document.getElementById('app'))
