import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: boolean }

export class Boundary extends Component<Props, State> {
  state: State = { error: false }

  static getDerivedStateFromError(): State {
    return { error: true }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="scene trouble">
          <p className="kicker">ციმციმი</p>
          <h1 className="display">შუქები ახამხამდა.</h1>
          <button type="button" className="seal solid" onClick={() => window.location.reload()}>
            ღამე ხელახლა აანთე
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
