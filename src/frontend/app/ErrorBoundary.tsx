import { Component, ReactNode } from 'react';
import { Button } from '../components/ui/Button.tsx';

interface Props {
  children: ReactNode;
  title: string;
  retryLabel: string;
  homeLabel: string;
  onHome: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 py-24"
      >
        <p className="small-caps">Error</p>
        <h1 className="mt-3 font-display text-4xl">{this.props.title}</h1>
        <p className="mt-3 text-text-muted">{this.state.error.message}</p>
        <div className="mt-8 flex gap-3">
          <Button onClick={() => this.setState({ error: null })}>
            {this.props.retryLabel}
          </Button>
          <Button variant="secondary" onClick={this.props.onHome}>
            {this.props.homeLabel}
          </Button>
        </div>
      </main>
    );
  }
}
