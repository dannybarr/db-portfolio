import { useId } from 'react';
import { Claude, Codex, Football, Grok } from './mascots';
import './mascot.css';

export type HomeMascotProps = { suspended?: boolean };

/** A pointer-transparent three-mascot kick-up loop at the foot of the scene. */
export function HomeMascot({ suspended = false }: HomeMascotProps) {
  const id = useId().replace(/:/g, '');

  return (
    <div className="home-mascot" data-paused={suspended ? 'true' : 'false'} aria-hidden="true">
      <div className="kickup-stage">
        <div className="kickup-player kickup-player--claude">
          <Claude id={`${id}-kickup-claude`} />
        </div>
        <div className="kickup-player kickup-player--codex">
          <Codex id={`${id}-kickup-codex`} />
        </div>
        <div className="kickup-player kickup-player--grok">
          <Grok id={`${id}-kickup-grok`} />
        </div>
        <div className="kickup-ball">
          <Football id={`${id}-kickup-football`} />
        </div>
      </div>
    </div>
  );
}