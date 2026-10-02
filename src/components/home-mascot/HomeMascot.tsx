import { useId } from 'react';
import { Codex, Football } from './mascots';
import './mascot.css';

export type HomeMascotProps = { suspended?: boolean };

/** A single, pointer-transparent football kick-up loop at the foot of the scene. */
export function HomeMascot({ suspended = false }: HomeMascotProps) {
  const id = useId().replace(/:/g, '');

  return (
    <div className="home-mascot" data-paused={suspended ? 'true' : 'false'} aria-hidden="true">
      <div className="kickup-stage">
        <div className="kickup-player">
          <Codex id={`${id}-kickup-player`} />
        </div>
        <div className="kickup-ball">
          <Football id={`${id}-kickup-football`} />
        </div>
      </div>
    </div>
  );
}